import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import { removeStoragePhoto } from "@/modules/storage/storage";
import type { SaveEventRequest, EventResponse } from "./dto";
import type { Event } from "./entity";

const PHOTO_BUCKET = "event-photos";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "") // buang diakritik (é, ñ, dst.)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "event";
}

async function generateUniqueSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title);
  const taken = new Set(
    await withDbLogging("event.findSlugsByPrefix", () =>
      repository.findSlugsByPrefix(base, excludeId),
    ),
  );

  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;

  return `${base}-${suffix}`;
}

function toResponse(event: Event): EventResponse {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    category: event.category,
    summary: event.summary,
    body: event.body,
    poster_url: event.poster_url,
    event_date: event.event_date,
    is_published: event.is_published,
  };
}

export async function listEvents(): Promise<EventResponse[]> {
  const events = await withDbLogging("event.list", () => repository.list());
  return events.map(toResponse);
}

export async function createEvent(
  input: SaveEventRequest,
): Promise<EventResponse> {
  const slug = await generateUniqueSlug(input.title);
  const publishedAt = input.is_published ? new Date().toISOString() : null;

  const created = await withDbLogging("event.insert", () =>
    repository.insert({ ...input, slug, published_at: publishedAt }),
  );

  return toResponse(created);
}

export async function updateEvent(
  id: string,
  input: SaveEventRequest,
): Promise<EventResponse | null> {
  const existing = await withDbLogging("event.findById", () =>
    repository.findById(id),
  );
  if (!existing) return null;

  const alreadyLocked = existing.published_at !== null;
  const slug =
    !alreadyLocked && input.title !== existing.title
      ? await generateUniqueSlug(input.title, id)
      : existing.slug;

  const publishedAt = alreadyLocked
    ? existing.published_at
    : input.is_published
      ? new Date().toISOString()
      : null;

  const updated = await withDbLogging("event.update", () =>
    repository.update(id, { ...input, slug, published_at: publishedAt }),
  );

  if (existing.poster_url && existing.poster_url !== input.poster_url) {
    await removeStoragePhoto(PHOTO_BUCKET, existing.poster_url);
  }

  return toResponse(updated);
}

export async function deleteEvent(id: string): Promise<void> {
  const existing = await withDbLogging("event.findById", () =>
    repository.findById(id),
  );

  await withDbLogging("event.remove", () => repository.remove(id));

  if (existing?.poster_url) {
    await removeStoragePhoto(PHOTO_BUCKET, existing.poster_url);
  }
}
