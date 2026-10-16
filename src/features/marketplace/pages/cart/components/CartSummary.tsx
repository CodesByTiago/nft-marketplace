import { useState, type FormEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { getCartQuote } from "@/features/marketplace/services/nftService";
import type { CartEntry, CouponStatus } from "@/features/marketplace/types/nft";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";

const couponMessages: Record<Exclude<CouponStatus, "applied">, string> = {
  invalid: "Código promocional inválido.",
  expired: "Este código promocional expirou.",
};

export function CartSummary({ items }: { items: CartEntry[] }) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const navigate = useNavigate();
  const lines = items.map(({ nft, quantity }) => ({ id: nft.id, quantity }));

  const {
    data: quote,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["cart-quote", lines, applied],
    queryFn: () => getCartQuote(lines, applied || undefined),
    placeholderData: keepPreviousData,
  });

  const coupon = quote?.coupon;
  const couponApplied = coupon?.status === "applied";
  const couponError = coupon && coupon.status !== "applied" ? couponMessages[coupon.status] : undefined;

  function applyCoupon(event: FormEvent) {
    event.preventDefault();
    setApplied(code.trim());
  }

  function removeCoupon() {
    setApplied("");
    setCode("");
  }

  return (
    <aside className="cart-summary-panel" aria-label="Resumo da carteira" aria-busy={!quote || isFetching}>
      <h2>Resumo da carteira</h2>
      <form className="cart-coupon" onSubmit={applyCoupon}>
        <label htmlFor="cart-coupon">Código promocional</label>
        <div>
          <input
            id="cart-coupon"
            value={code}
            placeholder="Digite seu código"
            aria-invalid={Boolean(couponError)}
            aria-describedby="cart-coupon-feedback"
            onChange={(event) => setCode(event.target.value)}
          />
          {couponApplied ? (
            <button type="button" onClick={removeCoupon}>
              Remover
            </button>
          ) : (
            <button type="submit" disabled={!code.trim()}>
              Aplicar
            </button>
          )}
        </div>
        <p id="cart-coupon-feedback" role="status" className={couponError ? "is-error" : undefined}>
          {couponError ?? (couponApplied ? `Código ${coupon.code} aplicado (-${coupon.percent}%).` : "")}
        </p>
      </form>

      {isError && !quote ? (
        <div className="cart-quote-error" role="alert">
          <p>Não foi possível calcular o resumo.</p>
          <button type="button" onClick={() => void refetch()}>
            Tentar novamente
          </button>
        </div>
      ) : !quote ? (
        <div className="cart-quote-skeleton" role="status" aria-label="Calculando resumo">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : (
        <dl className="cart-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatEth(toWei(quote.subtotal))} ETH</dd>
          </div>
          <div>
            <dt>Desconto do lançamento</dt>
            <dd className="cart-discount">(-) {formatEth(toWei(quote.discount))}</dd>
          </div>
          <div>
            <dt>Taxa de rede</dt>
            <dd>
              {quote.networkFee} ETH
              <small>Taxa estimada</small>
            </dd>
          </div>
          <div className="cart-total">
            <dt>Total</dt>
            <dd>{formatEth(toWei(quote.total), 3)} ETH</dd>
          </div>
        </dl>
      )}

      <button
        type="button"
        className="cart-checkout"
        disabled={!quote}
        onClick={() =>
          void navigate({ to: "/pagamento", search: { coupon: couponApplied ? coupon?.code : undefined } })
        }
      >
        Conectar e finalizar
      </button>
      <Link className="cart-continue" to="/">
        Continuar explorando
      </Link>
    </aside>
  );
}
