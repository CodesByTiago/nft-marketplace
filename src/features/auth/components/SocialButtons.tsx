import { useState } from "react";

const providers = [
  { name: "Google", icon: "/images/auth-google.svg" },
  { name: "Facebook", icon: "/images/auth-facebook.svg" },
];

export function SocialButtons() {
  const [notice, setNotice] = useState("");
  return (
    <div className="auth-social">
      <div className="auth-divider">
        <span>Ou continue com</span>
      </div>
      {providers.map(({ name, icon }) => (
        <button
          key={name}
          type="button"
          className="auth-social-button"
          onClick={() => setNotice(`O acesso com ${name} estará disponível em breve.`)}
        >
          <img src={icon} alt="" width={20} height={20} />
          Continuar com {name}
        </button>
      ))}
      {notice && (
        <p role="status" className="auth-notice">
          {notice}
        </p>
      )}
    </div>
  );
}
