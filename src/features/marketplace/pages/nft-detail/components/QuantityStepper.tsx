type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({ value, max, onChange }: QuantityStepperProps) {
  return (
    <div className="quantity-stepper" role="group" aria-label="Quantidade">
      <button type="button" aria-label="Diminuir quantidade" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <img src="/images/detail-minus.svg" alt="" />
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <img src="/images/detail-plus.svg" alt="" />
      </button>
    </div>
  );
}
