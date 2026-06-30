/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@solana/web3.js",
    "@solana/spl-token",
    "ioredis",
    "better-sqlite3",
    "drizzle-orm",
  ],
  poweredByHeader: false,
  async redirects() {
    return [
      // The API base URLs are not browsable endpoints. Anyone landing here
      // (or following an old link) should reach the API reference, not a 404.
      { source: "/api", destination: "/docs/api", permanent: false },
      { source: "/api/v1", destination: "/docs/api", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: "/api/:path*" },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        const nodeBuiltins = [
          "net", "tls", "crypto", "stream", "perf_hooks", "fs", "path",
          "dns", "buffer", "os", "util", "assert", "events", "string_decoder",
          "http", "https", "url", "querystring", "zlib", "punycode", "child_process",
        ];
        config.externals.push(...nodeBuiltins);
      }
    }
    return config;
  },
};

export default nextConfig;
