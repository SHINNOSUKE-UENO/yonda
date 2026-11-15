import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// 値は docs/design-tokens.pdf の HEX をそのまま使う
const config = defineConfig({
  globalCss: {
    // 何も指定しない部品はアクセント(オレンジ)で表示する
    html: { colorPalette: "accent" },
  },
  theme: {
    semanticTokens: {
      colors: {
        // Chakra 標準トークンの上書き(全部品に反映される)
        bg: {
          DEFAULT: { value: { _light: "#FFFFFF", _dark: "#0F0F10" } },
          subtle: { value: { _light: "#F4F4F5", _dark: "#1C1C1F" } },
        },
        fg: {
          DEFAULT: { value: { _light: "#27272A", _dark: "#F4F4F5" } },
          muted: { value: { _light: "#63636B", _dark: "#A1A1AA" } },
        },
        border: {
          DEFAULT: { value: { _light: "#E4E4E7", _dark: "#2E2E33" } },
        },
        // colorPalette="accent" で使うパレット(主ボタン・アクティブタブ・リンク)
        accent: {
          solid: { value: { _light: "#C2410C", _dark: "#FB923C" } },
          contrast: { value: { _light: "#FFFFFF", _dark: "#1A0E05" } },
          fg: { value: { _light: "#C2410C", _dark: "#FB923C" } },
          subtle: { value: { _light: "#FFF7ED", _dark: "#3A2314" } },
          muted: { value: { _light: "#FFF7ED", _dark: "#3A2314" } },
          emphasized: { value: { _light: "#FFF7ED", _dark: "#3A2314" } },
          border: { value: { _light: "#C2410C", _dark: "#FB923C" } },
          focusRing: { value: { _light: "#C2410C", _dark: "#FB923C" } },
        },
        // colorPalette="danger" で使うパレット(削除・エラー)
        danger: {
          solid: { value: { _light: "#DC2626", _dark: "#F87171" } },
          contrast: { value: { _light: "#FFFFFF", _dark: "#0F0F10" } },
          fg: { value: { _light: "#DC2626", _dark: "#F87171" } },
          subtle: { value: { _light: "#FEF2F2", _dark: "#2A1414" } },
          muted: { value: { _light: "#DC2626", _dark: "#F87171" } },
          emphasized: { value: { _light: "#FEE2E2", _dark: "#3A1A1A" } },
          border: { value: { _light: "#DC2626", _dark: "#F87171" } },
          focusRing: { value: { _light: "#DC2626", _dark: "#F87171" } },
        },
        // オフラインバナー
        warning: {
          bg: { value: { _light: "#FEF9C3", _dark: "#3A3110" } },
          fg: { value: { _light: "#713F12", _dark: "#FDE68A" } },
        },
      },
      radii: {
        // ボタン・入力(l2)とカード・ダイアログ(l3)を 8px に統一
        l2: { value: "{radii.lg}" },
        l3: { value: "{radii.lg}" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
