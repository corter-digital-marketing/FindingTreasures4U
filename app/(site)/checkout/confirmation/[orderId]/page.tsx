import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <Container className="py-20 md:py-28 max-w-2xl">
      <CheckCircle2 className="w-9 h-9 text-bronze-dark mb-6" strokeWidth={1.25} />
      <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
        Request Received
      </p>
      <h1 className="font-serif-display text-4xl md:text-[3rem] text-charcoal leading-tight">
        Thank you, {order.customerName.split(" ")[0]}.
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-charcoal-soft">
        We&apos;ve reserved the pieces below and received your shipping details. Our team will
        email you at <span className="text-charcoal">{order.email}</span> within one business day
        to confirm secure payment and arrange packing and shipping.
      </p>

      <div className="mt-10 border-t border-line">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-4 border-b border-line-soft text-[14px]"
          >
            <span className="text-charcoal">{item.nameSnapshot}</span>
            <span className="text-charcoal-soft tabular-nums">{formatPrice(item.priceCents)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-4 text-[15px]">
          <span className="text-charcoal">Subtotal</span>
          <span className="text-charcoal tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 text-[13px]">
        <div>
          <h2 className="text-[11px] tracking-[0.14em] uppercase text-charcoal-soft mb-2">
            Order Reference
          </h2>
          <p className="text-charcoal">{order.id}</p>
          <p className="text-charcoal-soft mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <h2 className="text-[11px] tracking-[0.14em] uppercase text-charcoal-soft mb-2">
            Shipping To
          </h2>
          <p className="text-charcoal leading-relaxed">
            {order.addressLine1}
            {order.addressLine2 ? `, ${order.addressLine2}` : ""}
            <br />
            {order.city}, {order.region} {order.postalCode}
            <br />
            {order.country}
          </p>
        </div>
      </div>

      <Link
        href="/products"
        className="link-underline mt-12 inline-flex items-center gap-1.5 text-[13px] tracking-[0.14em] uppercase text-charcoal"
      >
        Continue Browsing
      </Link>
    </Container>
  );
}
