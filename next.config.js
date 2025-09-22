/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  webpack: (cfg, { isServer }) => {
    if (isServer) {
      // Avoid bundling pdfkit (which expects AFM font assets) into serverless functions
      cfg.externals = Array.isArray(cfg.externals) ? cfg.externals : [];
      cfg.externals.push("pdfkit");
    }
    return cfg;
  },
};

export default config;
