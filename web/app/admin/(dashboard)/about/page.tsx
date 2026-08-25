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
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { useToast } from "@/hooks/useToast";
import type { SchoolProfile } from "@/types/SchoolProfile";

const photoButtonVariants = cva(["relative aspect-4/3 w-full max-w-sm mx-auto overflow-hidden rounded-2xl", "bg-linear-to-br bg-brand-100", "flex items-center justify-center", "disabled:cursor-default"]);

const photoOverlayVariants = cva(["absolute inset-0 flex flex-col items-center justify-center gap-1.5", "bg-black/40 text-white"]);

/*
 * Pratinjau foto latar dibuat melebar mengikuti bentuk
 * section-nya di halaman utama, bukan 4:3 seperti foto
 * profil.
 */
const visionPhotoButtonVariants = cva(["relative aspect-video w-full max-w-xl overflow-hidden rounded-lg", "bg-gray-100", "flex items-center justify-center", "disabled:cursor-default"]);

const removeMisiButtonVariants = cva(["rounded-xl shrink-0", "text-red-500 hover:bg-red-50 hover:text-red-600"]);

const EMPTY_PROFILE: SchoolProfile = {
  photo_url: null,
  vision_photo_url: null,
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

  const [isPreparingVisionPhoto, setIsPreparingVisionPhoto] = useState(false);
  const visionFileInputRef = useRef<HTMLInputElement>(null);
  const pendingVisionPhotoFileRef = useRef<File | null>(null);

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

  async function handleVisionPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPreparingVisionPhoto(true);
    try {
      const preparedFile = await prepareImageForUpload(file);
      pendingVisionPhotoFileRef.current = preparedFile;
      updateDraft({ vision_photo_url: URL.createObjectURL(preparedFile) });
    } catch (error) {
      console.error("Failed to prepare vision photo:", error);
      toast.error("Gagal memproses foto", "Coba lagi.");
    } finally {
      setIsPreparingVisionPhoto(false);
    }
  }

  function handleRemoveVisionPhoto() {
    pendingVisionPhotoFileRef.current = null;
    updateDraft({ vision_photo_url: null });

    if (visionFileInputRef.current) {
      visionFileInputRef.current.value = "";
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
    let visionPhotoUrl = draft.vision_photo_url;

    const pendingFile = pendingPhotoFileRef.current;
    const pendingVisionFile = pendingVisionPhotoFileRef.current;

    if (pendingFile || pendingVisionFile) {
      setIsUploading(true);

      try {
        if (pendingFile) {
          photoUrl = await uploadPhoto("school-profile-photos", pendingFile);
        }

        if (pendingVisionFile) {
          visionPhotoUrl = await uploadPhoto("school-profile-photos", pendingVisionFile);
        }
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
      const misi = draft.misi.map((item) => item.trim()).filter((item) => item.length > 0);
      const saved = await updateSchoolProfile({
        ...draft,
        misi,
        photo_url: photoUrl,
        vision_photo_url: visionPhotoUrl,
      });
      setDraft(saved);
      pendingPhotoFileRef.current = null;
      pendingVisionPhotoFileRef.current = null;
      toast.success("Profil sekolah disimpan");
    } catch (error) {
      console.error("Failed to save school profile:", error);
      toast.error("Gagal menyimpan", "Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Profil Sekolah" description="Deskripsi, visi, misi, foto, dan info kontak yang dipakai di section Tentang, Visi & Misi, Kontak, dan Footer." />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">Gagal memuat data profil sekolah. Coba refresh halaman.</p>
        </div>
      ) : (
        <div className="space-y-6 pb-24">
          <AdminFormSection title="Identitas sekolah" description="Foto gedung dan deskripsi yang tampil di section Hero dan Tentang.">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isPreparingPhoto} className={photoButtonVariants()}>
              {draft.photo_url ? <img src={draft.photo_url} alt="Foto profil sekolah" className="w-full h-full object-cover" /> : <span className="text-gray-500 font-medium px-4 text-center">Foto Profil Sekolah</span>}

              {isUploading || isPreparingPhoto ? (
                <div className={photoOverlayVariants()}>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-medium">{isPreparingPhoto ? "Memproses foto..." : "Mengunggah..."}</span>
                </div>
              ) : (
                <div className={cn(photoOverlayVariants(), "opacity-0 hover:opacity-100 transition-opacity")}>
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium">Ganti foto</span>
                </div>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <div className="space-y-1.5">
              <Label htmlFor="about-description">Deskripsi (pisahkan paragraf dengan baris kosong)</Label>
              <Textarea id="about-description" value={draft.description} onChange={(e) => updateDraft({ description: e.target.value })} className="min-h-32 rounded-lg" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="Visi &amp; Misi" description="Tampil pada section Visi &amp; Misi dengan foto latar di halaman utama.">
            <div className="space-y-1.5">
              <Label htmlFor="about-visi">Visi</Label>
              <Textarea id="about-visi" value={draft.visi} onChange={(e) => updateDraft({ visi: e.target.value })} className="min-h-20 rounded-lg" />
            </div>

            <div className="space-y-1.5">
              <Label>Misi</Label>
              <div className="space-y-2">
                {draft.misi.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={item} onChange={(e) => handleMisiChange(index, e.target.value)} placeholder="mis. Membentuk karakter siswa yang Islami" className="rounded-lg" />
                    <Button type="button" size="icon" variant="outline" onClick={() => handleRemoveMisi(index)} aria-label="Hapus poin misi" className={removeMisiButtonVariants()}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" size="sm" variant="outline" onClick={handleAddMisi} className="rounded-lg">
                <Plus className="w-4 h-4" />
                Tambah Poin Misi
              </Button>
            </div>

            {/* Foto latar section Visi & Misi */}
            <div className="space-y-1.5">
              <Label>Foto Latar Visi &amp; Misi</Label>

              <p className="text-xs text-gray-500">
                Dipakai sebagai latar section Visi &amp; Misi di halaman utama. Foto akan ditutup lapisan gelap agar teks tetap terbaca. Pilih foto melebar (landscape). Kalau dikosongkan, latarnya memakai warna polos.
              </p>

              <button type="button" onClick={() => visionFileInputRef.current?.click()} disabled={isUploading || isPreparingVisionPhoto} className={visionPhotoButtonVariants()}>
                {draft.vision_photo_url ? <img src={draft.vision_photo_url} alt="Foto latar visi dan misi" className="w-full h-full object-cover" /> : <span className="text-gray-500 font-medium px-4 text-center">Belum ada foto latar</span>}

                {isUploading || isPreparingVisionPhoto ? (
                  <div className={photoOverlayVariants()}>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm font-medium">{isPreparingVisionPhoto ? "Memproses foto..." : "Mengunggah..."}</span>
                  </div>
                ) : (
                  <div className={cn(photoOverlayVariants(), "opacity-0 hover:opacity-100 transition-opacity")}>
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">{draft.vision_photo_url ? "Ganti foto" : "Pilih foto"}</span>
                  </div>
                )}
              </button>

              <input ref={visionFileInputRef} type="file" accept="image/*" onChange={handleVisionPhotoChange} className="hidden" />

              {draft.vision_photo_url && (
                <Button type="button" size="sm" variant="outline" onClick={handleRemoveVisionPhoto} className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                  Hapus foto latar
                </Button>
              )}
            </div>
          </AdminFormSection>

          <AdminFormSection title="Kontak &amp; media sosial" description="Dipakai di section Pendaftaran dan di footer halaman utama.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="about-alamat">Alamat</Label>
                <Textarea id="about-alamat" value={draft.alamat} onChange={(e) => updateDraft({ alamat: e.target.value })} className="min-h-20 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-jam">Jam Operasional</Label>
                <Textarea id="about-jam" value={draft.jam_operasional} onChange={(e) => updateDraft({ jam_operasional: e.target.value })} className="min-h-20 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-telepon">Telepon</Label>
                <Input id="about-telepon" value={draft.telepon} onChange={(e) => updateDraft({ telepon: e.target.value })} placeholder="mis. (021) XXXX-XXXX" className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-whatsapp">Nomor WhatsApp</Label>
                <Input id="about-whatsapp" value={draft.whatsapp} onChange={(e) => updateDraft({ whatsapp: e.target.value })} placeholder="08xx-xxxx-xxxx" className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-email">Email</Label>
                <Input id="about-email" value={draft.email} onChange={(e) => updateDraft({ email: e.target.value })} placeholder="mis. info@sdidarussalam.sch.id" className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-facebook">Facebook</Label>
                <Input id="about-facebook" value={draft.facebook} onChange={(e) => updateDraft({ facebook: e.target.value })} placeholder="URL profil Facebook" className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-instagram">Instagram</Label>
                <Input id="about-instagram" value={draft.instagram} onChange={(e) => updateDraft({ instagram: e.target.value })} placeholder="URL profil Instagram" className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-tiktok">TikTok</Label>
                <Input id="about-tiktok" value={draft.tiktok} onChange={(e) => updateDraft({ tiktok: e.target.value })} placeholder="URL profil TikTok" className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-youtube">YouTube</Label>
                <Input id="about-youtube" value={draft.youtube} onChange={(e) => updateDraft({ youtube: e.target.value })} placeholder="URL channel YouTube" className="rounded-lg" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="about-whatsapp-message">Pesan Template WhatsApp</Label>
              <Textarea
                id="about-whatsapp-message"
                value={draft.whatsapp_message}
                onChange={(e) => updateDraft({ whatsapp_message: e.target.value })}
                placeholder="mis. Assalamu'alaikum, saya ingin bertanya seputar pendaftaran di SD Islam Darussalam Cikunir."
                className="min-h-24 rounded-lg"
              />
              <p className="text-xs text-gray-500">Pesan ini otomatis terisi di kolom chat WhatsApp saat pengunjung website mengklik ikon WhatsApp di section Kontak.</p>
            </div>
          </AdminFormSection>

          {/*
            Bilah simpan menempel di bawah layar. Form ini
            panjang, jadi tombolnya harus tetap terjangkau
            tanpa menggulir sampai ujung.
          */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm lg:left-64">
            <div className="mx-auto flex max-w-4xl items-center justify-end gap-3">
              <p className="mr-auto hidden text-xs text-gray-500 sm:block">Perubahan baru tersimpan setelah tombol ini ditekan.</p>

              <Button type="button" variant="gradient" onClick={handleSave} disabled={isSaving || isUploading || isPreparingPhoto} className="w-full sm:w-auto">
                <Check className="h-4 w-4" />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
