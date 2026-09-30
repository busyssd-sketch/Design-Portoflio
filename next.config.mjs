/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase-hosted images once you upload them to Storage
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
