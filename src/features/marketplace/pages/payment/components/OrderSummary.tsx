import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { CartEntry, CartQuote } from "@/features/marketplace/types/nft";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { QuoteSkeleton } from "@/features/marketplace/components/QuoteSkeleton";
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

const row = "flex items-start justify-between text-[15px]";
const amount = "flex flex-col items-end text-[18px]";

export function OrderSummary({ items, quote, provider, onProvider, confirm }: OrderSummaryProps) {
  return (
    <aside
      className="flex w-[405px] flex-none flex-col gap-4 max-[900px]:w-full"
      aria-label="Resumo do pedido"
      aria-busy={!quote}
    >
      <h2 className="text-[17px] font-bold">Seus NFTs</h2>
      <div className="flex justify-between border-b-[.3px] border-primary pb-2.5 text-[16px]" aria-hidden="true">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map(({ nft, quantity }) => (
          <li className="flex h-[70px] items-center gap-3 rounded-[6px] bg-surface pr-4" key={nft.id}>
            <img className="size-[70px] flex-none rounded-[8px_0_0_8px] object-cover" src={nft.image} alt="" />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <strong className="overflow-hidden text-[16px] text-ellipsis whitespace-nowrap">{nft.name}</strong>
              <span className="text-[14px] text-[#b39463]">ID do token: {tokenId(nft.name)}</span>
              <span className="text-[14px] text-muted-foreground">(x {quantity})</span>
            </div>
            <b className="text-[18px] text-primary-light">{formatEth(toWei(nft.price) * BigInt(quantity))} ETH</b>
          </li>
        ))}
      </ul>
      <p className="text-center text-[14px]">
        Tem um código promocional?{" "}
        <Link className="text-primary-light underline" to="/carrinho">
          Aplique aqui
        </Link>
      </p>
      {quote ? (
        <dl className="pay-totals flex flex-col gap-3">
          <div className={row}>
            <dt>Subtotal</dt>
            <dd className={amount}>{formatEth(toWei(quote.subtotal))} ETH</dd>
          </div>
          <div className={row}>
            <dt>{quote.coupon?.status === "applied" ? `Cupom ${quote.coupon.code}` : "Desconto do lançamento"}</dt>
            <dd className="flex flex-col items-end text-[15px]">(-) {formatEth(toWei(quote.discount))}</dd>
          </div>
          <div className={row}>
            <dt>Taxa de rede</dt>
            <dd className={amount}>
              {quote.networkFee} ETH
              <small className="text-[12px] text-primary-light">Taxa estimada</small>
            </dd>
          </div>
          <div className={`pay-total ${row} border-t-[.3px] border-primary pt-3 text-[16px] font-bold`}>
            <dt>Total</dt>
            <dd className={`${amount} text-primary-light`}>{formatEth(toWei(quote.total), 3)} ETH</dd>
          </div>
        </dl>
      ) : (
        <QuoteSkeleton rows={3} />
      )}
      <WalletOptions provider={provider} onChange={onProvider} />
      {confirm}
    </aside>
  );
}
