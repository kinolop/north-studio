import type { Metadata } from "next";

import { MarshrutHome } from "@/components/marshrut/MarshrutHome";

const title = "Маршрут: доставка из Китая на склады маркетплейсов";
const description =
  "Считаем доставку из Китая до склада на штуку товара: цена, таможня и сроки с вероятностью. Демо-концепт North Studio для карго-компании, каждая деталь нарисована кодом.";

export const metadata: Metadata = {
  // `absolute`, so the studio's "North Studio" template does not append
  // itself to a page presenting another brand.
  title: { absolute: title },
  description,
  alternates: { canonical: "/work/marshrut" },
  openGraph: {
    type: "website",
    siteName: "Маршрут",
    url: "/work/marshrut",
    title,
    description,
    locale: "ru_RU",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function MarshrutPage() {
  return <MarshrutHome />;
}
