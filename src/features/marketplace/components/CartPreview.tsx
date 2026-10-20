import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";
import type { CartEntry } from "@/features/marketplace/types/nft";

const PREVIEW_ITEMS = 2;

// Ícone do carrinho com uma prévia que abre abaixo dele ao passar o mouse ou focar (variante hover-desktop em cart.css).
export function CartPreview({ items }: { items: CartEntry[] }) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const visible = items.slice(0, PREVIEW_ITEMS);
  const hidden = items.length - visible.length;
  const onCartPage = useLocation({ select: (location) => location.pathname === "/carrinho" });

  return (
    <div className="cart-preview-wrap group/cart relative flex items-center">
      <Button variant="ghost" size="icon-lg" className="relative size-6 rounded-none p-0" asChild>
        <Link to="/carrinho" aria-label={`Abrir carrinho, ${count} itens`}>
          <img src="/images/icon-cart.svg" alt="" width="24" height="24" />
          {count > 0 && (
            <span
              className="absolute -top-0.5 -right-[3px] grid size-4 animate-[cart-pop_.4s_ease-out] place-items-center text-[10px] text-background"
              key={count}
            >
              <img className="col-start-1 row-start-1" src="/images/icon-badge.svg" alt="" />
              <span className="col-start-1 row-start-1">{count}</span>
            </span>
          )}
        </Link>
      </Button>
      {!onCartPage && (
        <section
          className="hidden before:absolute before:inset-x-0 before:bottom-full before:h-6 hover-desktop:invisible hover-desktop:absolute hover-desktop:top-full hover-desktop:-right-3 hover-desktop:z-60 hover-desktop:mt-4 hover-desktop:flex hover-desktop:w-80 hover-desktop:-translate-y-1 hover-desktop:flex-col hover-desktop:gap-3 hover-desktop:rounded-[12px] hover-desktop:border hover-desktop:border-border hover-desktop:bg-surface hover-desktop:p-4 hover-desktop:opacity-0 hover-desktop:shadow-[0_12px_32px_rgba(10,6,4,.6)] hover-desktop:transition-[opacity,translate,visibility] hover-desktop:duration-150 hover-desktop:ease-[ease] hover-desktop:group-focus-within/cart:visible hover-desktop:group-focus-within/cart:translate-y-0 hover-desktop:group-focus-within/cart:opacity-100 hover-desktop:group-hover/cart:visible hover-desktop:group-hover/cart:translate-y-0 hover-desktop:group-hover/cart:opacity-100"
          aria-label="Prévia do carrinho"
        >
          <h2 className="border-b-[.3px] border-primary pb-2 text-sm font-bold text-muted-foreground">
            Carrinho <span className="font-normal">({count})</span>
          </h2>
          {visible.length === 0 ? (
            <p className="text-xs text-muted-foreground">Seu carrinho está vazio.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {visible.map(({ nft, quantity }) => (
                <li key={nft.id} className="flex items-center gap-3">
                  <img src={nft.image} alt="" className="size-12 flex-none rounded-[6px] object-cover" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <strong className="overflow-hidden text-[13px] text-ellipsis whitespace-nowrap">{nft.name}</strong>
                    <span className="text-xs text-primary-light">
                      {quantity} × {nft.price} ETH
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {hidden > 0 && (
            <p className="text-xs text-muted-foreground">
              {hidden === 1 ? "+ 1 outro item" : `+ ${hidden} outros itens`}
            </p>
          )}
          <Button className="h-10 rounded-[3px] text-sm font-bold hover:bg-primary-light" asChild>
            <Link to="/carrinho">Ver carrinho completo</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
