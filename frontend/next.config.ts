import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // external placeholder place photos (see lib/format.ts:placeImage)
    remotePatterns: [{ protocol: "https", hostname: "loremflickr.com" }],
  },
}

export default nextConfig
