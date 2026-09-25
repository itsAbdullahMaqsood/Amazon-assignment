import type { MetadataRoute } from "next";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { siteUrl } from "@/lib/site";

const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/browse", priority: 0.9 },
    { path: "/movies", priority: 0.7 },
    { path: "/groceries", priority: 0.7 },
    { path: "/furniture", priority: 0.7 },
    { path: "/pharmacy", priority: 0.7 },
    { path: "/coupons", priority: 0.6 },
    { path: "/plus", priority: 0.6 },
    { path: "/business", priority: 0.5 },
    { path: "/sell", priority: 0.5 },
    { path: "/customer-service", priority: 0.5 },
    { path: "/gift-cards", priority: 0.5 },
    { path: "/registry", priority: 0.4 },
];

// Every catalogue product is a real, crawlable page, so the sitemap is built
// from the database rather than hard-coded.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = siteUrl();

    await connectDb();

    const [products, categories] = await Promise.all([
        Product.find().select("slug updatedAt").lean(),
        Category.find().select("slug").lean(),
    ]);

    return [
        ...staticRoutes.map((route) => ({
            url: `${base}${route.path}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: route.priority,
        })),
        ...categories.map((category: any) => ({
            url: `${base}/browse?category=${category.slug}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.6,
        })),
        ...products.map((product: any) => ({
            url: `${base}/product/${product.slug}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
