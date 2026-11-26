import { NextResponse } from "next/server";
import * as analyticsService from "@/modules/analytics/service";
import { TrackVisitRequestSchema } from "@/modules/analytics/dto";
import { getClientIp } from "@/modules/shared/web/clientIp";

function hostOf(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

/*
 * Menerima detak kunjungan dari VisitTracker. Dikirim lewat
 * navigator.sendBeacon sebagai text/plain, jadi badannya dibaca sebagai teks
 * lalu diurai sendiri. Jawabannya selalu 204: browser tidak menunggu hasil,
 * dan kegagalan mencatat tidak boleh terlihat pengunjung.
 */
export async function POST(request: Request) {
  const noContent = new NextResponse(null, { status: 204 });

  try {
    const ownHost = (
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      ""
    ).toLowerCase();

    /* Hanya halaman situs ini sendiri yang boleh mengirim detak. */
    const origin = hostOf(request.headers.get("origin"));
    if (origin && origin !== ownHost) return noContent;

    let payload: unknown;
    try {
      payload = JSON.parse(await request.text());
    } catch {
      return noContent;
    }

    const parsed = TrackVisitRequestSchema.safeParse(payload);
    if (!parsed.success) return noContent;

    await analyticsService.trackVisit(parsed.data, {
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
      ownHosts: [ownHost.split(":")[0]],
    });
  } catch (error) {
    console.error("POST /api/analytics/visits failed:", error);
  }

  return noContent;
}
