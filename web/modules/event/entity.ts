export type Event = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  poster_url: string | null;
  event_date: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Field yang diisi lewat form admin — slug dan published_at dihitung service. */
export type EventFormFields = {
  title: string;
  category: string;
  summary: string;
  body: string;
  poster_url: string | null;
  event_date: string;
  is_published: boolean;
};

export type NewEvent = EventFormFields & {
  slug: string;
  published_at: string | null;
};

export type UpdatedEvent = EventFormFields & {
  slug: string;
  published_at: string | null;
};
