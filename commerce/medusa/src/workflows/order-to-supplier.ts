import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { DROPSHIP_MODULE, DropshipService, SupplierOrderPayload } from "../modules/dropship"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderToSupplierInput {
  orderId: string
}

export interface OrderToSupplierResult {
  orderId: string
  suppliersNotified: string[]
  errors: string[]
}

// ─── Step 1: Fetch the order from Medusa ─────────────────────────────────────

const fetchOrderStep = createStep(
  "fetch-order-step",
  async (input: OrderToSupplierInput, { container }) => {
    const orderModule = container.resolve(Modules.ORDER)

    const order = await orderModule.retrieveOrder(input.orderId, {
      relations: [
        "items",
        "items.variant",
        "items.variant.product",
        "shipping_address",
        "customer",
      ],
    })

    if (!order) {
      throw new Error(`Order ${input.orderId} not found`)
    }

    return new StepResponse({ order })
  }
)

// ─── Step 2: Build the supplier payload ──────────────────────────────────────

const buildSupplierPayloadStep = createStep(
  "build-supplier-payload-step",
  async ({ order }: { order: any }) => {
    const address = order.shipping_address

    if (!address) {
      throw new Error(`Order ${order.id} has no shipping address`)
    }

    // Map Medusa order items to the dropship payload format.
    // supplier_id and supplier_url come from product metadata.
    // These are NEVER returned to customers — they exist only in the
    // server-side workflow.
    const items = (order.items ?? []).map((item: any) => ({
      id: item.id,
      sku: item.variant?.sku ?? item.id,
      title: item.title ?? item.variant?.product?.title ?? "Unknown",
      variantTitle: item.variant?.title ?? "Default",
      quantity: item.quantity,
      supplierId: item.variant?.product?.metadata?.supplier_id ?? undefined,
      supplierUrl: item.variant?.product?.metadata?.supplier_url ?? undefined,
    }))

    const payload: SupplierOrderPayload = {
      orderId: order.id,
      orderDisplayId: String(order.display_id ?? order.id),
      placedAt: new Date(order.created_at),
      customerEmail: order.customer?.email ?? order.email ?? "",
      shippingAddress: {
        firstName: address.first_name ?? "",
        lastName: address.last_name ?? "",
        address1: address.address_1 ?? "",
        address2: address.address_2,
        city: address.city ?? "",
        province: address.province ?? "",
        postalCode: address.postal_code ?? "",
        countryCode: address.country_code ?? "US",
        phone: address.phone,
      },
      items,
    }

    return new StepResponse({ payload })
  }
)

// ─── Step 3: Send supplier notifications ─────────────────────────────────────

const sendSupplierNotificationsStep = createStep(
  "send-supplier-notifications-step",
  async ({ payload }: { payload: SupplierOrderPayload }, { container }) => {
    const dropshipService: DropshipService = container.resolve(DROPSHIP_MODULE)

    const suppliersNotified: string[] = []
    const errors: string[] = []

    // Identify unique suppliers in this order
    const supplierIds = [
      ...new Set(
        payload.items
          .map((i) => i.supplierId)
          .filter((id): id is string => Boolean(id))
      ),
    ]

    if (supplierIds.length === 0) {
      console.warn(
        `[OrderToSupplier] Order ${payload.orderDisplayId} has no items with supplier_id metadata. ` +
          "Check that products were seeded with correct metadata."
      )
    }

    try {
      await dropshipService.routeOrder(payload)
      suppliersNotified.push(...supplierIds)
    } catch (err: any) {
      const msg = `Failed to route order ${payload.orderDisplayId}: ${err?.message ?? err}`
      console.error("[OrderToSupplier]", msg)
      errors.push(msg)
    }

    return new StepResponse({ suppliersNotified, errors })
  }
)

// ─── Step 4: Emit Klaviyo "Order Placed" event ───────────────────────────────

