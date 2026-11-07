export type EventItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  poster_url: string | null;
  event_date: string;
  is_published: boolean;
};

export type PublicEventItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  poster_url: string | null;
  event_date: string;
  updated_at: string;
};
