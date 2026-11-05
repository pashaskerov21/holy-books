import type { Metadata } from "next";
import { WishlistBrowser } from "@/components/wishlist-browser";

export const metadata: Metadata = {
  title: "Seçilmişlər",
  description: "Ürək ikonu ilə saxladığınız ayələr.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistPage() {
  return <WishlistBrowser backHref="/" />;
}
