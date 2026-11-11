import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        agentFeedback: true,
        serverActions: {
            bodySizeLimit: "5mb",
        },
    },
    images: {
        remotePatterns: [
            new URL("https://profile.line-scdn.net/**"),
            ...(process.env.AWS_ENDPOINT_URL_S3
                ? [new URL(`${process.env.AWS_ENDPOINT_URL_S3}/**`)]
                : []),
        ],
    },
    cacheComponents: true,
    partialPrefetching: true,
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
