import { cn } from "@/shared/utils/cn";

export function QuoteSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Calculando resumo">
      {Array.from({ length: rows }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-6 animate-[shimmer_1.4s_infinite] rounded-[6px] bg-[linear-gradient(100deg,var(--surface),#33221a_45%,var(--surface))] bg-size-[200%_100%] motion-reduce:animate-none",
            index === rows - 1 && "mt-2 h-8",
          )}
        />
      ))}
    </div>
  );
}
