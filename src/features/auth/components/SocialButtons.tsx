import { useState } from "react";

const providers = [
  { name: "Google", icon: "/images/auth-google.svg" },
  { name: "Facebook", icon: "/images/auth-facebook.svg" },
];

export function SocialButtons() {
  const [notice, setNotice] = useState("");
  return (
    <div className="flex flex-col gap-3 pt-6 group-data-[mode=register]/auth:gap-4 max-[640px]:gap-4 max-[640px]:pt-8">
      <div className="flex items-center gap-3 text-[13px] text-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border max-[640px]:gap-2.5">
        <span>Ou continue com</span>
      </div>
      {providers.map(({ name, icon }) => (
        <button
          key={name}
          type="button"
          className="flex h-10 cursor-pointer items-center justify-center gap-3 rounded-[5px] border border-border text-[13px] font-medium text-muted-foreground hover:border-primary"
          onClick={() => setNotice(`O acesso com ${name} estará disponível em breve.`)}
        >
          <img src={icon} alt="" width={20} height={20} />
          Continuar com {name}
        </button>
      ))}
      {notice && (
        <p role="status" className="mx-12 mt-3 text-center text-xs text-muted-foreground">
          {notice}
        </p>
      )}
    </div>
  );
}
