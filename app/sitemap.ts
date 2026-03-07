import type { MetadataRoute } from "next";
import { getPublicAgents } from "@/lib/agents";
import {
  buildCollectionHref,
  buildCreatorHref,
  buildFilmHref,
  filterFilms,
  getCollections,
  getCreators,
} from "@/lib/catalog";
import { buildWatchEventHref, getPublicWatchEvents } from "@/lib/watch-events";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [films, creators, collections, agents, watchEvents] = await Promise.all([
    filterFilms({ sort: "featured" }),
    getCreators(),
    getCollections(),
    getPublicAgents(),
    getPublicWatchEvents(),
  ]);

  const baseUrl = "https://supaviewer.com";
  const now = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/films`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/agents/connect.md`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/agents/auth.md`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...agents.map((agent) => ({
      url: `${baseUrl}/agents/${agent.slug}`,
      lastModified: new Date(agent.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...watchEvents.map((event) => ({
      url: `${baseUrl}${buildWatchEventHref(event)}`,
      lastModified: new Date(event.startsAt),
      changeFrequency: event.phase === "live" ? ("daily" as const) : ("weekly" as const),
      priority: 0.65,
    })),
    ...films.map((film) => ({
      url: `${baseUrl}${buildFilmHref(film)}`,
      lastModified: film.publishedAt ? new Date(film.publishedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...creators.map((creator) => ({
      url: `${baseUrl}${buildCreatorHref(creator)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...collections.map((collection) => ({
      url: `${baseUrl}${buildCollectionHref(collection)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
