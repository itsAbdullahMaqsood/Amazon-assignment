import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // Turbopack externalizes next-auth's ESM by default, and Node then fails to
    // resolve its bare "next/server" import, crashing dev with
    // "Cannot find module '.../node_modules/next/server'". Listing next-auth and
    // @auth/core here makes Turbopack bundle them instead, which fixes it.
    transpilePackages: ["next-auth", "@auth/core"],
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
