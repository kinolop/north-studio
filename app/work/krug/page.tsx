import type { Metadata } from "next";

import { KrugHome } from "@/components/krug/KrugHome";

const title = "Круг: гончарная мастерская на Бауманской";
const description =
  "Первое занятие на гончарном круге, курсы и лепка руками в Москве. Демо-концепт North Studio: чашка, печь и план мастерской нарисованы кодом.";

export const metadata: Metadata = {
  // `absolute`, so the studio's "North Studio" template does not append
  // itself to a page presenting another brand.
  title: { absolute: title },
  description,
  alternates: { canonical: "/work/krug" },
  openGraph: {
    type: "website",
    siteName: "Круг",
    url: "/work/krug",
    title,
    description,
    locale: "ru_RU",
    images: [{ url: "/work/krug/cover.png", width: 1500, height: 1000 }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function KrugPage() {
  return <KrugHome />;
}
