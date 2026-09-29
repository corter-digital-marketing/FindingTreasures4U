import { Resend } from "resend";
import { formatPrice } from "@/lib/format";
import { STORE_ADDRESS } from "@/lib/store";

const FROM_ADDRESS = "Finding Treasures 4 U <orders@findingtreasures4u.com>";

type OrderForEmail = {
  id: string;
  deliveryMethod: "SHIPPING" | "PICKUP";
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
  shippingCents: number;
  items: { nameSnapshot: string; priceCents: number }[];
};

function resendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — skipping email send.");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function itemsListHtml(order: OrderForEmail) {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 0;">${item.nameSnapshot}</td><td style="padding:4px 0;text-align:right;">${formatPrice(item.priceCents)}</td></tr>`
    )
    .join("");
  const shippingRow =
    order.shippingCents > 0
      ? `<tr><td style="padding:4px 0;">Shipping</td><td style="padding:4px 0;text-align:right;">${formatPrice(order.shippingCents)}</td></tr>`
      : "";
  return rows + shippingRow;
}

function deliveryHtml(order: OrderForEmail) {
  if (order.deliveryMethod === "PICKUP") {
    return `<strong>In-Store Pickup</strong><br>Finding Treasures 4 U<br>${STORE_ADDRESS}`;
  }
  return `<strong>Shipping To</strong><br>${addressHtml(order)}`;
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
            ${itemsListHtml(order)}
            <tr><td style="padding-top:8px;font-weight:bold;">Total</td><td style="padding-top:8px;text-align:right;font-weight:bold;">${formatPrice(order.totalCents)}</td></tr>
          </table>
          <p>${deliveryHtml(order)}</p>
          ${order.notes ? `<p><strong>Notes</strong><br>${order.notes}</p>` : ""}
          <p style="color:#6a5f4f;font-size:13px;">Order ID: ${order.id}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send owner order notification email:", error);
  }
}

type ShippingQuoteEmailOrder = {
  id: string;
  customerName: string;
  email: string;
  items: { nameSnapshot: string }[];
};

/** Sent to the customer when the owner sends a shipping cost + payment link. */
export async function sendShippingQuoteEmail(
  order: ShippingQuoteEmailOrder,
  checkoutUrl: string,
  quoteCents: number
): Promise<void> {
  const resend = resendClient();
  if (!resend) return;

  const itemNames = order.items.map((i) => i.nameSnapshot).join(", ");

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.email,
      subject: `Shipping is ready for your order — ${formatPrice(quoteCents)}`,
      html: `
        <div style="font-family:sans-serif;color:#241f19;">
          <h2 style="margin:0 0 12px;">Hi ${order.customerName.split(" ")[0]}, shipping is arranged.</h2>
          <p>We've worked out shipping for <strong>${itemNames}</strong>. The cost is
          <strong>${formatPrice(quoteCents)}</strong> — pay securely below and we'll get it on its way.</p>
          <p style="margin:24px 0;">
            <a href="${checkoutUrl}" style="background:#6c2a33;color:#f7f2e7;padding:12px 24px;text-decoration:none;border-radius:2px;display:inline-block;">
              Pay Shipping — ${formatPrice(quoteCents)}
            </a>
          </p>
          <p style="color:#6a5f4f;font-size:13px;">Order reference: ${order.id}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send shipping quote email:", error);
  }
}

/** Sent once the customer actually pays the shipping quote. */
export async function sendShippingQuotePaidNotification(
  order: ShippingQuoteEmailOrder,
  quoteCents: number
): Promise<void> {
  const to = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;
  if (!to) return;

  const resend = resendClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Shipping paid — ${order.customerName} (${formatPrice(quoteCents)})`,
      html: `
        <div style="font-family:sans-serif;color:#241f19;">
          <h2 style="margin:0 0 12px;">Shipping Payment Received</h2>
          <p><strong>${order.customerName}</strong> paid ${formatPrice(quoteCents)} for shipping on:
          ${order.items.map((i) => i.nameSnapshot).join(", ")}.</p>
          <p style="color:#6a5f4f;font-size:13px;">Order ID: ${order.id}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send shipping-quote-paid notification:", error);
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
          <p>Your payment has been received and the piece${order.items.length > 1 ? "s are" : " is"} reserved
          for you. We'll be in touch shortly to ${order.deliveryMethod === "PICKUP" ? "arrange a pickup time" : "arrange shipping"}.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${itemsListHtml(order)}
            <tr><td style="padding-top:8px;font-weight:bold;">Total</td><td style="padding-top:8px;text-align:right;font-weight:bold;">${formatPrice(order.totalCents)}</td></tr>
          </table>
          <p>${deliveryHtml(order)}</p>
          <p style="color:#6a5f4f;font-size:13px;">Order reference: ${order.id}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send customer order confirmation email:", error);
  }
}
