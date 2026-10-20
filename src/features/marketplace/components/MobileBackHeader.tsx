import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function MobileBackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="mb-8 hidden h-11 items-center gap-6 max-[640px]:flex">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Voltar"
        className="size-[35px] rounded-full border-border bg-surface-raised hover:bg-surface-raised"
        onClick={onBack}
      >
        <ArrowLeft aria-hidden="true" />
      </Button>
      <h1 className="text-[20px] font-bold">{title}</h1>
    </header>
  );
}
