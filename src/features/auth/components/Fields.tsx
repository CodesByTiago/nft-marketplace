import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

type FieldProps = Omit<ComponentProps<"input">, "id"> & { id: string; label: string; error?: string };

export const authLinkClass = "cursor-pointer text-sm text-primary-light hover:underline";
export const authErrorClass = "mt-1 text-xs text-[#f0805f]";
export const authFormClass = "flex flex-col px-20 pt-6 max-[640px]:gap-0 max-[640px]:p-0";
export const authFieldsClass = "flex flex-col gap-3 max-[640px]:gap-4";
export const authFailureClass = "mt-3 text-center text-xs text-[#f0805f]";
export const authSubmitClass =
  "mt-6 h-[45px] cursor-pointer rounded-[5px] bg-primary text-base font-bold text-background enabled:hover:bg-primary-light disabled:cursor-progress disabled:opacity-60 max-[640px]:mt-8 max-[640px]:h-[60px] max-[640px]:rounded-xl";
const inputClass =
  "h-10 w-full rounded-[5px] border border-border bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-[#b39463] focus:border-primary aria-invalid:border-[#f0805f] max-[640px]:h-[50px] max-[640px]:rounded-[10px] max-[640px]:text-base";

export function TextField({ id, label, error, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className={authErrorClass}>
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative [&_input]:pr-11">
      <TextField {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="absolute top-0 right-1 grid h-10 w-9 cursor-pointer place-items-center text-muted-foreground [&>svg]:size-[18px]"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  );
}
