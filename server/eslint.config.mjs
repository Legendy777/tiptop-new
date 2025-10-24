import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"], rules: {} },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.node }, rules: {} },
  { ...tseslint.configs.recommended, rules: {} },
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"], rules: {} },
  { files: ["**/*.jsonc"], plugins: { json }, language: "json/jsonc", extends: ["json/recommended"], rules: {} },
  { files: ["**/*.json5"], plugins: { json }, language: "json/json5", extends: ["json/recommended"], rules: {} },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/commonmark", extends: ["markdown/recommended"], rules: {} },
  { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"], rules: {} },
]);