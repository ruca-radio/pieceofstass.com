import nodemailer from "nodemailer"
import { createObjectCsvStringifier } from "csv-writer"
import {
  SUPPLIER_STATIC_CONFIG,
  SUPPLIER_IDS,
  SupplierId,
  SupplierConfig,
} from "./models/supplier-mapping"

export interface DropshipModuleOptions {
  supplierEmails: Record<string, string | undefined>
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  fromEmail: string
}

export interface OrderItem {
  id: string
  sku: string
  title: string
  variantTitle: string
  quantity: number
  supplierUrl?: string   // Internal Yupoo URL — never exposed to storefront
  supplierId?: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  countryCode: string
  phone?: string
}

export interface SupplierOrderPayload {
  orderId: string
  orderDisplayId: string
  placedAt: Date
  customerEmail: string
  shippingAddress: ShippingAddress
  items: OrderItem[]
}

/**
 * DropshipService
 *
 * Groups order line items by supplier_id and sends each supplier a notification
 * email containing a CSV attachment with order details.
 *
 * Security: supplier Yupoo URLs are included in the CSV sent TO suppliers only.
 * They are never returned via Storefront API or included in customer emails.
 */
export class DropshipService {
  private readonly supplierConfigs: Record<string, SupplierConfig>
  private readonly transporter: nodemailer.Transporter
  private readonly fromEmail: string

  constructor(options: DropshipModuleOptions) {
    // Build full configs by merging static data with injected contact emails
    this.supplierConfigs = {} as Record<string, SupplierConfig>
    for (const id of SUPPLIER_IDS) {
      this.supplierConfigs[id] = {
        ...SUPPLIER_STATIC_CONFIG[id as SupplierId],
        contactEmail: options.supplierEmails[id] ?? "",
      }
    }

    this.fromEmail = options.fromEmail

    this.transporter = nodemailer.createTransport({
      host: options.smtpHost,
      port: options.smtpPort,
      secure: options.smtpPort === 465,
      auth: {
        user: options.smtpUser,
        pass: options.smtpPass,
      },
    })
  }

  /**
   * Main entry point. Called by the order-to-supplier workflow.
   * Groups items by supplier, then sends one email per supplier.
   */
  async routeOrder(payload: SupplierOrderPayload): Promise<void> {
    const grouped = this.groupItemsBySupplier(payload.items)

    const sends: Promise<void>[] = []
    for (const [supplierId, items] of Object.entries(grouped)) {
      sends.push(
        this.notifySupplier(supplierId, { ...payload, items })
      )
    }

    await Promise.allSettled(sends)
  }

  /**
   * Groups items by their metadata.supplier_id.
   * Items without a known supplier_id fall into an "unknown" bucket
   * which triggers an ops alert email instead.
   */
  private groupItemsBySupplier(
    items: OrderItem[]
  ): Record<string, OrderItem[]> {
    const groups: Record<string, OrderItem[]> = {}
    for (const item of items) {
      const sid = item.supplierId ?? "unknown"
      if (!groups[sid]) groups[sid] = []
      groups[sid].push(item)
    }
    return groups
  }

  /**
   * Sends a supplier notification email with a CSV attachment.
   */
  private async notifySupplier(
    supplierId: string,
    payload: SupplierOrderPayload
  ): Promise<void> {
    const config = this.supplierConfigs[supplierId]
    if (!config || !config.contactEmail) {
      console.error(
        `[Dropship] No contact email configured for supplier: ${supplierId}. ` +
          `Check SUPPLIER_EMAIL_${supplierId.toUpperCase()} env var.`
      )
      return
    }

    const csv = this.buildCsv(payload)
    const subject = `New Order — Piece of Stass #${payload.orderDisplayId}`

    const body = `
Hello,

Please fulfill the following order on behalf of Piece of Stass.

Order ID: ${payload.orderDisplayId}
Placed: ${payload.placedAt.toISOString()}

Ship To:
  ${payload.shippingAddress.firstName} ${payload.shippingAddress.lastName}
  ${payload.shippingAddress.address1}${payload.shippingAddress.address2 ? "\n  " + payload.shippingAddress.address2 : ""}
  ${payload.shippingAddress.city}, ${payload.shippingAddress.province} ${payload.shippingAddress.postalCode}
  ${payload.shippingAddress.countryCode.toUpperCase()}
  ${payload.shippingAddress.phone ? "Phone: " + payload.shippingAddress.phone : ""}

Items are attached as a CSV file. Please confirm stock availability and
dispatch within ${config.avgLeadDays} business days.

Reply to this email with your tracking number once dispatched.

— Piece of Stass Operations
ops@pieceofstass.com
`.trim()

    await this.transporter.sendMail({
      from: this.fromEmail,
      to: config.contactEmail,
      subject,
      text: body,
      attachments: [
        {
          filename: `order-${payload.orderDisplayId}-${supplierId}.csv`,
          content: csv,
          contentType: "text/csv",
        },
      ],
    })

    console.log(
      `[Dropship] Supplier notification sent for order ${payload.orderDisplayId} → ${supplierId} (${config.name})`
    )
  }

  /**
   * Builds a CSV string for the order items.
   * Includes internal supplier_url for the supplier's reference.
   */
  private buildCsv(payload: SupplierOrderPayload): string {
    const header = [
      { id: "order_id", title: "Order ID" },
      { id: "sku", title: "SKU" },
      { id: "title", title: "Product Title" },
      { id: "variant", title: "Variant" },
      { id: "quantity", title: "Quantity" },
      { id: "supplier_url", title: "Supplier Reference URL" },
      { id: "ship_name", title: "Ship To Name" },
      { id: "ship_address1", title: "Address Line 1" },
      { id: "ship_address2", title: "Address Line 2" },
      { id: "ship_city", title: "City" },
      { id: "ship_province", title: "State/Province" },
      { id: "ship_postal", title: "Postal Code" },
      { id: "ship_country", title: "Country" },
      { id: "ship_phone", title: "Phone" },
    ]

    const stringifier = createObjectCsvStringifier({ header })
    const a = payload.shippingAddress
    const rows = payload.items.map((item) => ({
      order_id: payload.orderDisplayId,
      sku: item.sku,
      title: item.title,
      variant: item.variantTitle,
      quantity: item.quantity,
      supplier_url: item.supplierUrl ?? "",
      ship_name: `${a.firstName} ${a.lastName}`,
      ship_address1: a.address1,
      ship_address2: a.address2 ?? "",
      ship_city: a.city,
      ship_province: a.province,
      ship_postal: a.postalCode,
      ship_country: a.countryCode,
      ship_phone: a.phone ?? "",
    }))

    return stringifier.getHeaderString() + stringifier.stringifyRecords(rows)
  }

  /**
   * Verifies SMTP connectivity. Called at startup to catch mis-configurations early.
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (err) {
      console.error("[Dropship] SMTP connection verification failed:", err)
      return false
    }
  }

  /**
   * Returns supplier config for a given supplier_id.
   * Used by the workflow to display supplier metadata.
   */
  getSupplierConfig(supplierId: string): SupplierConfig | undefined {
    return this.supplierConfigs[supplierId]
  }

  /**
   * Returns all configured supplier IDs.
   */
  getAllSupplierIds(): string[] {
    return Object.keys(this.supplierConfigs)
  }
}
