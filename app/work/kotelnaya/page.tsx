import type { Metadata } from "next";

import { KotelnayaHome } from "@/components/kotelnaya/KotelnayaHome";

const title = "Котельная: пекарня и кофе в бывшей котельной";
const description =
  "Хлеб на закваске, круассаны и кофе на Выборгской стороне. Что выходит из печи сейчас, и предзаказ к своему часу. Демо-концепт North Studio.";

export const metadata: Metadata = {
  // `absolute`, so the studio's "North Studio" template does not append
  // itself to a page presenting another brand.
  title: { absolute: title },
  description,
  alternates: { canonical: "/work/kotelnaya" },
  openGraph: {
    type: "website",
    siteName: "Котельная",
    url: "/work/kotelnaya",
    title,
    description,
    locale: "ru_RU",
    images: [{ url: "/work/kotelnaya/cover.jpg", width: 1500, height: 1000 }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function KotelnayaPage() {
  return <KotelnayaHome />;
}
