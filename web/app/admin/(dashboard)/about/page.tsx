"use client";

import { useEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { Check, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { uploadPhoto } from "@/lib/api/storage";
import { prepareImageForUpload } from "@/lib/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getSchoolProfile, updateSchoolProfile } from "@/lib/api/schoolProfile";
import { useToast } from "@/hooks/useToast";
import type { SchoolProfile } from "@/types/SchoolProfile";

const cardContainerVariants = cva([
  "bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8",
  "[&_input]:bg-gray-50 [&_textarea]:bg-gray-50",
]);

const photoButtonVariants = cva([
  "relative aspect-4/3 w-full max-w-sm mx-auto overflow-hidden rounded-2xl",
  "bg-linear-to-br from-emerald-100 to-teal-100",
  "flex items-center justify-center",
  "disabled:cursor-default",
]);

const photoOverlayVariants = cva([
  "absolute inset-0 flex flex-col items-center justify-center gap-1.5",
  "bg-black/40 text-white",
]);

const removeMisiButtonVariants = cva([
  "rounded-xl shrink-0",
  "text-red-500 hover:bg-red-50 hover:text-red-600",
]);

const EMPTY_PROFILE: SchoolProfile = {
  photo_url: null,
  description: "",
  visi: "",
  misi: [],
  alamat: "",
  telepon: "",
  whatsapp: "",
  whatsapp_message: "",
  email: "",
  jam_operasional: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
};

export default function AdminAboutPage() {
  const toast = useToast();
  const [draft, setDraft] = useState<SchoolProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPhotoFileRef = useRef<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getSchoolProfile();
      setDraft(data);
    } catch (error) {
      console.error("Failed to load school profile:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(patch: Partial<SchoolProfile>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPreparingPhoto(true);
    try {
      const preparedFile = await prepareImageForUpload(file);
      pendingPhotoFileRef.current = preparedFile;
      updateDraft({ photo_url: URL.createObjectURL(preparedFile) });
    } catch (error) {
      console.error("Failed to prepare school profile photo:", error);
      toast.error("Gagal memproses foto", "Coba lagi.");
    } finally {
      setIsPreparingPhoto(false);
    }
  }

  function handleMisiChange(index: number, value: string) {
    const misi = [...draft.misi];
    misi[index] = value;
    updateDraft({ misi });
  }

  function handleAddMisi() {
    updateDraft({ misi: [...draft.misi, ""] });
  }

  function handleRemoveMisi(index: number) {
    updateDraft({ misi: draft.misi.filter((_, i) => i !== index) });
  }

  async function handleSave() {
    let photoUrl = draft.photo_url;
    const pendingFile = pendingPhotoFileRef.current;

    if (pendingFile) {
      setIsUploading(true);

      try {
        photoUrl = await uploadPhoto("school-profile-photos", pendingFile);
      } catch (error) {
        console.error("Failed to upload school profile photo:", error);
        toast.error("Gagal unggah foto", "Coba lagi.");
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
    }

    setIsSaving(true);
    try {
      const misi = draft.misi
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      const saved = await updateSchoolProfile({
        ...draft,
        misi,
        photo_url: photoUrl,
      });
      setDraft(saved);
      pendingPhotoFileRef.current = null;
      toast.success("Profil sekolah disimpan");
    } catch (error) {
      console.error("Failed to save school profile:", error);
      toast.error("Gagal menyimpan", "Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profil Sekolah</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit deskripsi, visi, misi, foto, dan info kontak sekolah. Data ini
          dipakai di section Tentang dan Kontak pada halaman utama.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">
          Gagal memuat data. Coba refresh halaman.
        </p>
      ) : (
        <div className={cardContainerVariants()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isPreparingPhoto}
            className={photoButtonVariants()}
          >
            {draft.photo_url ? (
              <img
                src={draft.photo_url}
                alt="Foto profil sekolah"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 font-medium px-4 text-center">
                Foto Profil Sekolah
              </span>
            )}

            {isUploading || isPreparingPhoto ? (
              <div className={photoOverlayVariants()}>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">
                  {isPreparingPhoto ? "Memproses foto..." : "Mengunggah..."}
                </span>
              </div>
            ) : (
              <div
                className={cn(
                  photoOverlayVariants(),
                  "opacity-0 hover:opacity-100 transition-opacity",
                )}
              >
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
          <div className="space-y-1.5">
            <Label htmlFor="about-description">
              Deskripsi (pisahkan paragraf dengan baris kosong)
            </Label>
            <Textarea
              id="about-description"
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              className="rounded-xl min-h-32"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="about-visi">Visi</Label>
            <Textarea
              id="about-visi"
              value={draft.visi}
              onChange={(e) => updateDraft({ visi: e.target.value })}
              className="rounded-xl min-h-20"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Misi</Label>
            <div className="space-y-2">
              {draft.misi.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleMisiChange(index, e.target.value)}
                    placeholder="mis. Membentuk karakter siswa yang Islami"
                    className="rounded-xl"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => handleRemoveMisi(index)}
                    aria-label="Hapus poin misi"
                    className={removeMisiButtonVariants()}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddMisi}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Tambah Poin Misi
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="about-alamat">Alamat</Label>
              <Textarea
                id="about-alamat"
                value={draft.alamat}
                onChange={(e) => updateDraft({ alamat: e.target.value })}
                className="rounded-xl min-h-20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about-jam">Jam Operasional</Label>
              <Textarea
                id="about-jam"
                value={draft.jam_operasional}
                onChange={(e) =>
                  updateDraft({ jam_operasional: e.target.value })
                }
                className="rounded-xl min-h-20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about-telepon">Telepon</Label>
              <Input
                id="about-telepon"
                value={draft.telepon}
                onChange={(e) => updateDraft({ telepon: e.target.value })}
                placeholder="mis. (021) XXXX-XXXX"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about-whatsapp">Nomor WhatsApp</Label>
              <Input
                id="about-whatsapp"
                value={draft.whatsapp}
                onChange={(e) => updateDraft({ whatsapp: e.target.value })}
                placeholder="08xx-xxxx-xxxx"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about-email">Email</Label>
              <Input
                id="about-email"
                value={draft.email}
                onChange={(e) => updateDraft({ email: e.target.value })}
                placeholder="mis. info@sdidarussalam.sch.id"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about-facebook">Facebook</Label>
              <Input
                id="about-facebook"
                value={draft.facebook}
                onChange={(e) => updateDraft({ facebook: e.target.value })}
                placeholder="URL profil Facebook"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about-instagram">Instagram</Label>
              <Input
                id="about-instagram"
                value={draft.instagram}
                onChange={(e) => updateDraft({ instagram: e.target.value })}
                placeholder="URL profil Instagram"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about-tiktok">TikTok</Label>
              <Input
                id="about-tiktok"
                value={draft.tiktok}
                onChange={(e) => updateDraft({ tiktok: e.target.value })}
                placeholder="URL profil TikTok"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about-youtube">YouTube</Label>
              <Input
                id="about-youtube"
                value={draft.youtube}
                onChange={(e) => updateDraft({ youtube: e.target.value })}
                placeholder="URL channel YouTube"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="about-whatsapp-message">
              Pesan Template WhatsApp
            </Label>
            <Textarea
              id="about-whatsapp-message"
              value={draft.whatsapp_message}
              onChange={(e) =>
                updateDraft({ whatsapp_message: e.target.value })
              }
              placeholder="mis. Assalamu'alaikum, saya ingin bertanya seputar pendaftaran di SDI Darussalam Cikunir."
              className="rounded-xl min-h-24"
            />
            <p className="text-xs text-gray-500">
              Pesan ini otomatis terisi di kolom chat WhatsApp saat pengunjung
              website mengklik ikon WhatsApp di section Kontak.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading || isPreparingPhoto}
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
