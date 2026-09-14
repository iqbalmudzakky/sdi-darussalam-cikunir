"use server";

import * as eventService from "@/modules/event/service";
import type { PublicEventItem } from "@/types/Event";

export async function listPublishedEvents(): Promise<PublicEventItem[]> {
  try {
    return await eventService.listPublishedEvents();
  } catch (error) {
    console.error("lib/actions/events.listPublishedEvents failed:", error);
    return [];
  }
}

export async function listLatestPublishedEvents(
  limit: number,
): Promise<PublicEventItem[]> {
  try {
    return await eventService.listLatestPublishedEvents(limit);
  } catch (error) {
    console.error(
      "lib/actions/events.listLatestPublishedEvents failed:",
      error,
    );
    return [];
  }
}

export async function getPublishedEvent(
  slug: string,
): Promise<PublicEventItem | null> {
  try {
    return await eventService.getPublishedEventBySlug(slug);
  } catch (error) {
    console.error("lib/actions/events.getPublishedEvent failed:", error);
    throw error;
  }
}
