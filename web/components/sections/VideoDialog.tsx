"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

type VideoDialogProps = {
  videoId: string | null;
  title: string;
  description?: string | null;
  onClose: () => void;
};

/*
 * Pemutar video YouTube di dalam dialog.
 *
 * Video baru dimuat ketika dialog terbuka, sehingga
 * halaman tidak menarik iframe untuk setiap kartu
 * sejak awal.
 *
 * Memakai domain nocookie supaya YouTube tidak memasang
 * cookie pelacak sebelum pengunjung benar-benar menonton.
 */
export default function VideoDialog({
  videoId,
  title,
  description,
  onClose,
}: VideoDialogProps) {
  const isOpen = Boolean(videoId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        size="video"
        className="border-ink-900/40 bg-ink-900 p-0"
        contentClassName="p-0"
      >
        <div className="aspect-video w-full bg-black">
          {videoId && (
            <iframe
              key={videoId}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full border-0"
            />
          )}
        </div>

        <div className="px-5 py-4 sm:px-6">
          <h3 className="font-display text-base leading-snug font-semibold wrap-break-word text-white sm:text-lg">
            {title}
          </h3>

          {description && (
            <p className="mt-1.5 text-sm leading-relaxed wrap-break-word text-white/70">
              {description}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
