import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

interface Props {
  title: string;
  photos: string[];
  /** Overlay content shown on the cover (e.g. status badge). */
  overlay?: React.ReactNode;
}

/** Cover photo for a project card; with several photos it becomes a swipeable gallery with a full-screen viewer. */
export function ProjectGallery({ title, photos, overlay }: Props) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  if (photos.length === 0) return null;

  const many = photos.length > 1;
  const go = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  const arrows = (size: "sm" | "lg") =>
    many && (
      <>
        <button
          type="button"
          aria-label="Previous photo"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 transition ${size === "lg" ? "p-3" : "p-1.5"}`}
        >
          <ChevronLeft className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 transition ${size === "lg" ? "p-3" : "p-1.5"}`}
        >
          <ChevronRight className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
        </button>
      </>
    );

  return (
    <>
      <div
        className="relative aspect-video bg-muted cursor-zoom-in group"
        onClick={() => setOpen(true)}
        data-testid="project-gallery"
      >
        <img src={photos[index]} alt={`${title} photo ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
        {overlay}
        {arrows("sm")}
        {many && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            <Images className="h-3 w-3" />
            {index + 1} / {photos.length}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black border-0 overflow-hidden">
          <DialogTitle className="sr-only">{title} photos</DialogTitle>
          <div className="relative flex items-center justify-center bg-black" onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(-1);
            if (e.key === "ArrowRight") go(1);
          }}>
            <img src={photos[index]} alt={`${title} photo ${index + 1}`} className="max-h-[80vh] w-auto object-contain" />
            {arrows("lg")}
          </div>
          {many && (
            <div className="flex gap-2 overflow-x-auto p-3 bg-black">
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`shrink-0 h-14 w-20 overflow-hidden rounded border-2 ${i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                  aria-label={`Show photo ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
