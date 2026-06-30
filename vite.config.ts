import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      target: "es2020",
      // 小于此阈值的 chunk 合并到父级（减少 HTTP 请求）
      cssMinify: "lightningcss",
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 核心 Vendor 分离
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router")) {
              return "vendor-react";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-lucide";
            }
            if (id.includes("node_modules/@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("node_modules/react-simple-maps") || id.includes("node_modules/topojson")) {
              return "vendor-maps";
            }
            if (id.includes("node_modules/@google/genai")) {
              return "vendor-genai";
            }
            if (id.includes("node_modules/browser-image-compression")) {
              return "vendor-img-compress";
            }
            // 数据层分离（多处共用）
            if (id.includes("src/lib/dataService") || id.includes("src/lib/supabase")) {
              return "data-layer";
            }
          },
        },
      },
    },
  };
});
