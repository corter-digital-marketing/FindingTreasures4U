import Link from "next/link";
import { LayoutGrid, LogOut, Package, Receipt } from "lucide-react";
import { logout } from "../login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ivory">
      <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-line bg-paper">
        <div className="p-6 border-b border-line">
          <Link href="/admin" className="flex flex-col leading-none">
            <span className="font-serif-display text-xl text-charcoal">
              Finding <em className="italic text-bronze-dark">Treasures</em>
            </span>
            <span className="text-[9px] tracking-[0.28em] uppercase text-charcoal-soft mt-1">
              Admin
            </span>
          </Link>
        </div>
        <nav className="p-4 flex flex-wrap md:flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-charcoal hover:bg-ivory-dim transition-colors"
            >
              <Icon className="w-4 h-4 text-bronze-dark" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
          <form action={logout} className="md:mt-4">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-charcoal-soft hover:text-oxblood transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Sign Out
            </button>
          </form>
        </nav>
        <div className="hidden md:block p-4 mt-auto border-t border-line">
          <Link href="/" className="text-[12px] text-charcoal-soft hover:text-bronze-dark link-underline">
            View Live Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
