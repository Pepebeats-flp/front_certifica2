import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/favicon.ico", "icons/apple-touch-icon.png", "images/*.webp", "images/avatar.png", "images/google_logo.svg"],
      manifest: {
        name: "Redbus Certifica",
        short_name: "Redbus Certifica",
        description: "Redbus Certifica",
        theme_color: "#000000",
        background_color: "#000000",
        icons: [
          {
            src: "icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/android-chrome-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/android-chrome-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff,woff2}"],
        navigateFallbackDenylist: [
          // Exclude routes starting with /api/
          /^\/api\//,
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(new Date().toLocaleDateString("en-GB").replaceAll("/", "")),
  },
});
