import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    // The engine came from its own project and draws in its own way. Only
    // catch real mistakes there: names that don't exist, and broken hooks.
    files: ["src/engine/**/*.{js,jsx}"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-undef": "error",
      "react/jsx-no-undef": "error",
      "react/display-name": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/static-components": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "jsx-a11y/alt-text": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
]);

export default eslintConfig;
