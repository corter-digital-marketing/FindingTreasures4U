import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [totalProducts, activeProducts, soldProducts, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { sold: false } }),
    prisma.product.count({ where: { sold: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Active Listings", value: activeProducts },
    { label: "Sold Pieces", value: soldProducts },
    { label: "Total Catalogued", value: totalProducts },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-bronze-dark mb-2">Overview</p>
          <h1 className="font-serif-display text-3xl text-charcoal">Dashboard</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-oxblood text-ivory px-5 py-3 text-[13px] uppercase tracking-[0.1em] hover:bg-oxblood-dark transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {stats.map((s) => (
          <div key={s.label} className="border border-line p-6 bg-paper">
            <p className="text-[28px] font-serif-display text-charcoal">{s.value}</p>
            <p className="mt-1 text-[12px] tracking-[0.06em] uppercase text-charcoal-soft">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif-display text-xl text-charcoal">Recent Orders</h2>
        <Link
          href="/admin/orders"
          className="link-underline text-[12px] uppercase tracking-[0.1em] text-charcoal-soft flex items-center gap-1"
        >
          View All <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="text-[13px] text-charcoal-soft">No orders yet.</p>
      ) : (
        <div className="border border-line divide-y divide-line bg-paper">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href="/admin/orders"
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4 text-[13px] hover:bg-ivory-dim transition-colors"
            >
              <div className="min-w-0">
                <p className="text-charcoal truncate">{order.customerName}</p>
                <p className="text-charcoal-soft mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[10px] tracking-[0.1em] uppercase text-bronze-dark">
                  {order.status.replace("_", " ")}
                </span>
                <span className="text-charcoal tabular-nums">{formatPrice(order.totalCents)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
