import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { QuantityStepper } from "@/features/marketplace/components/QuantityStepper";
import type { CartEntry } from "@/features/marketplace/types/nft";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";
import { tokenId } from "@/features/marketplace/utils/tokenId";

type CartItemsProps = {
  items: CartEntry[];
  onQuantity: (id: string, change: number) => void;
  onRemove: (id: string) => void;
};

const columns = "grid-cols-[70px_minmax(0,1fr)_77px_75px_87px_24px] gap-x-6 pr-6";
const stepper =
  "[&_.quantity-stepper]:gap-1 [&_.quantity-stepper_button]:h-[30px] [&_.quantity-stepper_button]:w-5 [&_.quantity-stepper_button]:border [&_.quantity-stepper_button]:border-background [&_.quantity-stepper_button]:shadow-[0_2px_4px_rgba(10,6,4,.4)] [&_.quantity-stepper_img]:size-4 [&_.quantity-stepper_output]:min-w-[17px] [&_.quantity-stepper_output]:text-[17px]";
const stepperMobile =
  "max-[640px]:[&_.quantity-stepper]:mb-3.5 max-[640px]:[&_.quantity-stepper]:gap-2 max-[640px]:[&_.quantity-stepper]:self-end max-[640px]:[&_.quantity-stepper]:[grid-area:step] max-[640px]:[&_.quantity-stepper_button]:size-6 max-[640px]:[&_.quantity-stepper_button]:rounded-full max-[640px]:[&_.quantity-stepper_button]:border-border max-[640px]:[&_.quantity-stepper_button]:bg-surface-raised max-[640px]:[&_.quantity-stepper_button]:shadow-none max-[640px]:[&_.quantity-stepper_img]:size-3.5 max-[640px]:[&_.quantity-stepper_img]:invert max-[640px]:[&_.quantity-stepper_output]:min-w-3.5 max-[640px]:[&_.quantity-stepper_output]:text-[16px]";

export function CartItems({ items, onQuantity, onRemove }: CartItemsProps) {
  return (
    <div className="min-w-0 flex-1">
      <div
        className={`grid ${columns} items-center border-b-[.3px] border-primary pb-3 text-[15px] font-bold text-muted-foreground max-[640px]:hidden [&>span:first-child]:col-[1/3]`}
        aria-hidden="true"
      >
        <span>NFTs</span>
        <span>Preço</span>
        <span>Edições</span>
        <span>Total</span>
      </div>
      <ul className="mt-3 flex flex-col gap-3 max-[640px]:mt-0 max-[640px]:gap-5">
        {items.map(({ nft, quantity }) => (
          <li
            className={`cart-row relative grid h-[70px] ${columns} items-center rounded-[6px] bg-surface max-[640px]:h-[100px] max-[640px]:grid-cols-[100px_minmax(0,1fr)_auto] max-[640px]:grid-rows-[1fr_1fr] max-[640px]:[grid-template-areas:'art_info_info'_'art_price_step'] max-[640px]:gap-x-[9px] max-[640px]:rounded-[14px] max-[640px]:pr-3 max-[640px]:shadow-[0_6px_20px_rgba(10,6,4,.45)] ${stepper} ${stepperMobile}`}
            key={nft.id}
          >
            <Link
              className="block size-[70px] overflow-hidden rounded-[6px] max-[640px]:size-[100px] max-[640px]:rounded-[14px_0_0_14px] max-[640px]:[grid-area:art]"
              to="/nft/$nftId"
              params={{ nftId: nft.id }}
              aria-label={`Ver ${nft.name}`}
            >
              <img className="size-full object-cover" src={nft.image} alt="" />
            </Link>
            <div className="flex min-w-0 flex-col gap-1 max-[640px]:gap-0.5 max-[640px]:self-end max-[640px]:pt-[13px] max-[640px]:pr-8 max-[640px]:[grid-area:info]">
              <Link
                className="overflow-hidden text-[16px] font-bold text-ellipsis whitespace-nowrap hover:text-primary-light max-[640px]:text-[15px]"
                to="/nft/$nftId"
                params={{ nftId: nft.id }}
              >
                {nft.name}
              </Link>
              <span className="text-[14px] text-[#b39463] max-[640px]:hidden">ID do token: {tokenId(nft.name)}</span>
              <span className="hidden text-[14px] text-muted-foreground max-[640px]:block">
                Edição: {nft.edition}/{nft.totalEditions}
              </span>
            </div>
            <span className="cart-row-price text-[16px] font-bold text-muted-foreground max-[640px]:self-start max-[640px]:pt-1.5 max-[640px]:text-[18px] max-[640px]:text-primary-light max-[640px]:[grid-area:price]">
              {nft.available === false ? "Esgotado" : `${nft.price} ETH`}
            </span>
            <QuantityStepper
              value={quantity}
              max={nft.totalEditions}
              onChange={(value) => onQuantity(nft.id, value - quantity)}
            />
            <strong className="text-[16px] text-primary-light max-[640px]:hidden">
              {nft.available === false ? "—" : `${formatEth(toWei(nft.price) * BigInt(quantity))} ETH`}
            </strong>
            <button
              type="button"
              className="grid size-6 place-items-center bg-transparent p-0 text-muted-foreground hover:text-primary-light max-[640px]:absolute max-[640px]:top-2 max-[640px]:right-2 max-[640px]:size-[22px] [&>svg]:size-5 max-[640px]:[&>svg]:size-4"
              aria-label={`Remover ${nft.name}`}
              onClick={() => onRemove(nft.id)}
            >
              <Trash2 aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
