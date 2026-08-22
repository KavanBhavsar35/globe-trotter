import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // placeholder catalog photos (see lib/format.ts:picsum)
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
}

export default nextConfig
