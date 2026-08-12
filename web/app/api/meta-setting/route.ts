import { createClient } from "@/lib/supabase/server";
import { removeStoragePhoto } from "@/lib/storage";

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import * as metaSettingService from "@/modules/meta-setting/service";
import { UpdateMetaSettingRequestSchema } from "@/modules/meta-setting/dto";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const setting = await metaSettingService.getMetaSetting();

    return NextResponse.json(setting);
  } catch (error) {
    console.error("GET /api/meta-setting failed:", error);

    return NextResponse.json({ error: "Failed to get meta setting" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UpdateMetaSettingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Data meta setting tidak valid.",
      },
      { status: 400 },
    );
  }

  try {
    const previousSetting = await metaSettingService.getMetaSetting();

    const setting = await metaSettingService.updateMetaSetting(parsed.data);

    const supabase = await createClient();

    if (previousSetting.og_image_url !== setting.og_image_url) {
      await removeStoragePhoto(supabase, "meta-assets", previousSetting.og_image_url);
    }

    if (previousSetting.twitter_image_url !== setting.twitter_image_url) {
      await removeStoragePhoto(supabase, "meta-assets", previousSetting.twitter_image_url);
    }

    if (previousSetting.favicon_url !== setting.favicon_url) {
      await removeStoragePhoto(supabase, "meta-assets", previousSetting.favicon_url);
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error("PUT /api/meta-setting failed:", error);

    return NextResponse.json({ error: "Failed to update meta setting" }, { status: 500 });
  }
}
