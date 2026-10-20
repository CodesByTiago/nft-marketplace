// Utilitários Tailwind compartilhados pelos formulários de perfil e carteiras.
export const accountForm = "flex min-w-0 flex-1 flex-col gap-8";
export const accountHeading = "text-base leading-4 font-bold";
export const accountGrid = "grid grid-cols-2 gap-x-7 gap-y-6 max-[640px]:grid-cols-1";
export const accountField = "flex min-w-0 flex-col gap-2.5";
export const accountLabel =
  "flex items-center gap-1 text-[15px] leading-[15px] [&>span]:text-[22px] [&>span]:leading-[29px] [&>span]:text-[#f0805f]";
export const accountError = "text-[12px] text-[#ff8a8a] empty:hidden";

const control =
  "h-10 w-full rounded-[3px] border border-border bg-transparent text-foreground placeholder:text-[#b39463] focus-visible:border-primary focus-visible:outline-0 aria-invalid:border-[#ff8a8a] max-[640px]:h-[50px] max-[640px]:rounded-[10px] max-[640px]:text-base";
export const accountInput = `${control} px-4 text-[14px]`;
export const accountSelect = `${control} cursor-pointer appearance-none pr-[22px] pl-2.5 text-[15px] data-[empty]:text-[#b39463]`;
export const accountSelectBox =
  "relative w-[78px] flex-none max-[640px]:w-[92px] [&_option]:bg-surface [&_option]:text-foreground";
export const accountSelectBoxWide =
  "relative w-full flex-none max-[640px]:w-full [&_option]:bg-surface [&_option]:text-foreground";
export const accountChevron = "pointer-events-none absolute top-3 right-1.5 size-4 max-[640px]:top-[17px]";

export const accountPrimary =
  "h-10 cursor-pointer rounded-[3px] bg-primary px-[25px] text-[14px] font-bold text-background hover:bg-primary-light";
export const accountSave = "w-[131px] p-0 max-[640px]:h-14 max-[640px]:w-full max-[640px]:rounded-xl";
export const accountText = "-ml-1 cursor-pointer text-[14px] hover:text-primary-light";
export const accountLink = "cursor-pointer text-[14px] text-primary-light hover:underline";
export const accountSaved = "text-[14px] text-primary-light";
export const accountMaintenance =
  "items-start gap-4 bg-surface px-8 py-12 max-[640px]:px-6 max-[640px]:py-8 [&>svg]:size-8 [&>svg]:text-primary-light [&>p]:text-[14px] [&>p]:text-muted-foreground";
