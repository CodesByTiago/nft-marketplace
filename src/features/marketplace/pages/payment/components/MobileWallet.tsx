import type { ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { CartQuote } from "@/features/marketplace/types/nft";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";
import { accounts } from "../accounts";
import { radioClass } from "../radio";
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold">Carteira conectada</h2>
        <button
          type="button"
          className="bg-transparent p-0 text-[14px] text-primary-light"
          onClick={() => onAccount(next.id)}
        >
          Trocar carteira
        </button>
      </div>
      <fieldset className="flex flex-col gap-5">
        <legend className="sr-only">Carteira conectada</legend>
        {accounts.map((account) => (
          <label
            key={account.id}
            className="flex h-[93px] cursor-pointer items-center gap-4 rounded-[14px] border border-transparent bg-surface pr-[18px] pl-5 shadow-[0_6px_20px_rgba(10,6,4,.45)] data-[selected=true]:border-primary"
            data-selected={accountId === account.id}
          >
            <input
              className={cn(radioClass, "size-4")}
              type="radio"
              name="pay-account"
              value={account.id}
              checked={accountId === account.id}
              onChange={() => onAccount(account.id)}
            />
            <span className="flex flex-1 flex-col gap-1.5 text-[14px]">
              <strong className="text-[16px]">{account.label}</strong>
              <span>{account.name}</span>
              <small className="text-[13px] text-[#b39463]">{account.networkLabel}</small>
            </span>
            <MoreVertical className="size-5 text-muted-foreground" aria-hidden="true" />
          </label>
        ))}
      </fieldset>
      <WalletOptions provider={provider} onChange={onProvider} />
      <p className="pay-mobile-total flex justify-end gap-7 text-[16px] font-bold" aria-live="polite">
        <span>Total:</span>{" "}
        <b className="text-[18px] text-primary-light">{quote ? `${formatEth(toWei(quote.total), 3)} ETH` : "—"}</b>
      </p>
      {confirm}
    </div>
  );
}
