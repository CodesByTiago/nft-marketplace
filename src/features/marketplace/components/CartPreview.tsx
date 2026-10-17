import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";
import type { CartEntry } from "@/features/marketplace/types/nft";

const PREVIEW_ITEMS = 2;

// Ícone do carrinho com uma prévia que abre abaixo dele ao passar o mouse ou focar (CSS em cart.css).
export function CartPreview({ items }: { items: CartEntry[] }) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const visible = items.slice(0, PREVIEW_ITEMS);
  const hidden = items.length - visible.length;
  const onCartPage = useLocation({ select: (location) => location.pathname === "/carrinho" });

  return (
    <div className="cart-preview-wrap">
      <Button variant="ghost" size="icon-lg" className="desktop-cart" asChild>
        <Link to="/carrinho" aria-label={`Abrir carrinho, ${count} itens`}>
          <img src="/images/icon-cart.svg" alt="" width="24" height="24" />
          {count > 0 && (
            <span className="cart-count" key={count}>
              <img src="/images/icon-badge.svg" alt="" />
              <span>{count}</span>
            </span>
          )}
        </Link>
      </Button>
      {!onCartPage && (
        <section className="cart-preview" aria-label="Prévia do carrinho">
          <h2>
            Carrinho <span>({count})</span>
          </h2>
          {visible.length === 0 ? (
            <p className="cart-preview-empty">Seu carrinho está vazio.</p>
          ) : (
            <ul>
              {visible.map(({ nft, quantity }) => (
                <li key={nft.id}>
                  <img src={nft.image} alt="" />
                  <div>
                    <strong>{nft.name}</strong>
                    <span>
                      {quantity} × {nft.price} ETH
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {hidden > 0 && (
            <p className="cart-preview-more">{hidden === 1 ? "+ 1 outro item" : `+ ${hidden} outros itens`}</p>
          )}
          <Button className="cart-preview-cta" asChild>
            <Link to="/carrinho">Ver carrinho completo</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
