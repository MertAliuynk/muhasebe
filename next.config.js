import "./src/env.js"

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minio.karadenizdis.com",
      },
    ],
  },
}

export default config
