/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@solana/web3.js",
    "@solana/spl-token",
    "ioredis",
  ],
  poweredByHeader: false,
  output: "standalone",
  async rewrites() {
    return [
      // API versioning: /api/v1/* maps to /api/* routes
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
