/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Note: Next.js may still trace files for Edge runtime routes, but standalone output is not enabled
  // The Windows symlink errors are warnings and won't affect Netlify deployment

  // Webpack configuration (used when not using Turbopack)
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Ignore the redis module resolution errors - it's loaded dynamically at runtime
      // This prevents webpack from trying to bundle it during build
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^redis$/,
          contextRegExp: /src\/lib\/cache\.ts$/,
        }),
      );
    }
    return config;
  },

  // Turbopack configuration (Next.js 15.3.0+)
  turbopack: {
    // Turbopack-specific rules and configurations
    rules: {
      // Custom loader rules can be added here if needed
      // Example: '*.svg': { loaders: ['@svgr/webpack'], as: '*.js' }
    },
    resolveAlias: {
      // Match the path alias from tsconfig.json
      "~": "./src",
    },
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "7g9d5wparu.ufs.sh",
      },
    ],
  },

  // CORS configuration
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.openai.com https://api.anthropic.com https://openrouter.ai https://*.polar.sh; frame-src 'self' https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.openai.com https://api.anthropic.com https://openrouter.ai; object-src 'none'",
          },
          // CORS headers for API routes
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "development"
                ? "http://localhost:3000,http://localhost:3001"
                : "https://kamkm.app,https://www.kamkm.app",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Max-Age", value: "86400" }, // 24 hours
          // Additional security headers for API
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/api/v1/(.*)",
        headers: [
          // More restrictive CORS for public API v1
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Public API allows any origin, but rate limiting and auth still apply
          },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          { key: "Access-Control-Allow-Credentials", value: "false" }, // No credentials for public API
          { key: "Access-Control-Max-Age", value: "3600" }, // 1 hour for public API
        ],
      },
      {
        source: "/api/trpc/(.*)",
        headers: [
          // tRPC specific CORS - more restrictive
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : "https://kamkm.app,https://www.kamkm.app",
          },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Max-Age", value: "7200" }, // 2 hours
        ],
      },
    ];
  },
};

export default config;
