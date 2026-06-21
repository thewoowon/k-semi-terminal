import type { NextConfig } from "next";

// NOTE: This project uses Yarn PnP (.pnp.cjs), which Turbopack cannot resolve
// (it can't locate next/package.json without a node_modules tree). We therefore
// run dev/build with `--webpack` (see package.json scripts). To switch back to
// the default Turbopack pipeline, move the project to the node-modules linker
// (`nodeLinker: node-modules` in .yarnrc.yml) and drop the `--webpack` flags.
const nextConfig: NextConfig = {
  // Keep heavy / native server-only packages out of the webpack bundle. They are
  // loaded at runtime in route handlers/jobs only, so externalizing them keeps
  // `next build` fast and lets the app build with no DB / no PDF deps resolved.
  serverExternalPackages: [
    "@prisma/client",
    "@react-pdf/renderer",
    "@sentry/nextjs",
  ],

  async headers() {
    // Baseline security headers (launch checklist §15).
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    return [{ source: "/:path*", headers: security }];
  },
};

export default nextConfig;
