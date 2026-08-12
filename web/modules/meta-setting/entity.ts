export type MetaSetting = {
  id: number;

  meta_title: string;
  meta_description: string;
  meta_keywords: string[];

  og_title: string;
  og_description: string;
  og_image_url: string;

  twitter_title: string;
  twitter_description: string;
  twitter_image_url: string;

  canonical_url: string;
  robots_index: boolean;
  robots_follow: boolean;

  favicon_url: string;

  created_at: string;
  updated_at: string;
};

export type UpdateMetaSetting = Omit<MetaSetting, "id" | "created_at" | "updated_at">;
