import type { NextConfig } from "next";

// NOTE: This project uses Yarn PnP (.pnp.cjs), which Turbopack cannot resolve
// (it can't locate next/package.json without a node_modules tree). We therefore
// run dev/build with `--webpack` (see package.json scripts). To switch back to
// the default Turbopack pipeline, move the project to the node-modules linker
// (`nodeLinker: node-modules` in .yarnrc.yml) and drop the `--webpack` flags.
const nextConfig: NextConfig = {};

export default nextConfig;