const emitKlaviyoOrderPlacedStep = createStep(
  "emit-klaviyo-order-placed-step",
  async (
    { order, payload }: { order: any; payload: SupplierOrderPayload },
    _context
  ) => {
    const klaviyoApiKey = process.env.KLAVIYO_API_KEY
    if (!klaviyoApiKey) {
      console.warn("[OrderToSupplier] KLAVIYO_API_KEY not set — skipping Klaviyo event.")
      return new StepResponse({ klaviyoStatus: "skipped" })
    }

    // Build Klaviyo Track event payload
    // https://developers.klaviyo.com/en/reference/create_event
    const klaviyoPayload = {
      data: {
        type: "event",
        attributes: {
          properties: {
            OrderId: order.display_id,
            ItemNames: payload.items.map((i) => i.title),
            Subtotal: (order.subtotal ?? 0) / 100,
            Total: (order.total ?? 0) / 100,
            Currency: order.currency_code?.toUpperCase() ?? "USD",
            Items: payload.items.map((item) => ({
              SKU: item.sku,
              ProductName: item.title,
              Variant: item.variantTitle,
              Quantity: item.quantity,
            })),
          },
          time: new Date().toISOString(),
          value: (order.total ?? 0) / 100,
          metric: {
            data: {
              type: "metric",
              attributes: { name: "Order Placed" },
            },
          },
          profile: {
            data: {
              type: "profile",
              attributes: {
                email: payload.customerEmail,
              },
            },
          },
        },
      },
    }

    try {
      const response = await fetch("https://a.klaviyo.com/api/events/", {
        method: "POST",
        headers: {
          accept: "application/json",
          revision: "2024-02-15",
          "content-type": "application/json",
          Authorization: `Klaviyo-API-Key ${klaviyoApiKey}`,
        },
        body: JSON.stringify(klaviyoPayload),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error(`[OrderToSupplier] Klaviyo event failed (${response.status}): ${text}`)
        return new StepResponse({ klaviyoStatus: "error", statusCode: response.status })
      }

      return new StepResponse({ klaviyoStatus: "sent" })
    } catch (err: any) {
      console.error("[OrderToSupplier] Klaviyo fetch error:", err?.message)
      return new StepResponse({ klaviyoStatus: "error", error: err?.message })
    }
  }
)

// ─── Step 5: Fire Meta CAPI + TikTok Events (server-side attribution) ────────

const emitAdAttributionStep = createStep(
  "emit-ad-attribution-step",
  async (
    { order, payload }: { order: any; payload: SupplierOrderPayload },
    _context
  ) => {
    const results: Record<string, string> = {}

    // ── Meta CAPI ──
    const metaPixelId = process.env.META_PIXEL_ID
    const metaToken = process.env.META_CAPI_ACCESS_TOKEN
    if (metaPixelId && metaToken) {
      try {
        const metaBody = {
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              user_data: {
                em: [
                  // In production: hash the email with SHA-256
                  // For now: placeholder — implement hashing before go-live
                  payload.customerEmail,
                ],
              },
              custom_data: {
                currency: order.currency_code?.toUpperCase() ?? "USD",
                value: (order.total ?? 0) / 100,
                contents: payload.items.map((i) => ({
                  id: i.sku,
                  quantity: i.quantity,
                })),
                content_type: "product",
                order_id: String(order.display_id),
              },
            },
          ],
        }

        const metaRes = await fetch(
          `https://graph.facebook.com/v20.0/${metaPixelId}/events?access_token=${metaToken}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(metaBody),
          }
        )
        results.meta = metaRes.ok ? "sent" : `error_${metaRes.status}`
      } catch (err: any) {
        results.meta = `error: ${err?.message}`
      }
    } else {
      results.meta = "skipped (no credentials)"
    }

    // ── TikTok Events API ──
    const tiktokPixelId = process.env.TIKTOK_PIXEL_ID
    const tiktokToken = process.env.TIKTOK_EVENTS_API_TOKEN
    if (tiktokPixelId && tiktokToken) {
      try {
        const tiktokBody = {
          pixel_code: tiktokPixelId,
          event: "PlaceAnOrder",
          timestamp: new Date().toISOString(),
          properties: {
            currency: order.currency_code?.toUpperCase() ?? "USD",
            value: (order.total ?? 0) / 100,
            order_id: String(order.display_id),
            content_type: "product",
            contents: payload.items.map((i) => ({
              content_id: i.sku,
              quantity: i.quantity,
            })),
          },
          context: {
            user: {
              // In production: hash email with SHA-256 before sending
              email: payload.customerEmail,
            },
            ad: {},
          },
        }

        const tiktokRes = await fetch(
          "https://business-api.tiktok.com/open_api/v1.3/pixel/track/",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Access-Token": tiktokToken,
            },
            body: JSON.stringify(tiktokBody),
          }
        )
        results.tiktok = tiktokRes.ok ? "sent" : `error_${tiktokRes.status}`
      } catch (err: any) {
        results.tiktok = `error: ${err?.message}`
      }
    } else {
      results.tiktok = "skipped (no credentials)"
    }

    return new StepResponse({ attribution: results })
  }
)

// ─── Workflow Definition ──────────────────────────────────────────────────────

export const orderToSupplierWorkflow = createWorkflow(
  "order-to-supplier",
  (input: OrderToSupplierInput) => {
    // Step 1: Fetch the full order
    const { order } = fetchOrderStep(input)

    // Step 2: Build normalized payload
    const { payload } = buildSupplierPayloadStep({ order })

    // Steps 3–5 run after payload is ready
    const { suppliersNotified, errors } = sendSupplierNotificationsStep({ payload })
    emitKlaviyoOrderPlacedStep({ order, payload })
    emitAdAttributionStep({ order, payload })

    return new WorkflowResponse<OrderToSupplierResult>({
      orderId: input.orderId,
      suppliersNotified,
      errors,
    })
  }
)
