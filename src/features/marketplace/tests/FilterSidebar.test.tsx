import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterSidebar } from "@/features/marketplace/pages/home/components/FilterSidebar";

const baseProps = {
  categories: [
    { label: "Arte digital", count: 14 },
    { label: "Fotografia", count: 5 },
  ],
  networks: [{ label: "Ethereum", count: 41 }],
  category: "",
  network: "",
  minPrice: 0.02,
  maxPrice: 12.3,
  hasActiveFilters: false,
  onCategory: vi.fn(),
  onNetwork: vi.fn(),
  onApplyPrice: vi.fn(),
  onClear: vi.fn(),
  onClose: vi.fn(),
};

describe("FilterSidebar", () => {
  it("não mostra o botão de limpar sem filtros ativos", () => {
    render(<FilterSidebar {...baseProps} />);

    expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument();
  });

  it("marca a categoria ativa e limpa os filtros pelo botão", async () => {
    const onClear = vi.fn();
    render(<FilterSidebar {...baseProps} category="Fotografia" hasActiveFilters onClear={onClear} />);

    expect(screen.getByRole("button", { name: /Fotografia/ })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(onClear).toHaveBeenCalledOnce();
  });

  it("desabilita categorias sem NFTs, exceto se já estiver selecionada", () => {
    const categories = [
      { label: "Arte digital", count: 14 },
      { label: "Música", count: 0 },
    ];
    const { rerender } = render(<FilterSidebar {...baseProps} categories={categories} />);
    expect(screen.getByRole("button", { name: /Música/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Arte digital/ })).toBeEnabled();

    rerender(<FilterSidebar {...baseProps} categories={categories} category="Música" hasActiveFilters />);
    expect(screen.getByRole("button", { name: /Música/ })).toBeEnabled();
  });

  it("alterna a categoria ao clicar, mantendo as demais selecionadas", async () => {
    const onCategory = vi.fn();
    render(<FilterSidebar {...baseProps} category="Fotografia" hasActiveFilters onCategory={onCategory} />);

    await userEvent.click(screen.getByRole("button", { name: /Arte digital/ }));
    expect(onCategory).toHaveBeenLastCalledWith("Fotografia,Arte digital");

    await userEvent.click(screen.getByRole("button", { name: /Fotografia/ }));
    expect(onCategory).toHaveBeenLastCalledWith("");
  });
});
