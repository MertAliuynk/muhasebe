import "./src/env.js"

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minio-gssoc8oco4gooossss4wsogo.46.202.154.58.sslip.io",
      },
      {
        protocol: "https",
        hostname: "minio-gssoc8oco4gooossss4wsogo.46.202.154.58.sslip.ionull",
      },
    ],
  },
}

export default config
