import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { BUTTONDOWN_USERNAME } from "./site.config.js";

const root = dirname(fileURLToPath(import.meta.url));

const BUTTONDOWN_SUBSCRIBE_URL = `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(BUTTONDOWN_USERNAME)}`;

function buttondownConfig() {
  return {
    name: "buttondown-config",
    transformIndexHtml(html) {
      return html.replaceAll("__BUTTONDOWN_SUBSCRIBE_URL__", BUTTONDOWN_SUBSCRIBE_URL);
    },
  };
}

export default defineConfig({
  base: "./",
  appType: "mpa",
  plugins: [buttondownConfig()],
  build: {
    rollupOptions: {
      // Directory indexes, so GitHub Pages serves /privacy and /support.
      input: {
        main: resolve(root, "index.html"),
        privacy: resolve(root, "privacy/index.html"),
        support: resolve(root, "support/index.html"),
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 4327,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4327,
    strictPort: true,
  },
});
