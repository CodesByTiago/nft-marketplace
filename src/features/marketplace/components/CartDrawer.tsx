import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";
import type { CartEntry } from "@/features/marketplace/types/nft";

type CartDrawerProps = {
  items: CartEntry[];
  onClose: () => void;
  onQuantity: (id: string, change: number) => void;
};

export function CartDrawer({ items, onClose, onQuantity }: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + toWei(item.nft.price) * BigInt(item.quantity), 0n);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="cart-dialog" showCloseButton={false}>
        <DialogHeader className="drawer-heading">
          <div>
            <span className="eyebrow">Sua seleção</span>
            <DialogTitle>
              Carrinho <span>({items.length})</span>
            </DialogTitle>
            <DialogDescription className="sr-only">Itens selecionados para o seu carrinho.</DialogDescription>
          </div>
          <Button variant="ghost" size="icon" aria-label="Fechar carrinho" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </DialogHeader>
        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag aria-hidden="true" />
            <h3>Seu carrinho está vazio</h3>
            <p>Descubra uma peça única para começar sua coleção.</p>
            <Button variant="link" onClick={onClose}>
              Explorar NFTs <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(({ nft, quantity }) => (
                <article className="cart-item" key={nft.id}>
                  <img src={nft.image} alt="" />
                  <div className="cart-item-info">
                    <span>{nft.collection}</span>
                    <strong>{nft.name}</strong>
                    <span>{nft.price} ETH</span>
                  </div>
                  <div className="quantity-control" aria-label={`Quantidade de ${nft.name}`}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Diminuir quantidade"
                      onClick={() => onQuantity(nft.id, -1)}
                    >
                      <Minus />
                    </Button>
                    <span>{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Aumentar quantidade"
                      onClick={() => onQuantity(nft.id, 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatEth(total)} ETH</strong>
              </div>
              <div>
                <span>Taxa de rede</span>
                <span>Calculada no checkout</span>
              </div>
              <Button
                className="checkout-button"
                onClick={() => window.alert("O checkout faz parte das próximas etapas da entrega.")}
              >
                Continuar para o checkout <ArrowRight aria-hidden="true" />
              </Button>
              <p>Você poderá revisar todos os detalhes antes de pagar.</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
