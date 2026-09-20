import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // next-auth v5 beta ships ESM that imports "next/server"; Turbopack must bundle
    // it instead of treating it as an external, or the API route fails to resolve.
    transpilePackages: ["next-auth", "@auth/core"],
    // Next 16 writes AGENTS.md/CLAUDE.md on dev start; this repo manages its own.
    agentRules: false,
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "i.dummyjson.com" },
            { protocol: "https", hostname: "i.stack.imgur.com" },
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "i.im.ge" },
            { protocol: "https", hostname: "cdn.dummyjson.com" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
            { protocol: "https", hostname: "avatars.githubusercontent.com" },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
