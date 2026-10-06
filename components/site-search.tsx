import { Search } from "lucide-react";

export function SiteSearch({
  className = "",
  autoFocus = false,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action="/products" method="get" role="search" className={`relative ${className}`}>
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-search"
        type="search"
        name="q"
        autoFocus={autoFocus}
        placeholder="Search the collection"
        maxLength={100}
        className="w-full border-0 border-b border-line bg-transparent py-1.5 pr-7 text-[14px] text-charcoal placeholder:text-charcoal-soft/70 outline-none transition-colors focus:border-bronze-dark"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-charcoal hover:text-bronze-dark transition-colors"
      >
        <Search className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </form>
  );
}
