
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  plugins: [netlify()],
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});
