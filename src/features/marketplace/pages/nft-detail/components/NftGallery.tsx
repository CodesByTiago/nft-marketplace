import { useState } from "react";
import { ChevronLeft, Heart } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";

type NftGalleryProps = {
  name: string;
  image: string;
  favorite: boolean;
  onFavorite: () => void;
  onBack: () => void;
};

const THUMBNAIL_COUNT = 4;
const MOBILE_ACTION = "size-[35px] rounded-full border border-border bg-surface-raised hover:bg-surface-raised";

export function NftGallery({ name, image, favorite, onFavorite, onBack }: NftGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="relative flex w-[573px] flex-none basis-[573px] justify-between gap-4 max-[900px]:w-full max-[900px]:basis-auto max-[640px]:grid max-[640px]:h-[506px] max-[640px]:justify-items-center max-[640px]:bg-[linear-gradient(137.6deg,#241612,#2f1d15)] max-[640px]:pt-[23px]">
      <div className="absolute top-[23px] right-7 left-7 z-2 hidden justify-between max-[640px]:flex">
        <Button variant="ghost" size="icon" className={MOBILE_ACTION} aria-label="Voltar" onClick={onBack}>
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={MOBILE_ACTION}
          aria-label={favorite ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} />
        </Button>
      </div>
      <div className="flex flex-col gap-4 max-[640px]:hidden">
        {Array.from({ length: THUMBNAIL_COUNT }, (_, index) => (
          <button
            type="button"
            key={index}
            className="size-[100px] overflow-hidden rounded-xl border border-border bg-surface aria-pressed:border-primary"
            aria-label={`Ver imagem ${index + 1} de ${name}`}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <img className="size-full object-cover" src={image} alt="" />
          </button>
        ))}
      </div>
      <div className="relative grid h-[448px] w-[444px] rounded-3xl bg-surface p-4 max-[640px]:mb-[150px] max-[640px]:h-[356px] max-[640px]:w-[361px] max-[640px]:max-w-[calc(100%-53px)] max-[640px]:self-end max-[640px]:bg-transparent max-[640px]:p-0">
        <img className="size-full rounded-3xl object-cover" src={image} alt={name} />
        <button
          type="button"
          className="absolute top-[15px] right-3 grid size-[30px] place-items-center max-[640px]:hidden"
          aria-label="Ampliar imagem"
          onClick={() => setZoomed(true)}
        >
          <img src="/images/detail-zoom.svg" alt="" width="30" height="30" />
        </button>
      </div>
      <Dialog open={zoomed} onOpenChange={setZoomed}>
        <DialogContent className="w-[min(720px,calc(100%-32px))]! max-w-none! p-3! [&_img]:max-h-[80vh] [&_img]:w-full [&_img]:rounded-2xl [&_img]:object-contain">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">Imagem ampliada do NFT.</DialogDescription>
          <img src={image} alt={name} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
