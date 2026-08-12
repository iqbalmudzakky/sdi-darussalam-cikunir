import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
import type { MetaSetting } from "./entity";
import type { UpdateMetaSettingRequest } from "./dto";

const DEFAULT_META_SETTING: MetaSetting = {
  id: 1,

  meta_title: "SDI Darussalam Cikunir",
  meta_description: "Situs resmi SDI Darussalam Cikunir",
  meta_keywords: [],

  og_title: "",
  og_description: "",
  og_image_url: "",

  twitter_title: "",
  twitter_description: "",
  twitter_image_url: "",

  canonical_url: "",
  robots_index: true,
  robots_follow: true,

  favicon_url: "",

  created_at: "",
  updated_at: "",
};

export async function getMetaSetting(): Promise<MetaSetting> {
  const setting = await withDbLogging("meta-setting.get", () => repository.get());

  return setting ?? DEFAULT_META_SETTING;
}

export async function updateMetaSetting(input: UpdateMetaSettingRequest): Promise<MetaSetting> {
  return withDbLogging("meta-setting.update", () => repository.update(input));
}
