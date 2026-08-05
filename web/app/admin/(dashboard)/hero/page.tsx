"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getHeroContent, updateHeroContent } from "@/lib/api/hero";
import type { HeroContent } from "@/types/Hero";

const EMPTY_HERO: HeroContent = {
  headline_main: "",
  headline_highlight: "",
  description: "",
  stat1_value: "",
  stat2_value: "",
  stat3_value: "",
  photo_url: null,
};

export default function AdminHeroPage() {
  const [draft, setDraft] = useState<HeroContent>(EMPTY_HERO);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPhotoFileRef = useRef<File | null>(null);

  useEffect(() => {
    loadHero();
  }, []);

  async function loadHero() {
    try {
      const data = await getHeroContent();
      setDraft(data);
    } catch (error) {
      console.error("Failed to load hero content:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(patch: Partial<HeroContent>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSaveSuccess(false);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(false);
    pendingPhotoFileRef.current = file;
    updateDraft({ photo_url: URL.createObjectURL(file) });
  }

  async function handleSave() {
    let photoUrl = draft.photo_url;
    const pendingFile = pendingPhotoFileRef.current;

    if (pendingFile) {
      setUploadError(false);
      setIsUploading(true);

      const supabase = createClient();
      const filePath = `${crypto.randomUUID()}-${pendingFile.name}`;
      const { error } = await supabase.storage
        .from("hero-photos")
        .upload(filePath, pendingFile);

      setIsUploading(false);

      if (error) {
        setUploadError(true);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("hero-photos").getPublicUrl(filePath);
      photoUrl = publicUrl;
    }

    setSaveError(false);
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      const saved = await updateHeroContent({ ...draft, photo_url: photoUrl });
      setDraft(saved);
      pendingPhotoFileRef.current = null;
      setSaveSuccess(true);
    } catch (error) {
      console.error("Failed to save hero content:", error);
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Beranda</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit judul, deskripsi, statistik, dan foto utama di halaman beranda.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">
          Gagal memuat data beranda. Coba refresh halaman.
        </p>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="relative aspect-4/3 w-full max-w-sm mx-auto bg-linear-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center overflow-hidden disabled:cursor-default"
          >
            {draft.photo_url ? (
              <img
                src={draft.photo_url}
                alt="Foto gedung sekolah"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 font-medium px-4 text-center">
                Foto Gedung Sekolah
              </span>
            )}

            {isUploading ? (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Mengunggah...</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 text-white opacity-0 hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">Ganti foto</span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {uploadError && (
            <p className="text-xs text-red-600 text-center">
              Gagal unggah foto. Coba lagi.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="hero-headline-main">Judul Utama</Label>
            <Input
              id="hero-headline-main"
              value={draft.headline_main}
              onChange={(e) => updateDraft({ headline_main: e.target.value })}
              placeholder="mis. Membentuk Generasi"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hero-headline-highlight">
              Judul Penekanan (warna gradient)
            </Label>
            <Input
              id="hero-headline-highlight"
              value={draft.headline_highlight}
              onChange={(e) =>
                updateDraft({ headline_highlight: e.target.value })
              }
              placeholder="mis. Cerdas & Berakhlak Mulia"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hero-description">Deskripsi</Label>
            <Textarea
              id="hero-description"
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              className="rounded-xl min-h-24"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="hero-stat1">Angka: Tahun Berpengalaman</Label>
              <Input
                id="hero-stat1"
                value={draft.stat1_value}
                onChange={(e) => updateDraft({ stat1_value: e.target.value })}
                placeholder="mis. 15+"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hero-stat2">Angka: Siswa Aktif</Label>
              <Input
                id="hero-stat2"
                value={draft.stat2_value}
                onChange={(e) => updateDraft({ stat2_value: e.target.value })}
                placeholder="mis. 500+"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hero-stat3">Angka: Tenaga Pendidik</Label>
              <Input
                id="hero-stat3"
                value={draft.stat3_value}
                onChange={(e) => updateDraft({ stat3_value: e.target.value })}
                placeholder="mis. 30+"
                className="rounded-xl"
              />
            </div>
          </div>

          {saveError && (
            <p className="text-xs text-red-600">Gagal menyimpan. Coba lagi.</p>
          )}
          {saveSuccess && (
            <p className="text-xs text-emerald-600">Tersimpan.</p>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Check className="w-4 h-4" />
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      )}
    </div>
  );
}
