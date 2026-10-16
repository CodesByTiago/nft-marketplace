import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { CartEntry, CartQuote } from "@/features/marketplace/types/nft";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";
import { tokenId } from "@/features/marketplace/utils/tokenId";
import { WalletOptions } from "./WalletOptions";

type OrderSummaryProps = {
  items: CartEntry[];
  quote?: CartQuote;
  provider: WalletProvider;
  onProvider: (provider: WalletProvider) => void;
  confirm: ReactNode;
};

export function OrderSummary({ items, quote, provider, onProvider, confirm }: OrderSummaryProps) {
  return (
    <aside className="pay-summary" aria-label="Resumo do pedido" aria-busy={!quote}>
      <h2>Seus NFTs</h2>
      <div className="pay-list-head" aria-hidden="true">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>
      <ul className="pay-items">
        {items.map(({ nft, quantity }) => (
          <li key={nft.id}>
            <img src={nft.image} alt="" />
            <div>
              <strong>{nft.name}</strong>
              <span className="pay-token">ID do token: {tokenId(nft.name)}</span>
              <span className="pay-qty">(x {quantity})</span>
            </div>
            <b>{formatEth(toWei(nft.price) * BigInt(quantity))} ETH</b>
          </li>
        ))}
      </ul>
      <p className="pay-promo">
        Tem um código promocional? <Link to="/carrinho">Aplique aqui</Link>
      </p>
      {quote ? (
        <dl className="pay-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatEth(toWei(quote.subtotal))} ETH</dd>
          </div>
          <div>
            <dt>{quote.coupon?.status === "applied" ? `Cupom ${quote.coupon.code}` : "Desconto do lançamento"}</dt>
            <dd className="pay-discount">(-) {formatEth(toWei(quote.discount))}</dd>
          </div>
          <div>
            <dt>Taxa de rede</dt>
            <dd>
              {quote.networkFee} ETH
              <small>Taxa estimada</small>
            </dd>
          </div>
          <div className="pay-total">
            <dt>Total</dt>
            <dd>{formatEth(toWei(quote.total), 3)} ETH</dd>
          </div>
        </dl>
      ) : (
        <div className="cart-quote-skeleton" role="status" aria-label="Calculando resumo">
          <span />
          <span />
          <span />
        </div>
      )}
      <WalletOptions provider={provider} onChange={onProvider} />
      {confirm}
    </aside>
  );
}
