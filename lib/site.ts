// The public origin, in the order it can be trusted: an explicit BASE_URL, the
// Vercel production domain, then localhost for a dev run.
export const siteUrl = () => {
    const base =
        process.env.BASE_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : "") ||
        "http://localhost:3000";

    return base.replace(/\/$/, "");
};
