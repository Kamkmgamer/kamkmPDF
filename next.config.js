/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Note: Next.js may still trace files for Edge runtime routes, but standalone output is not enabled
  // The Windows symlink errors are warnings and won't affect Netlify deployment
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Ignore the redis module resolution errors - it's loaded dynamically at runtime
      // This prevents webpack from trying to bundle it during build
      // Note: This only applies to webpack builds, not Turbopack
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
};

export default config;
