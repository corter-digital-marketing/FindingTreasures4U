import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="p-6 md:p-10">
      <p className="text-[11px] tracking-[0.2em] uppercase text-bronze-dark mb-2">Sales</p>
      <h1 className="font-serif-display text-3xl text-charcoal mb-10">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-[13px] text-charcoal-soft">
          No orders yet. Orders placed through checkout will appear here.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-line bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] text-charcoal">{order.customerName}</p>
                  <p className="text-[12px] text-charcoal-soft mt-0.5">
                    {order.email} {order.phone ? `· ${order.phone}` : ""}
                  </p>
                  <p className="text-[12px] text-charcoal-soft mt-0.5">
                    {formatDate(order.createdAt)} · {order.id}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] text-charcoal tabular-nums">
                    {formatPrice(order.totalCents)}
                  </span>
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-line-soft grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-soft mb-2">
                    Items
                  </p>
                  <ul className="space-y-1 text-[13px] text-charcoal">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-4">
                        <span>{item.nameSnapshot}</span>
                        <span className="tabular-nums text-charcoal-soft">
                          {formatPrice(item.priceCents)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-soft mb-2">
                    Shipping To
                  </p>
                  <p className="text-[13px] text-charcoal leading-relaxed">
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                    <br />
                    {order.city}, {order.region} {order.postalCode}
                    <br />
                    {order.country}
                  </p>
                  {order.notes && (
                    <p className="mt-2 text-[13px] text-charcoal-soft italic">
                      &ldquo;{order.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
