import { Wallet } from "lucide-react";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { providerLabels } from "@/features/marketplace/utils/payment";

const providers: WalletProvider[] = ["walletconnect", "metamask", "coinbase"];
const initials: Record<WalletProvider, string> = { walletconnect: "W", metamask: "M", coinbase: "" };

export function WalletOptions({
  provider,
  onChange,
}: {
  provider: WalletProvider;
  onChange: (provider: WalletProvider) => void;
}) {
  return (
    <fieldset className="pay-wallets">
      <legend>Carteira e rede</legend>
      {providers.map((value) => (
        <label key={value} className="pay-option" data-selected={provider === value}>
          <span className="pay-option-icon" aria-hidden="true">
            {initials[value] || <Wallet />}
          </span>
          {value === "walletconnect" && (
            <span className="pay-chip" aria-hidden="true">
              METAMASK • WALLETCONNECT • COINBASE
            </span>
          )}
          <span className={value === "walletconnect" ? "pay-option-name is-mobile-only" : "pay-option-name"}>
            {providerLabels[value]}
          </span>
          <input
            type="radio"
            name="pay-provider"
            value={value}
            aria-label={providerLabels[value]}
            checked={provider === value}
            onChange={() => onChange(value)}
          />
        </label>
      ))}
    </fieldset>
  );
}
