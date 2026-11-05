import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Kitablar",
    description:
      "Quran (Qurani-Kərim), İncil (Matta, Mark, Luka, Yəhya), Tövrat (Yaradılış, Çıxış, Levililər, Saylar, Təsniyə) və Tenqriçiliyi Azərbaycan dilində onlayn və offline oxuyun.",
    start_url: "/",
    display: "standalone",
    background_color: "#121212",
    theme_color: "#121212",
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
