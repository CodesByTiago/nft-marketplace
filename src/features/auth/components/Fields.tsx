import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

type FieldProps = Omit<ComponentProps<"input">, "id"> & { id: string; label: string; error?: string };

export function TextField({ id, label, error, ...props }: FieldProps) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="auth-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-password">
      <TextField {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="auth-eye"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  );
}
