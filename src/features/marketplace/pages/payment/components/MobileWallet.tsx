import type { ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import type { CartQuote } from "@/features/marketplace/types/nft";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";
import { accounts } from "../accounts";
import { WalletOptions } from "./WalletOptions";

type MobileWalletProps = {
  accountId: string;
  onAccount: (id: string) => void;
  provider: WalletProvider;
  onProvider: (provider: WalletProvider) => void;
  quote?: CartQuote;
  confirm: ReactNode;
};

export function MobileWallet({ accountId, onAccount, provider, onProvider, quote, confirm }: MobileWalletProps) {
  const next = accounts.find((account) => account.id !== accountId) ?? accounts[0];

  return (
    <div className="pay-mobile">
      <div className="pay-mobile-row">
        <h2>Carteira conectada</h2>
        <button type="button" onClick={() => onAccount(next.id)}>
          Trocar carteira
        </button>
      </div>
      <fieldset className="pay-accounts">
        <legend className="sr-only">Carteira conectada</legend>
        {accounts.map((account) => (
          <label key={account.id} className="pay-account" data-selected={accountId === account.id}>
            <input
              type="radio"
              name="pay-account"
              value={account.id}
              checked={accountId === account.id}
              onChange={() => onAccount(account.id)}
            />
            <span className="pay-account-text">
              <strong>{account.label}</strong>
              <span>{account.name}</span>
              <small>{account.networkLabel}</small>
            </span>
            <MoreVertical aria-hidden="true" />
          </label>
        ))}
      </fieldset>
      <WalletOptions provider={provider} onChange={onProvider} />
      <p className="pay-mobile-total" aria-live="polite">
        <span>Total:</span> <b>{quote ? `${formatEth(toWei(quote.total), 3)} ETH` : "—"}</b>
      </p>
      {confirm}
    </div>
  );
}
