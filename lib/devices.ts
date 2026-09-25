// A deliberately small user-agent read: enough to name the browser and the
// platform, with no attempt at a full UA database and nothing else about the
// request kept.
export const describeUserAgent = (userAgent: string) => {
    const ua = String(userAgent || "");

    const browser =
        (/Edg\//.test(ua) && "Edge") ||
        (/OPR\/|Opera/.test(ua) && "Opera") ||
        (/Firefox\//.test(ua) && "Firefox") ||
        (/Chrome\//.test(ua) && "Chrome") ||
        (/Safari\//.test(ua) && "Safari") ||
        "A browser";

    const platform =
        (/iPhone/.test(ua) && "iPhone") ||
        (/iPad/.test(ua) && "iPad") ||
        (/Android/.test(ua) && "Android") ||
        (/Mac OS X|Macintosh/.test(ua) && "macOS") ||
        (/Windows/.test(ua) && "Windows") ||
        (/Linux/.test(ua) && "Linux") ||
        "an unknown device";

    return {
        label: `${browser} on ${platform}`,
        mobile: /iPhone|iPad|Android/.test(ua),
    };
};

export const signInDate = (value: any) =>
    value
        ? new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
        : "";

export const lastSeenLabel = (value: any) => {
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);

    if (days <= 0) return "Active today";
    if (days === 1) return "Last used yesterday";
    if (days < 30) return `Last used ${days} days ago`;

    return `Last used ${signInDate(value)}`;
};
