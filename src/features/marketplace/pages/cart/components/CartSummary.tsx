import { useState, type FormEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/core/auth/AuthContext";
import { cn } from "@/shared/utils/cn";
import { QuoteSkeleton } from "@/features/marketplace/components/QuoteSkeleton";
import { getCartQuote } from "@/features/marketplace/services/nftService";
import type { CartEntry, CouponStatus } from "@/features/marketplace/types/nft";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";

const couponMessages: Record<Exclude<CouponStatus, "applied">, string> = {
  invalid: "Código promocional inválido.",
  expired: "Este código promocional expirou.",
};

const couponButton =
  "h-10 w-[102px] rounded-[3px] bg-primary text-[15px] font-bold text-background disabled:cursor-not-allowed disabled:opacity-50 max-[640px]:h-[50px] max-[640px]:w-[97px] max-[640px]:rounded-[0_50px_50px_0] max-[640px]:bg-transparent max-[640px]:bg-[linear-gradient(96deg,rgba(210,138,76,.54),var(--primary-kurio))]";
const totalRow = "flex items-start justify-between gap-3 max-[640px]:items-center";
const rowText = "text-[15px] max-[640px]:text-[14px]";
const amount = "flex flex-col items-end text-[18px] max-[640px]:text-[15px]";

export function CartSummary({ items }: { items: CartEntry[] }) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
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
    <aside
      className="flex w-[332px] flex-none flex-col gap-6 max-[900px]:w-full max-[640px]:fixed max-[640px]:inset-x-0 max-[640px]:bottom-0 max-[640px]:z-20 max-[640px]:w-auto max-[640px]:gap-3.5 max-[640px]:rounded-t-[32px] max-[640px]:bg-surface max-[640px]:px-7 max-[640px]:py-6 max-[640px]:shadow-[0_-6px_20px_rgba(10,6,4,.45)]"
      aria-label="Resumo da carteira"
      aria-busy={!quote || isFetching}
    >
      <h2 className="border-b-[.3px] border-primary pb-3 text-[18px] font-bold text-muted-foreground max-[640px]:hidden">
        Resumo da carteira
      </h2>
      <form className="flex flex-col gap-2" onSubmit={applyCoupon}>
        <label className="text-[14px] font-bold max-[640px]:hidden" htmlFor="cart-coupon">
          Código promocional
        </label>
        <div className="flex gap-3 max-[640px]:gap-0">
          <input
            id="cart-coupon"
            className="h-10 min-w-0 flex-1 rounded-[3px] border border-primary bg-transparent px-3 text-[12px] text-foreground placeholder:text-[#b39463] aria-invalid:border-destructive max-[640px]:h-[50px] max-[640px]:rounded-[50px_0_0_50px] max-[640px]:border-border max-[640px]:px-5 max-[640px]:text-[14px] max-[640px]:shadow-[0_2px_8px_rgba(10,6,4,.4)]"
            value={code}
            placeholder="Digite seu código"
            aria-invalid={Boolean(couponError)}
            aria-describedby="cart-coupon-feedback"
            onChange={(event) => setCode(event.target.value)}
          />
          {couponApplied ? (
            <button type="button" className={couponButton} onClick={removeCoupon}>
              Remover
            </button>
          ) : (
            <button type="submit" className={couponButton} disabled={!code.trim()}>
              Aplicar
            </button>
          )}
        </div>
        <p
          id="cart-coupon-feedback"
          role="status"
          className={cn("min-h-4 text-[12px] text-primary-light max-[640px]:min-h-0", couponError && "text-[#ff8a8a]")}
        >
          {couponError ?? (couponApplied ? `Código ${coupon.code} aplicado (-${coupon.percent}%).` : "")}
        </p>
      </form>

      {isError && !quote ? (
        <div className="flex flex-col gap-2 text-[14px] text-muted-foreground" role="alert">
          <p>Não foi possível calcular o resumo.</p>
          <button
            type="button"
            className="self-start bg-transparent text-primary-light underline"
            onClick={() => void refetch()}
          >
            Tentar novamente
          </button>
        </div>
      ) : !quote ? (
        <QuoteSkeleton rows={4} />
      ) : (
        <dl className="cart-totals flex flex-col gap-4 max-[640px]:gap-2.5">
          <div className={`${totalRow} ${rowText}`}>
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className={amount}>{formatEth(toWei(quote.subtotal))} ETH</dd>
          </div>
          <div className={`${totalRow} ${rowText}`}>
            <dt className="text-muted-foreground">Desconto do lançamento</dt>
            <dd className="cart-discount flex flex-col items-end text-[15px] text-muted-foreground">
              (-) {formatEth(toWei(quote.discount))}
            </dd>
          </div>
          <div className={`${totalRow} ${rowText}`}>
            <dt className="text-muted-foreground">Taxa de rede</dt>
            <dd className={amount}>
              {quote.networkFee} ETH
              <small className="text-[12px] text-primary-light">Taxa estimada</small>
            </dd>
          </div>
          <div
            className={`cart-total ${totalRow} border-t-[.3px] border-primary pt-4 text-[16px] font-bold max-[640px]:pt-2.5`}
          >
            <dt>Total</dt>
            <dd className={`${amount} font-bold text-primary-light`}>{formatEth(toWei(quote.total), 3)} ETH</dd>
          </div>
        </dl>
      )}

      <button
        type="button"
        className="h-10 rounded-[3px] bg-primary text-[15px] font-bold text-background disabled:cursor-not-allowed disabled:opacity-50 max-[640px]:h-[60px] max-[640px]:rounded-[60px] max-[640px]:bg-transparent max-[640px]:bg-[linear-gradient(109deg,var(--primary-kurio),rgba(210,138,76,.8))] max-[640px]:text-[17px]"
        disabled={!quote || Boolean(quote.unavailable?.length)}
        onClick={() => {
          const checkout = () =>
            void navigate({ to: "/pagamento", search: { coupon: couponApplied ? coupon?.code : undefined } });
          if (user) checkout();
          else openAuth("login", checkout);
        }}
      >
        Conectar e finalizar
      </button>
      <Link className="text-center text-[15px] text-primary-light hover:underline max-[640px]:hidden" to="/">
        Continuar explorando
      </Link>
    </aside>
  );
}
