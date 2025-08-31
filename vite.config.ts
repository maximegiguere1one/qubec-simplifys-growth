import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Performance optimization plugin
    {
      name: "inject-preloads",
      transformIndexHtml(html: string) {
        return {
          html,
          tags: [
            { 
              tag: "link", 
              attrs: { 
                rel: "preload", 
                as: "image", 
                href: "/src/assets/hero-image.jpg"
              }, 
              injectTo: "head" as const
            },
            { 
              tag: "link", 
              attrs: { 
                rel: "preload", 
                as: "font", 
                href: "/fonts/Inter-roman.var.woff2", 
                type: "font/woff2", 
                crossorigin: "anonymous" 
              }, 
              injectTo: "head" as const
            }
          ]
        };
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
