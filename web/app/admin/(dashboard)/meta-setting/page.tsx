"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Bot, Check, Globe2, ImageIcon, Loader2, Search, Share2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { getMetaSetting, updateMetaSetting } from "@/lib/api/metaSetting";
import { createClient } from "@/lib/supabase/client";
import type { MetaSetting } from "@/modules/meta-setting/entity";

type MetaSettingDraft = {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;

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
};

const EMPTY_DRAFT: MetaSettingDraft = {
  meta_title: "",
  meta_description: "",
  meta_keywords: "",

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
};

function mapSettingToDraft(setting: MetaSetting): MetaSettingDraft {
  return {
    meta_title: setting.meta_title,
    meta_description: setting.meta_description,
    meta_keywords: setting.meta_keywords.join(", "),

    og_title: setting.og_title,
    og_description: setting.og_description,
    og_image_url: setting.og_image_url,

    twitter_title: setting.twitter_title,
    twitter_description: setting.twitter_description,
    twitter_image_url: setting.twitter_image_url,

    canonical_url: setting.canonical_url,
    robots_index: setting.robots_index,
    robots_follow: setting.robots_follow,

    favicon_url: setting.favicon_url,
  };
}

export default function AdminMetaSettingPage() {
  const toast = useToast();

  const [draft, setDraft] = useState<MetaSettingDraft>(EMPTY_DRAFT);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const ogImageInputRef = useRef<HTMLInputElement>(null);
  const twitterImageInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const pendingOgImageRef = useRef<File | null>(null);
  const pendingTwitterImageRef = useRef<File | null>(null);
  const pendingFaviconRef = useRef<File | null>(null);

  useEffect(() => {
    void loadSetting();
  }, []);

  async function loadSetting() {
    try {
      const setting = await getMetaSetting();

      setDraft(mapSettingToDraft(setting));
      setLoadError(false);
    } catch (error) {
      console.error("Failed to load meta setting:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(patch: Partial<MetaSettingDraft>) {
    setDraft((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  async function uploadMetaAsset(file: File, prefix: "og" | "twitter" | "favicon") {
    const supabase = createClient();

    const rawExtension = file.name.split(".").pop();
    const extension = rawExtension?.toLowerCase() || "png";

    const filePath = `${prefix}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from("meta-assets").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      throw new Error(`Gagal mengunggah ${prefix === "favicon" ? "favicon" : `${prefix} image`}.`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("meta-assets").getPublicUrl(filePath);

    return publicUrl;
  }

  function handleOgImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    pendingOgImageRef.current = file;

    updateDraft({
      og_image_url: URL.createObjectURL(file),
    });
  }

  function handleTwitterImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    pendingTwitterImageRef.current = file;

    updateDraft({
      twitter_image_url: URL.createObjectURL(file),
    });
  }

  function handleFaviconChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    pendingFaviconRef.current = file;

    updateDraft({
      favicon_url: URL.createObjectURL(file),
    });
  }

  async function handleSave() {
    if (!draft.meta_title.trim()) {
      toast.error("Meta title wajib diisi");
      return;
    }

    if (!draft.meta_description.trim()) {
      toast.error("Meta description wajib diisi");
      return;
    }

    const keywords = draft.meta_keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);

    setIsSaving(true);

    try {
      setIsUploading(true);

      let ogImageUrl = draft.og_image_url;
      let twitterImageUrl = draft.twitter_image_url;
      let faviconUrl = draft.favicon_url;

      if (pendingOgImageRef.current) {
        ogImageUrl = await uploadMetaAsset(pendingOgImageRef.current, "og");
      }

      if (pendingTwitterImageRef.current) {
        twitterImageUrl = await uploadMetaAsset(pendingTwitterImageRef.current, "twitter");
      }

      if (pendingFaviconRef.current) {
        faviconUrl = await uploadMetaAsset(pendingFaviconRef.current, "favicon");
      }

      setIsUploading(false);

      const saved = await updateMetaSetting({
        meta_title: draft.meta_title.trim(),
        meta_description: draft.meta_description.trim(),
        meta_keywords: keywords,

        og_title: draft.og_title.trim(),
        og_description: draft.og_description.trim(),
        og_image_url: ogImageUrl,

        twitter_title: draft.twitter_title.trim(),
        twitter_description: draft.twitter_description.trim(),
        twitter_image_url: twitterImageUrl,

        canonical_url: draft.canonical_url.trim(),

        robots_index: draft.robots_index,
        robots_follow: draft.robots_follow,

        favicon_url: faviconUrl,
      });

      pendingOgImageRef.current = null;
      pendingTwitterImageRef.current = null;
      pendingFaviconRef.current = null;

      setDraft(mapSettingToDraft(saved));

      toast.success("Meta setting disimpan", "Metadata landing page berhasil diperbarui.");
    } catch (error) {
      console.error("Failed to save meta setting:", error);

      toast.error("Gagal menyimpan meta setting", error instanceof Error ? error.message : "Coba lagi.");
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meta Setting</h1>

        <p className="mt-1 text-sm leading-relaxed text-gray-500">Atur metadata landing page untuk mesin pencari, social sharing, canonical URL, robots, dan identitas website.</p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm text-red-600">Gagal memuat Meta Setting. Coba refresh halaman.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic SEO */}
          <section className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Search className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">Basic SEO</h2>

                <p className="mt-1 text-sm text-gray-500">Metadata utama yang digunakan untuk judul dan deskripsi halaman.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meta-title">Meta Title</Label>

              <Input
                id="meta-title"
                value={draft.meta_title}
                onChange={(event) =>
                  updateDraft({
                    meta_title: event.target.value,
                  })
                }
                placeholder="SDI Darussalam Cikunir"
                className="rounded-xl bg-gray-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meta-description">Meta Description</Label>

              <Textarea
                id="meta-description"
                value={draft.meta_description}
                onChange={(event) =>
                  updateDraft({
                    meta_description: event.target.value,
                  })
                }
                placeholder="Deskripsi singkat landing page."
                className="min-h-24 rounded-xl bg-gray-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meta-keywords">Meta Keywords</Label>

              <Input
                id="meta-keywords"
                value={draft.meta_keywords}
                onChange={(event) =>
                  updateDraft({
                    meta_keywords: event.target.value,
                  })
                }
                placeholder="sekolah islam, sekolah dasar, bekasi"
                className="rounded-xl bg-gray-50"
              />

              <p className="text-xs leading-relaxed text-gray-400">Pisahkan setiap keyword menggunakan tanda koma.</p>
            </div>
          </section>

          {/* Open Graph */}
          <section className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Share2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">Open Graph</h2>

                <p className="mt-1 text-sm text-gray-500">Digunakan saat landing page dibagikan ke platform yang mendukung Open Graph.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="og-title">OG Title</Label>

              <Input
                id="og-title"
                value={draft.og_title}
                onChange={(event) =>
                  updateDraft({
                    og_title: event.target.value,
                  })
                }
                placeholder="Kosongkan untuk menggunakan Meta Title"
                className="rounded-xl bg-gray-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="og-description">OG Description</Label>

              <Textarea
                id="og-description"
                value={draft.og_description}
                onChange={(event) =>
                  updateDraft({
                    og_description: event.target.value,
                  })
                }
                placeholder="Kosongkan untuk menggunakan Meta Description"
                className="min-h-24 rounded-xl bg-gray-50"
              />
            </div>

            <div className="space-y-3">
              <Label>OG Image</Label>

              <button
                type="button"
                onClick={() => ogImageInputRef.current?.click()}
                disabled={isUploading || isSaving}
                className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
              >
                {draft.og_image_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.og_image_url} alt="Open Graph preview" className="h-full w-full object-cover" />
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Belum ada OG image</span>
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Upload className="h-6 w-6" />

                  <span className="text-sm font-medium">{draft.og_image_url ? "Ganti gambar" : "Unggah gambar"}</span>
                </div>
              </button>

              <input ref={ogImageInputRef} type="file" accept="image/*" onChange={handleOgImageChange} className="hidden" />

              <Input
                type="url"
                value={draft.og_image_url.startsWith("blob:") ? "" : draft.og_image_url}
                onChange={(event) => {
                  pendingOgImageRef.current = null;

                  updateDraft({
                    og_image_url: event.target.value,
                  });
                }}
                placeholder="Atau masukkan URL gambar: https://..."
                className="rounded-xl bg-gray-50"
              />
            </div>
          </section>

          {/* Twitter / Social Card */}
          <section className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Globe2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">Twitter / Social Card</h2>

                <p className="mt-1 text-sm text-gray-500">Metadata khusus untuk tampilan kartu ketika halaman dibagikan.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="twitter-title">Twitter Title</Label>

              <Input
                id="twitter-title"
                value={draft.twitter_title}
                onChange={(event) =>
                  updateDraft({
                    twitter_title: event.target.value,
                  })
                }
                placeholder="Kosongkan untuk menggunakan Meta Title"
                className="rounded-xl bg-gray-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="twitter-description">Twitter Description</Label>

              <Textarea
                id="twitter-description"
                value={draft.twitter_description}
                onChange={(event) =>
                  updateDraft({
                    twitter_description: event.target.value,
                  })
                }
                placeholder="Kosongkan untuk menggunakan Meta Description"
                className="min-h-24 rounded-xl bg-gray-50"
              />
            </div>

            <div className="space-y-3">
              <Label>Twitter Image</Label>

              <button
                type="button"
                onClick={() => twitterImageInputRef.current?.click()}
                disabled={isUploading || isSaving}
                className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
              >
                {draft.twitter_image_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.twitter_image_url} alt="Twitter card preview" className="h-full w-full object-cover" />
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Belum ada Twitter image</span>
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Upload className="h-6 w-6" />

                  <span className="text-sm font-medium">{draft.twitter_image_url ? "Ganti gambar" : "Unggah gambar"}</span>
                </div>
              </button>

              <input ref={twitterImageInputRef} type="file" accept="image/*" onChange={handleTwitterImageChange} className="hidden" />

              <Input
                type="url"
                value={draft.twitter_image_url.startsWith("blob:") ? "" : draft.twitter_image_url}
                onChange={(event) => {
                  pendingTwitterImageRef.current = null;

                  updateDraft({
                    twitter_image_url: event.target.value,
                  });
                }}
                placeholder="Atau masukkan URL gambar: https://..."
                className="rounded-xl bg-gray-50"
              />
            </div>
          </section>

          {/* Canonical + Robots */}
          <section className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">Search Engine Control</h2>

                <p className="mt-1 text-sm text-gray-500">Atur canonical URL serta izin index dan follow untuk mesin pencari.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="canonical-url">Canonical URL</Label>

              <Input
                id="canonical-url"
                type="url"
                value={draft.canonical_url}
                onChange={(event) =>
                  updateDraft({
                    canonical_url: event.target.value,
                  })
                }
                placeholder="https://..."
                className="rounded-xl bg-gray-50"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={draft.robots_index}
                  onChange={(event) =>
                    updateDraft({
                      robots_index: event.target.checked,
                    })
                  }
                  className="mt-0.5 h-4 w-4 accent-emerald-600"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">Allow Index</span>

                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">Izinkan mesin pencari mengindeks halaman.</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={draft.robots_follow}
                  onChange={(event) =>
                    updateDraft({
                      robots_follow: event.target.checked,
                    })
                  }
                  className="mt-0.5 h-4 w-4 accent-emerald-600"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">Allow Follow</span>

                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">Izinkan crawler mengikuti link yang terdapat di halaman.</span>
                </span>
              </label>
            </div>
          </section>

          {/* Favicon */}
          <section className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ImageIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">Site Identity</h2>

                <p className="mt-1 text-sm text-gray-500">Atur favicon yang akan digunakan sebagai identitas website.</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Favicon</Label>

              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                disabled={isUploading || isSaving}
                className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
              >
                {draft.favicon_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.favicon_url} alt="Favicon preview" className="h-full w-full object-contain p-3" />
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Upload className="h-5 w-5" />

                  <span className="text-xs font-medium">{draft.favicon_url ? "Ganti" : "Unggah"}</span>
                </div>
              </button>

              <input ref={faviconInputRef} type="file" accept="image/*,.ico" onChange={handleFaviconChange} className="hidden" />

              <Input
                type="url"
                value={draft.favicon_url.startsWith("blob:") ? "" : draft.favicon_url}
                onChange={(event) => {
                  pendingFaviconRef.current = null;

                  updateDraft({
                    favicon_url: event.target.value,
                  });
                }}
                placeholder="Atau masukkan URL favicon: https://..."
                className="rounded-xl bg-gray-50"
              />
            </div>
          </section>

          <div className="flex justify-end pb-4">
            <Button type="button" onClick={handleSave} disabled={isSaving || isUploading} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {isSaving || isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}

              {isUploading ? "Mengunggah..." : isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
