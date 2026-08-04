import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  /**
   * e.g. "/products", "/products/furnishings", or "/admin/products?category=x"
   * — page links append "page=N" as a query param, joined with "?" or "&"
   * depending on whether basePath already has a query string.
   */
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const sep = basePath.includes("?") ? "&" : "?";
  const hrefFor = (p: number) => (p <= 1 ? basePath : `${basePath}${sep}page=${p}`);

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex items-center justify-center gap-6 border-t border-line pt-8"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="flex items-center gap-1.5 text-[12px] tracking-[0.1em] uppercase text-charcoal hover:text-bronze-dark transition-colors"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          Previous
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 text-[12px] tracking-[0.1em] uppercase text-charcoal-soft/40">
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          Previous
        </span>
      )}

      <span className="text-[12px] tracking-[0.08em] text-charcoal-soft tabular-nums">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className="flex items-center gap-1.5 text-[12px] tracking-[0.1em] uppercase text-charcoal hover:text-bronze-dark transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 text-[12px] tracking-[0.1em] uppercase text-charcoal-soft/40">
          Next
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </span>
      )}
    </nav>
  );
}
