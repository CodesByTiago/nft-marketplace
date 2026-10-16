import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

const VISIBLE_PAGES = 5;

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
    <nav className="pagination" aria-label="Paginação do catálogo">
      <Button
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
          variant={page === number ? "default" : "ghost"}
          aria-current={page === number ? "page" : undefined}
          onClick={() => onPage(number)}
        >
          {number}
        </Button>
      ))}
      <Button
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
