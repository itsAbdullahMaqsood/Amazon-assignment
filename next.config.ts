import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // A build run while `next dev` is up would fight over .next; NEXT_DIST_DIR
    // lets a verification build write somewhere else.
    distDir: process.env.NEXT_DIST_DIR || ".next",
    // Turbopack externalizes next-auth's ESM by default, and Node then fails to
    // resolve its bare "next/server" import, crashing dev with
    // "Cannot find module '.../node_modules/next/server'". Listing next-auth and
    // @auth/core here makes Turbopack bundle them instead, which fixes it.
    transpilePackages: ["next-auth", "@auth/core"],
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "image.tmdb.org" },
            { protocol: "https", hostname: "cdn.dummyjson.com" },
            { protocol: "https", hostname: "i.dummyjson.com" },
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "i.im.ge" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
            { protocol: "https", hostname: "avatars.githubusercontent.com" },
        ],
    },
    // Routes renamed with the Markaz rebrand. Permanent, so old links and
    // bookmarks land on the new page.
    redirects: async () => [
        { source: "/prime-video", destination: "/movies", permanent: true },
        { source: "/watchlist", destination: "/movies/my-list", permanent: true },
        { source: "/prime", destination: "/plus", permanent: true },
        { source: "/profile/family", destination: "/profile/household", permanent: true },
        { source: "/profile/credit-cards", destination: "/profile/payment", permanent: true },
        { source: "/keep-shopping", destination: "/profile/recent", permanent: true },
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
    // Enables forbidden(): an admin page reached by a non-admin renders a real
    // 403 (app/forbidden.tsx) instead of quietly redirecting.
    experimental: {
        authInterrupts: true,
    },
};

export default nextConfig;
