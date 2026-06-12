import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const sourceUiSrc = process.env.SOURCE_UI_STANDARD_PATH
  ? resolve(process.env.SOURCE_UI_STANDARD_PATH, "packages", "source-ui", "src")
  : resolve(__dirname, "../../../source-int-network-standard/packages/source-ui/src");

export default defineConfig({
  root: "src/web",
  plugins: [react()],
  resolve: {
    alias: {
      "@source-ui": sourceUiSrc,
    },
  },
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true,
  },
});
