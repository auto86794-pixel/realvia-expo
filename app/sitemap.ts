import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.realvia.hu",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}