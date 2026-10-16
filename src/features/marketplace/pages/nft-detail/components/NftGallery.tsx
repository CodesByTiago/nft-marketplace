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

export function NftGallery({ name, image, favorite, onFavorite, onBack }: NftGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="detail-gallery">
      <div className="detail-mobile-actions">
        <Button variant="ghost" size="icon" aria-label="Voltar" onClick={onBack}>
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={favorite ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} />
        </Button>
      </div>
      <div className="detail-thumbnails">
        {Array.from({ length: THUMBNAIL_COUNT }, (_, index) => (
          <button
            type="button"
            key={index}
            className="detail-thumbnail"
            aria-label={`Ver imagem ${index + 1} de ${name}`}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <img src={image} alt="" />
          </button>
        ))}
      </div>
      <div className="detail-main-image">
        <img src={image} alt={name} />
        <button type="button" className="detail-zoom" aria-label="Ampliar imagem" onClick={() => setZoomed(true)}>
          <img src="/images/detail-zoom.svg" alt="" width="30" height="30" />
        </button>
      </div>
      <Dialog open={zoomed} onOpenChange={setZoomed}>
        <DialogContent className="detail-zoom-dialog">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">Imagem ampliada do NFT.</DialogDescription>
          <img src={image} alt={name} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
