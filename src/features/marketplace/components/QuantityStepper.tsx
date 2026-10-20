type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
};

const stepButton =
  "grid h-[49px] w-[33px] place-items-center rounded-[33px] border-0 bg-primary p-0 disabled:opacity-40";

export function QuantityStepper({ value, max, onChange }: QuantityStepperProps) {
  return (
    <div className="quantity-stepper flex items-center gap-3" role="group" aria-label="Quantidade">
      <button
        type="button"
        className={stepButton}
        aria-label="Diminuir quantidade"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <img className="size-5" src="/images/detail-minus.svg" alt="" />
      </button>
      <output className="min-w-6 text-center text-[20px]" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={stepButton}
        aria-label="Aumentar quantidade"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <img className="size-5" src="/images/detail-plus.svg" alt="" />
      </button>
    </div>
  );
}
