import { Link } from "react-router-dom";
import JsonLd from "@/components/JsonLd";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SeoBreadcrumbsProps {
  items: BreadcrumbItem[];
}

const SITE_URL = "https://www.wishspark.xyz";

const SeoBreadcrumbs = ({ items }: SeoBreadcrumbsProps) => {
  const allItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span aria-hidden="true" className="text-muted-foreground/50">›</span>
                )}
                {isLast || !item.href ? (
                  <span className="text-foreground font-medium" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: allItems.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href
              ? { item: `${SITE_URL}${item.href}` }
              : {}),
          })),
        }}
      />
    </>
  );
};

export default SeoBreadcrumbs;
