import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import type { Order } from "@/features/marketplace/types/payment";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";
import { etherscanUrl, formatOrderDate, providerLabels, shortHash } from "@/features/marketplace/utils/payment";
import { tokenId } from "@/features/marketplace/utils/tokenId";

export function ReceiptDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      {order && (
        <DialogContent showCloseButton={false} className="receipt" aria-describedby="receipt-note">
          <button type="button" className="receipt-close" aria-label="Fechar" onClick={onClose}>
            <img src="/images/pay-close.svg" alt="" />
          </button>
          <header className="receipt-head">
            <img src="/images/thank-you.svg" alt="" />
            <DialogTitle>Seus NFTs agora estão na sua carteira</DialogTitle>
          </header>
          <dl className="receipt-meta">
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
          <section className="receipt-body" aria-label="Detalhes da transação">
            <h2>Detalhes da transação</h2>
            <div className="receipt-list-head" aria-hidden="true">
              <span>NFTs</span>
              <span>Edições</span>
              <span>Subtotal</span>
            </div>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <span>ID do token: {tokenId(item.name)}</span>
                  </div>
                  <span className="receipt-qty">(x {item.quantity})</span>
                  <b>{formatEth(toWei(item.price) * BigInt(item.quantity))} ETH</b>
                </li>
              ))}
            </ul>
            <div className="receipt-line">
              <span>Taxa de rede</span>
              <span>{order.networkFee} ETH</span>
            </div>
            <div className="receipt-line receipt-total">
              <span>Total</span>
              <b>{formatEth(toWei(order.total), 3)} ETH</b>
            </div>
          </section>
          <DialogDescription id="receipt-note" className="receipt-note">
            Transação confirmada na {order.network === "Polygon" ? "Polygon" : "Ethereum"}. A propriedade foi
            transferida para sua carteira conectada e registrada na rede.
          </DialogDescription>
          <a className="receipt-link" href={etherscanUrl(order.txHash)} target="_blank" rel="noreferrer">
            Ver no Etherscan
          </a>
        </DialogContent>
      )}
    </Dialog>
  );
}
