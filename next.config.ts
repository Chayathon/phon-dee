import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        agentFeedback: true,
        agentUpgrade: "security",
        serverActions: {
            bodySizeLimit: "5mb",
        },
    },
    images: {
        remotePatterns: [new URL("https://profile.line-scdn.net/**")],
        // Uploaded files are served from the private bucket via app/api/files/**/route.ts
        localPatterns: [{ pathname: "/api/files/**", search: "" }],
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
