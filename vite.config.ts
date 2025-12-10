import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = env.VITE_API_BASE_URL
    ? {
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
      }
    : undefined;

  // Dev-only mock to avoid 404 on /api/send-registration-email during local testing
  const devApiMock = (): Plugin => ({
    name: "dev-api-mock",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/send-registration-email", async (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true }));
      });
    },
  });

  return {
    server: {
      host: "::",
      port: 8080,
      proxy,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      // Only add mock when no proxy base is defined
      mode === "development" && !proxy && devApiMock(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
