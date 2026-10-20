import { Wallet } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { providerLabels } from "@/features/marketplace/utils/payment";
import { radioClass } from "../radio";

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
    <fieldset className="flex min-w-0 flex-col gap-3 p-0 max-[640px]:gap-4">
      <legend className="mb-3 w-full p-0 text-center text-[17px] font-bold max-[640px]:mb-4 max-[640px]:text-left max-[640px]:text-[16px]">
        Carteira e rede
      </legend>
      {providers.map((value) => (
        <label
          key={value}
          className="flex h-[45px] cursor-pointer items-center gap-2.5 rounded-[8px] border border-transparent bg-surface px-3.5 text-[14px] data-[selected=true]:border-primary max-[640px]:h-[65px] max-[640px]:gap-3 max-[640px]:rounded-[15px] max-[640px]:shadow-[0_0_40px_rgba(10,6,4,.45)]"
          data-selected={provider === value}
        >
          <span
            className="hidden size-10 flex-none place-items-center rounded-full border border-border bg-surface-raised text-[14px] font-bold text-primary-light max-[640px]:grid [&>svg]:size-[18px]"
            aria-hidden="true"
          >
            {initials[value] || <Wallet />}
          </span>
          {value === "walletconnect" && (
            <span
              className="rounded-[6px] border border-[#55321f] bg-[#38220f] px-2.5 py-1.5 text-[9px] font-bold text-primary-light max-[640px]:hidden"
              aria-hidden="true"
            >
              METAMASK • WALLETCONNECT • COINBASE
            </span>
          )}
          <span className={cn(value === "walletconnect" && "hidden max-[640px]:inline")}>{providerLabels[value]}</span>
          <input
            className={cn(
              radioClass,
              "order-first size-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light max-[640px]:order-3 max-[640px]:ml-auto",
            )}
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
