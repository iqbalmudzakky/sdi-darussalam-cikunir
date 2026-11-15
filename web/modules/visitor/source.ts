/*
 * Nama yang mudah dibaca untuk asal kedatangan pengunjung, dari alamat situs
 * sebelumnya (referrer) atau, bila kosong, dari utm_source di tautan. Aplikasi
 * HP seperti ChatGPT sering tidak mengirim referrer tetapi menempelkan
 * utm_source, sehingga keduanya dibaca.
 */

export type SourceCategory =
  | "ai"
  | "search"
  | "social"
  | "messaging"
  | "other"
  | "direct";

export const SOURCE_CATEGORIES: Record<SourceCategory, string> = {
  ai: "Rekomendasi AI",
  search: "Mesin pencari",
  social: "Media sosial",
  messaging: "Aplikasi pesan",
  other: "Situs lain",
  direct: "Langsung",
};

export type VisitorSource = { label: string; category: SourceCategory };

/* Pola nama situs (tanpa www.). Dicocokkan dari atas ke bawah. */
const KNOWN: [RegExp, string, SourceCategory][] = [
  [/^(chatgpt\.com|chat\.openai\.com|openai\.com|chatgpt)$/, "ChatGPT", "ai"],
  [/^(claude\.ai|claude)$/, "Claude", "ai"],
  [/^(gemini\.google\.com|bard\.google\.com|gemini)$/, "Gemini", "ai"],
  [/^(perplexity\.ai|perplexity)$/, "Perplexity", "ai"],
  [/^(copilot\.microsoft\.com|copilot)$/, "Copilot", "ai"],
  [/^((chat\.)?deepseek\.com|deepseek)$/, "DeepSeek", "ai"],
  [/^(meta\.ai)$/, "Meta AI", "ai"],
  [/^(grok\.com|x\.ai|grok)$/, "Grok", "ai"],
  [
    /^(google(\.[a-z]{2,3}){1,2}|google|com\.google\.android\.googlequicksearchbox)$/,
    "Google",
    "search",
  ],
  [/^(bing\.com|bing)$/, "Bing", "search"],
  [/^(duckduckgo\.com|duckduckgo)$/, "DuckDuckGo", "search"],
  [/^((search\.)?yahoo\.com|yahoo)$/, "Yahoo", "search"],
  [/^((l\.|lm\.|m\.)?instagram\.com|instagram|ig)$/, "Instagram", "social"],
  [
    /^((l\.|lm\.|m\.|web\.)?facebook\.com|fb\.me|facebook|fb)$/,
    "Facebook",
    "social",
  ],
  [/^(t\.co|x\.com|twitter\.com|twitter)$/, "X", "social"],
  [/^((vt\.|m\.)?tiktok\.com|tiktok)$/, "TikTok", "social"],
  [/^((m\.)?youtube\.com|youtu\.be|youtube)$/, "YouTube", "social"],
  [/^(linkedin\.com|lnkd\.in|linkedin)$/, "LinkedIn", "social"],
  [/^(threads\.net|threads\.com|threads)$/, "Threads", "social"],
  [
    /^(wa\.me|(api\.|web\.)?whatsapp\.com|whatsapp|wa)$/,
    "WhatsApp",
    "messaging",
  ],
  [/^(t\.me|telegram\.org|telegram)$/, "Telegram", "messaging"],
  [/^(line\.me|line)$/, "LINE", "messaging"],
];

const DIRECT: VisitorSource = { label: "Langsung", category: "direct" };

function normalize(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed) return null;

  return trimmed.replace(/^www\./, "");
}

function matchKnown(name: string): VisitorSource | null {
  for (const [pattern, label, category] of KNOWN) {
    if (pattern.test(name)) return { label, category };
  }

  return null;
}

export function classifySource(
  referrerHost: string | null | undefined,
  utmSource: string | null | undefined,
): VisitorSource {
  const host = normalize(referrerHost);
  const utm = normalize(utmSource);

  for (const candidate of [host, utm]) {
    if (!candidate) continue;

    const known = matchKnown(candidate);
    if (known) return known;
  }

  const raw = host ?? utm;

  return raw ? { label: raw, category: "other" } : DIRECT;
}
