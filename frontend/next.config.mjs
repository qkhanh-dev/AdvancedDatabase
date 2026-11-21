/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_BOOT_ID: String(Date.now()),
  },
};

export default nextConfig;
