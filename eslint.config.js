import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const restrict = (patterns, message) => ({
  "no-restricted-imports": ["error", { patterns: patterns.map((group) => ({ group, message })) }],
});

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "playwright-report/**", "test-results/**", "public/mockServiceWorker.js"] },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Direção das dependências: app → features → shared → core
  {
    files: ["src/core/**/*.{ts,tsx}"],
    rules: restrict(
      [
        ["@/app", "@/app/*"],
        ["@/features", "@/features/*"],
        ["@/shared", "@/shared/*"],
      ],
      "core não pode importar app, features nem shared.",
    ),
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: restrict(
      [
        ["@/app", "@/app/*"],
        ["@/features", "@/features/*"],
      ],
      "shared só pode importar core.",
    ),
  },
  {
    files: ["src/features/marketplace/**/*.{ts,tsx}"],
    rules: restrict(
      [
        ["@/app", "@/app/*"],
        ["@/features/*", "!@/features/marketplace", "!@/features/marketplace/*"],
      ],
      "Uma feature não importa app nem outra feature.",
    ),
  },
);
