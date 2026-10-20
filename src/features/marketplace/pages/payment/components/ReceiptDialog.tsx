import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import type { Order } from "@/features/marketplace/types/payment";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";
import { etherscanUrl, formatOrderDate, providerLabels, shortHash } from "@/features/marketplace/utils/payment";
import { tokenId } from "@/features/marketplace/utils/tokenId";

const metaClass =
  "receipt-meta flex min-h-[65px] items-center justify-between gap-3 border-b border-primary px-9 text-[13px] max-[640px]:flex-wrap max-[640px]:px-5 max-[640px]:py-3 [&>div]:flex [&>div]:flex-col [&>div]:gap-1 [&>div+div]:border-l [&>div+div]:border-border [&>div+div]:pl-3 [&_dt]:font-bold [&_dd]:text-muted-foreground";

export function ReceiptDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      {order && (
        <DialogContent
          showCloseButton={false}
          className="w-[578px] max-w-[calc(100%-32px)] gap-0 overflow-hidden rounded-[6px] bg-surface p-0 pb-2.5 text-foreground shadow-[0_0_40px_rgba(10,6,4,.45)] ring-0 sm:max-w-[calc(100%-32px)]"
          aria-describedby="receipt-note"
        >
          <button
            type="button"
            className="absolute top-3 right-3 grid size-8 cursor-pointer place-items-center bg-transparent"
            aria-label="Fechar"
            onClick={onClose}
          >
            <img src="/images/pay-close.svg" alt="" />
          </button>
          <header className="flex h-[156px] flex-col items-center justify-center gap-4 border-b border-primary">
            <img className="size-20" src="/images/thank-you.svg" alt="" />
            <DialogTitle className="font-[family-name:inherit] text-[16px] leading-[1.2] font-bold text-muted-foreground">
              Seus NFTs agora estão na sua carteira
            </DialogTitle>
          </header>
          <dl className={metaClass}>
            <div>
              <dt>ID da transação</dt>
              <dd title={order.txHash}>{shortHash(order.txHash)}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>{formatOrderDate(order.createdAt)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{formatEth(toWei(order.total), 3)} ETH</dd>
            </div>
            <div>
              <dt>Carteira</dt>
              <dd>{providerLabels[order.provider]}</dd>
            </div>
          </dl>
          <section className="flex flex-col gap-3 px-9 pt-5 max-[640px]:px-5" aria-label="Detalhes da transação">
            <h2 className="text-[16px] font-bold">Detalhes da transação</h2>
            <div
              className="grid grid-cols-[1fr_auto_auto] gap-10 border-b-[.3px] border-primary pb-2 text-[14px] text-muted-foreground max-[640px]:hidden"
              aria-hidden="true"
            >
              <span>NFTs</span>
              <span>Edições</span>
              <span>Subtotal</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {order.items.map((item) => (
                <li className="flex h-[70px] items-center gap-3 rounded-[6px] bg-surface-raised pr-3" key={item.id}>
                  <img className="size-[70px] rounded-[8px_0_0_8px] object-cover" src={item.image} alt="" />
                  <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <strong className="overflow-hidden text-[15px] text-ellipsis whitespace-nowrap">{item.name}</strong>
                    <span className="text-[13px] text-[#b39463]">ID do token: {tokenId(item.name)}</span>
                  </div>
                  <span className="text-[14px] text-muted-foreground">(x {item.quantity})</span>
                  <b className="min-w-[88px] text-right text-primary-light">
                    {formatEth(toWei(item.price) * BigInt(item.quantity))} ETH
                  </b>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-[14px]">
              <span>Taxa de rede</span>
              <span>{order.networkFee} ETH</span>
            </div>
            <div className="flex justify-between border-b border-primary pb-4 text-[16px] font-bold">
              <span>Total</span>
              <b className="text-[18px] text-primary-light">{formatEth(toWei(order.total), 3)} ETH</b>
            </div>
          </section>
          <DialogDescription
            id="receipt-note"
            className="m-0 px-9 pt-4 text-center text-[13px] leading-[1.5] text-muted-foreground max-[640px]:px-5"
          >
            Transação confirmada na {order.network === "Polygon" ? "Polygon" : "Ethereum"}. A propriedade foi
            transferida para sua carteira conectada e registrada na rede.
          </DialogDescription>
          <a
            className="mx-auto mt-4 mb-5 block w-fit rounded-[5px] bg-primary px-7 py-3 text-[14px] font-bold text-background"
            href={etherscanUrl(order.txHash)}
            target="_blank"
            rel="noreferrer"
          >
            Ver no Etherscan
          </a>
        </DialogContent>
      )}
    </Dialog>
  );
}
