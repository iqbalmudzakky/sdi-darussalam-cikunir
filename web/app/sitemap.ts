import type { MetadataRoute } from "next";
import { listPublishedEvents } from "@/lib/actions/events";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const events = await listPublishedEvents();

  const latestUpdate = events.reduce<Date | undefined>((latest, event) => {
    const updatedAt = new Date(event.updated_at);
    return !latest || updatedAt > latest ? updatedAt : latest;
  }, undefined);

  /*
   * Landing page tetap satu halaman — bagian-bagiannya hanya anchor,
   * jadi tidak didaftarkan terpisah. Yang punya URL sendiri: /event
   * dan setiap event terbit.
   */
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/event`,
      lastModified: latestUpdate ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...events.map((event) => ({
      url: `${siteUrl}/event/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
