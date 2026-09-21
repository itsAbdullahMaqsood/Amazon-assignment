import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

// Account and checkout pages are per-customer and behind auth, so they are not
// worth a crawl budget even though the proxy already blocks them.
// Written as a declaration, not an arrow: Next 16 does not pick a sitemap.ts
// up when the default export is an assigned arrow function, and robots.ts is
// kept in the same shape.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/auth/",
                "/cart",
                "/checkout",
                "/order/",
                "/profile",
                "/placeholder",
            ],
        },
        sitemap: `${siteUrl()}/sitemap.xml`,
    };
}
