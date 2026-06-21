import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { orderToSupplierWorkflow } from "../workflows/order-to-supplier"

/**
 * Subscriber: order.placed
 *
 * Fires whenever a new order is finalized (payment captured).
 * Triggers the order-to-supplier workflow which:
 *   - Routes order items to each Yupoo supplier via email + CSV
 *   - Emits Klaviyo "Order Placed" event
 *   - Fires Meta CAPI + TikTok server-side purchase events
 */
export default async function orderPlacedSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId: string = data.id

  console.log(`[order.placed subscriber] Triggering order-to-supplier workflow for order: ${orderId}`)

  try {
    const { result } = await orderToSupplierWorkflow(container).run({
      input: { orderId },
    })

    if (result.errors.length > 0) {
      console.error(
        `[order.placed subscriber] Workflow completed with errors for order ${orderId}:`,
        result.errors
      )
    } else {
      console.log(
        `[order.placed subscriber] Workflow complete for order ${orderId}. ` +
          `Notified suppliers: ${result.suppliersNotified.join(", ") || "none"}`
      )
    }
  } catch (err: any) {
    console.error(
      `[order.placed subscriber] Workflow failed for order ${orderId}:`,
      err?.message ?? err
    )
    // Do not rethrow — we don't want a failed supplier notification to roll back
    // the order. Ops team should monitor error logs and retry manually.
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
