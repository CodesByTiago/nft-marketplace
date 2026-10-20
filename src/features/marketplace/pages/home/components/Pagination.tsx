import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

const VISIBLE_PAGES = 5;
const pageButton = "size-[35px] rounded-none text-base leading-normal font-normal";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
};

export function Pagination({ page, pageCount, onPage }: PaginationProps) {
  const first = Math.max(1, Math.min(page - 2, pageCount - (VISIBLE_PAGES - 1)));
  const last = Math.min(pageCount, first + VISIBLE_PAGES - 1);
  const numbers = Array.from({ length: last - first + 1 }, (_, index) => first + index);

  return (
    <nav className="pagination mt-[88px] flex justify-end gap-2 max-[640px]:mt-14" aria-label="Paginação do catálogo">
      <Button
        className={pageButton}
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onPage(Math.max(1, page - 1))}
      >
        <ChevronLeft />
      </Button>
      {numbers.map((number) => (
        <Button
          key={number}
          className={pageButton}
          variant={page === number ? "default" : "ghost"}
          aria-current={page === number ? "page" : undefined}
          onClick={() => onPage(number)}
        >
          {number}
        </Button>
      ))}
      <Button
        className={pageButton}
        variant="outline"
        size="icon"
        aria-label="Próxima página"
        disabled={page >= pageCount}
        onClick={() => onPage(Math.min(pageCount, page + 1))}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
