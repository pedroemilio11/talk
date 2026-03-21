import type { Config } from "tailwindcss";
import fluxiTailwindPreset from "@fluxi/design-system/tailwind/preset";

const config: Config = {
  presets: [fluxiTailwindPreset as Config],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../modules/**/*.{ts,tsx}"
  ]
};

export default config;

