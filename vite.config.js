import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import postcsspxtoviewport from "postcss-px-to-viewport";
// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport({
          viewportWidth: 375,
        }),
      ],
    },
  },
});
