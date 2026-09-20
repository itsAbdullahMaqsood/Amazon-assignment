/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            "i.dummyjson.com",
            "i.stack.imgur.com",
            "res.cloudinary.com",
            "i.im.ge",
            "cdn.dummyjson.com",
            "lh3.googleusercontent.com",
            "avatars.githubusercontent.com",
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
