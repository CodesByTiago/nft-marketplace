import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useCanGoBack, useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useAuth } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/button";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { SiteFooter } from "@/features/marketplace/components/SiteFooter";
import { SiteHeader } from "@/features/marketplace/components/SiteHeader";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";
import { getCartQuote } from "@/features/marketplace/services/nftService";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { accounts } from "./accounts";
import { MobileWallet } from "./components/MobileWallet";
import { OrderSummary } from "./components/OrderSummary";
import { ProfileForm } from "./components/ProfileForm";
import { ReceiptDialog } from "./components/ReceiptDialog";
import { useCheckout } from "./hooks/useCheckout";
import { emptyProfile, validateProfile, type Profile, type ProfileErrors } from "./profile";

function PaymentContent() {
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { coupon } = useSearch({ strict: false }) as { coupon?: string };
  const { cart, cartLoading, removeItems } = useCartPanel();
  const { order, submitting, error, submit, closeReceipt } = useCheckout(removeItems);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [provider, setProvider] = useState<WalletProvider>("coinbase");
  const [accountId, setAccountId] = useState(accounts[0].id);

  const lines = cart.map(({ nft, quantity }) => ({ id: nft.id, quantity }));
  const { data: quote, isFetching } = useQuery({
    queryKey: ["cart-quote", lines, coupon ?? ""],
    queryFn: () => getCartQuote(lines, coupon),
    enabled: lines.length > 0,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Pagamento | Kurio";
    return () => {
      document.title = "Kurio";
    };
  }, []);

  function goBack() {
    if (canGoBack) router.history.back();
    else void navigate({ to: "/carrinho" });
  }

  function closeConfirmation() {
    closeReceipt();
    void navigate({ to: "/" });
  }

  function patchProfile(patch: Partial<Profile>) {
    setProfile((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as (keyof Profile)[]) delete next[key];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote || submitting || isFetching || quote.unavailable?.length) return;

    const account = accounts.find((candidate) => candidate.id === accountId) ?? accounts[0];
    let target = { network: account.network, address: account.address };
    if (!isMobile) {
      const found = validateProfile(profile);
      setErrors(found);
      const first = Object.keys(found)[0];
      if (first) {
        document.getElementById(`pay-${first}`)?.focus();
        return;
      }
      target = { network: profile.network as typeof account.network, address: profile.address.trim() };
    }
    submit({ items: lines, coupon, expectedTotal: quote.total, provider, ...target });
  }

  const blocked = !quote || submitting || isFetching || Boolean(quote.unavailable?.length);
  const confirm = (
    <div className="pay-confirm">
      {quote?.unavailable?.length ? (
        <p className="pay-alert" role="alert">
          Há itens esgotados no carrinho. Remova-os para continuar.
        </p>
      ) : null}
      {error && (
        <p className="pay-alert" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="pay-submit" disabled={blocked}>
        {submitting ? "Processando compra…" : "Confirmar compra"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground detail-page cart-page payment-page">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="catalogo"
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />

      <main className="cart-main page-width">
        <nav className="detail-breadcrumb" aria-label="Você está em">
          <Link to="/" hash="inicio">
            Início
          </Link>
          {" / "}
          <Link to="/" hash="catalogo">
            Mercado
          </Link>
          {" / Pagamento"}
        </nav>
        <header className="cart-mobile-header">
          <Button variant="ghost" size="icon" aria-label="Voltar" onClick={goBack}>
            <ArrowLeft aria-hidden="true" />
          </Button>
          <h1>Pagamento com carteira</h1>
        </header>

        {cartLoading ? (
          <p className="catalog-message" role="status">
            Carregando seu carrinho…
          </p>
        ) : cart.length === 0 ? (
          <div className="catalog-message cart-empty">
            <ShoppingBag aria-hidden="true" />
            <h1>Não há itens para pagar</h1>
            <p>Adicione NFTs ao carrinho para finalizar a compra.</p>
            <Button variant="outline" asChild>
              <Link to="/">Explorar NFTs</Link>
            </Button>
          </div>
        ) : (
          <form id="pay-form" className="pay-layout" noValidate onSubmit={handleSubmit}>
            {isMobile ? (
              <MobileWallet
                accountId={accountId}
                onAccount={setAccountId}
                provider={provider}
                onProvider={setProvider}
                quote={quote}
                confirm={confirm}
              />
            ) : (
              <>
                <ProfileForm
                  profile={profile}
                  errors={errors}
                  provider={provider}
                  onChange={patchProfile}
                  onProvider={setProvider}
                />
                <OrderSummary
                  items={cart}
                  quote={quote}
                  provider={provider}
                  onProvider={setProvider}
                  confirm={confirm}
                />
              </>
            )}
          </form>
        )}
      </main>

      <SiteFooter />
      <ReceiptDialog order={order} onClose={closeConfirmation} />
    </div>
  );
}

// O pagamento é privado: sem sessão não há conteúdo do pedido nem chamada ao servidor.
export default function PaymentPage() {
  const { user, openAuth } = useAuth();
  if (user) return <PaymentContent />;
  return (
    <main className="not-found">
      <h1>Entre para finalizar a compra</h1>
      <p>Seu carrinho foi mantido. Acesse sua conta para continuar.</p>
      <Button onClick={() => openAuth("login")}>Entrar</Button>
    </main>
  );
}
