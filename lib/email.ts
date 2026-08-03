import { Resend } from "resend";
import { formatPrice } from "@/lib/format";

const FROM_ADDRESS = "Finding Treasures 4 U <onboarding@resend.dev>";

type OrderForEmail = {
  id: string;
  customerName: string;
  email: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  notes: string | null;
  totalCents: number;
  items: { nameSnapshot: string; priceCents: number }[];
};

function resendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — skipping email send.");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function itemsListHtml(items: OrderForEmail["items"]) {
  return items
    .map(
      (item) =>
        `<tr><td style="padding:4px 0;">${item.nameSnapshot}</td><td style="padding:4px 0;text-align:right;">${formatPrice(item.priceCents)}</td></tr>`
    )
    .join("");
}

function addressHtml(order: OrderForEmail) {
  return [order.addressLine1, order.addressLine2, `${order.city}, ${order.region} ${order.postalCode}`, order.country]
    .filter(Boolean)
    .join("<br>");
}

/**
 * Emails swallow their own errors — a notification failing to send should
 * never block an order from completing.
 */
export async function sendOrderNotificationToOwner(order: OrderForEmail): Promise<void> {
  const to = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;
  if (!to) {
    console.error("No ORDER_NOTIFICATION_EMAIL or ADMIN_EMAIL set — skipping owner notification.");
    return;
  }

  const resend = resendClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `New order from ${order.customerName} — ${formatPrice(order.totalCents)}`,
      html: `
        <div style="font-family:sans-serif;color:#241f19;">
          <h2 style="margin:0 0 12px;">New Order Received</h2>
          <p><strong>${order.customerName}</strong><br>
          ${order.email}${order.phone ? ` · ${order.phone}` : ""}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${itemsListHtml(order.items)}
            <tr><td style="padding-top:8px;font-weight:bold;">Total</td><td style="padding-top:8px;text-align:right;font-weight:bold;">${formatPrice(order.totalCents)}</td></tr>
          </table>
          <p><strong>Shipping To</strong><br>${addressHtml(order)}</p>
          ${order.notes ? `<p><strong>Notes</strong><br>${order.notes}</p>` : ""}
          <p style="color:#6a5f4f;font-size:13px;">Order ID: ${order.id}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send owner order notification email:", error);
  }
}

export async function sendOrderConfirmationToCustomer(order: OrderForEmail): Promise<void> {
  const resend = resendClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.email,
      subject: "We've received your order — Finding Treasures 4 U",
      html: `
        <div style="font-family:sans-serif;color:#241f19;">
          <h2 style="margin:0 0 12px;">Thank you, ${order.customerName.split(" ")[0]}.</h2>
          <p>We've reserved the piece${order.items.length > 1 ? "s" : ""} below and received your
          shipping details. We'll be in touch shortly to confirm payment and arrange shipping.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${itemsListHtml(order.items)}
            <tr><td style="padding-top:8px;font-weight:bold;">Total</td><td style="padding-top:8px;text-align:right;font-weight:bold;">${formatPrice(order.totalCents)}</td></tr>
          </table>
          <p><strong>Shipping To</strong><br>${addressHtml(order)}</p>
          <p style="color:#6a5f4f;font-size:13px;">Order reference: ${order.id}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send customer order confirmation email:", error);
  }
}
