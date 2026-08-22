import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // placeholder catalog photos (see lib/format.ts:loremflickr)
    remotePatterns: [
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
}

export default nextConfig
