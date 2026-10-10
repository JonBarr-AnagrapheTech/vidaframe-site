import { defineConfig } from "vite";
import { BUTTONDOWN_USERNAME } from "./site.config.js";

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
