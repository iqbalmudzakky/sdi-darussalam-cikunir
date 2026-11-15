/*
 * Sistem operasi dan browser pengunjung dari identitas browser (user agent).
 * Hanya nama umumnya yang disimpan, tanpa versi.
 */

const SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/CrOS/, "ChromeOS"],
  [/Macintosh|Mac OS X/, "macOS"],
  [/Linux/, "Linux"],
];

/*
 * Aplikasi dengan browser bawaan dicek lebih dulu, karena identitasnya juga
 * memuat "Chrome" atau "Safari".
 */
const BROWSERS: [RegExp, string][] = [
  [/Instagram/, "Instagram"],
  [/FBAN|FBAV|FB_IAB/, "Facebook"],
  [/TikTok|musical_ly|BytedanceWebview/, "TikTok"],
  [/\bLine\//, "LINE"],
  [/Edg(e|A|iOS)?\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/UCBrowser/, "UC Browser"],
  [/Firefox|FxiOS/, "Firefox"],
  [/CriOS|Chrome/, "Chrome"],
  [/Safari/, "Safari"],
];

function firstMatch(patterns: [RegExp, string][], userAgent: string): string {
  for (const [pattern, name] of patterns) {
    if (pattern.test(userAgent)) return name;
  }

  return "Lainnya";
}

export function detectSystem(userAgent: string): {
  os: string;
  browser: string;
} {
  return {
    os: firstMatch(SYSTEMS, userAgent),
    browser: firstMatch(BROWSERS, userAgent),
  };
}

export type DeviceKind = "mobile" | "tablet" | "desktop";

/*
 * Lebar layar dari browser lebih bisa dipercaya daripada user agent. User
 * agent hanya dipakai bila lebarnya tidak terkirim.
 */
export function detectDevice(
  width: number | null | undefined,
  userAgent: string,
): DeviceKind {
  if (width && width > 0) {
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  return /Mobile|Android|iPhone/i.test(userAgent) ? "mobile" : "desktop";
}
