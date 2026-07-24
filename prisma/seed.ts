import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({
  url: path.join(process.cwd(), dbUrl.replace(/^file:/, "")),
});
const prisma = new PrismaClient({ adapter });

function placeholder(label: string, w = 1200, h = 1500) {
  const bg = "e9e0cb";
  const fg = "352a20";
  return `https://placehold.co/${w}x${h}/${bg}/${fg}.png?text=${encodeURIComponent(label)}&font=playfair-display`;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const products = [
  {
    slug: "georgian-mahogany-chest-of-drawers",
    name: "Georgian Mahogany Chest of Drawers",
    category: "FURNISHINGS" as const,
    priceCents: 285000,
    description:
      "A handsome late-Georgian chest in flame mahogany, retaining its original brass swan-neck handles and bracket feet. The graduated drawers are oak-lined and show the honest wear of two centuries in daily use.",
    condition: "Very good for age. Minor veneer touch-ups to the top surface; all original hardware.",
    dimensions: '38"W x 21"D x 34"H',
    featured: true,
    createdAt: daysAgo(4),
    images: 2,
  },
  {
    slug: "french-louis-xv-style-armchair",
    name: "French Louis XV-Style Fauteuil Armchair",
    category: "FURNISHINGS" as const,
    priceCents: 128000,
    description:
      "Carved beechwood fauteuil with cabriole legs and shell motifs, reupholstered in a period-appropriate ivory linen. A graceful addition to a reading corner or formal sitting room.",
    condition: "Excellent. Frame is sound; upholstery is a recent, sympathetic reupholstery.",
    dimensions: '26"W x 24"D x 37"H',
    featured: false,
    createdAt: daysAgo(11),
    images: 2,
  },
  {
    slug: "victorian-oak-refectory-table",
    name: "Victorian Oak Refectory Table",
    category: "FURNISHINGS" as const,
    priceCents: 342000,
    description:
      "Substantial solid oak refectory table on chunky turned legs, with a deep, richly patinated top that has seen a century of gatherings. Seats eight comfortably.",
    condition: "Sturdy and stable. Rich surface patina; a few historic water rings, in keeping with age.",
    dimensions: '84"W x 36"D x 30"H',
    featured: true,
    createdAt: daysAgo(2),
    images: 3,
  },
  {
    slug: "regency-mahogany-bookcase",
    name: "Regency Mahogany Open Bookcase",
    category: "FURNISHINGS" as const,
    priceCents: 198000,
    description:
      "A trim open bookcase with three adjustable shelves, ideal for a study or library wall. The mahogany has darkened beautifully with age.",
    condition: "Good. Shelves are stable; light surface scuffing to the base.",
    dimensions: '32"W x 12"D x 48"H',
    featured: false,
    createdAt: daysAgo(19),
    images: 2,
  },
  {
    slug: "copper-rooster-weathervane",
    name: "Copper Rooster Weathervane",
    category: "WEATHERVANES" as const,
    priceCents: 168000,
    description:
      "A full-bodied gilded-copper rooster weathervane in the American folk tradition, with a rich verdigris patina developed over decades outdoors. Mounted on its original directional arms.",
    condition: "Weathered as expected; sound and displayable, no active repair needed.",
    dimensions: '24"L x 4"D x 18"H',
    featured: true,
    createdAt: daysAgo(6),
    images: 2,
  },
  {
    slug: "running-horse-weathervane",
    name: "Running Horse Weathervane, Molded Copper",
    category: "WEATHERVANES" as const,
    priceCents: 224000,
    description:
      "A dynamic full-body running horse weathervane, molded copper over a cast head, with traces of original gold leaf visible in the recesses. A striking sculptural piece for indoor display.",
    condition: "Very good. Stable seams; one small dent to the near flank, not visible when mounted.",
    dimensions: '30"L x 3"D x 20"H',
    featured: false,
    createdAt: daysAgo(27),
    images: 2,
  },
  {
    slug: "codfish-weathervane",
    name: "Molded Copper Codfish Weathervane",
    category: "WEATHERVANES" as const,
    priceCents: 145000,
    description:
      "A whimsical codfish form, a traditional motif for New England coastal properties, with a warm, even verdigris surface and its original directional.",
    condition: "Good, structurally sound with honest surface wear.",
    dimensions: '22"L x 3"D x 12"H',
    featured: false,
    createdAt: daysAgo(9),
    images: 2,
  },
  {
    slug: "sterling-silver-tea-service",
    name: "Sterling Silver Five-Piece Tea Service",
    category: "COLLECTABLES" as const,
    priceCents: 385000,
    description:
      "A beautifully proportioned five-piece tea and coffee service with fluted bodies and ebony insulators, fully hallmarked. Recently polished, ready for the table.",
    condition: "Excellent. No dents or repairs; hallmarks are crisp and legible.",
    dimensions: 'Teapot 11"L x 8"H; service tray sold separately',
    featured: true,
    createdAt: daysAgo(3),
    images: 2,
  },
  {
    slug: "chinese-export-porcelain-bowl",
    name: "Chinese Export Famille Rose Porcelain Bowl",
    category: "COLLECTABLES" as const,
    priceCents: 96000,
    description:
      "A hand-painted famille rose bowl in the export tradition, decorated with peonies and butterflies. A fine cabinet piece or a striking centerpiece bowl.",
    condition: "Excellent, no chips or hairlines. Gilt rim shows light wear consistent with age.",
    dimensions: '10" diameter x 4"H',
    featured: false,
    createdAt: daysAgo(14),
    images: 2,
  },
  {
    slug: "antique-persian-tabriz-rug",
    name: "Antique Persian Tabriz Rug",
    category: "COLLECTABLES" as const,
    priceCents: 465000,
    description:
      "A finely knotted Tabriz rug in a soft palette of madder red and ivory, with a classical medallion design. Hand-washed and professionally assessed for structural soundness.",
    condition: "Very good. Even, low pile wear; original selvages intact.",
    dimensions: "9'2\" x 6'5\"",
    featured: true,
    createdAt: daysAgo(1),
    images: 2,
  },
  {
    slug: "victorian-brass-carriage-clock",
    name: "Victorian Brass Carriage Clock",
    category: "COLLECTABLES" as const,
    priceCents: 118000,
    description:
      "A compact brass carriage clock with beveled glass panels and a hand-painted enamel dial, complete with its original leather travel case.",
    condition: "Running and keeping accurate time; recently serviced.",
    dimensions: '4"W x 3"D x 6"H',
    featured: false,
    createdAt: daysAgo(22),
    images: 2,
  },
  {
    slug: "cut-crystal-decanter-set",
    name: "Anglo-Irish Cut Crystal Decanter Set",
    category: "COLLECTABLES" as const,
    priceCents: 78000,
    description:
      "A pair of deeply cut crystal decanters with original stoppers, the facets throwing wonderful light. A refined addition to a bar cart or dining sideboard.",
    condition: "Excellent, no chips to rims or stoppers.",
    dimensions: '5"W x 5"D x 11"H each',
    featured: false,
    createdAt: daysAgo(16),
    images: 2,
  },
  {
    slug: "dutch-golden-age-still-life-oil-painting",
    name: "Dutch Golden Age Style Still Life, Oil on Canvas",
    category: "ARTWORKS" as const,
    priceCents: 425000,
    description:
      "A richly toned still life of fruit and game in the Dutch Golden Age tradition, oil on canvas in a later gilt frame. A quietly commanding piece for a dining room or study.",
    condition: "Good. Stable craquelure consistent with age; recently cleaned and revarnished.",
    dimensions: '24"W x 30"H, framed',
    featured: true,
    createdAt: daysAgo(5),
    images: 2,
  },
  {
    slug: "hudson-river-school-landscape",
    name: "Hudson River School Style Landscape",
    category: "ARTWORKS" as const,
    priceCents: 310000,
    description:
      "A luminous pastoral landscape in the Hudson River School tradition, oil on canvas, capturing golden-hour light over rolling hills. Original period frame.",
    condition: "Very good. Minor frame wear; canvas is stable and unlined.",
    dimensions: '30"W x 24"H, framed',
    featured: false,
    createdAt: daysAgo(12),
    images: 2,
  },
  {
    slug: "botanical-hand-colored-engravings-set",
    name: "Set of Four Botanical Hand-Colored Engravings",
    category: "ARTWORKS" as const,
    priceCents: 68000,
    description:
      "A set of four antique botanical engravings, hand-colored, each individually framed in narrow gilt moulding. Sold as a set of four.",
    condition: "Excellent. Colors remain vibrant; minor toning to paper margins.",
    dimensions: '9"W x 11"H each, framed',
    featured: false,
    createdAt: daysAgo(8),
    images: 2,
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  for (const p of products) {
    const { images, ...data } = p;
    await prisma.product.create({
      data: {
        ...data,
        images: {
          create: Array.from({ length: images }).map((_, i) => ({
            url: placeholder(p.name),
            position: i,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
