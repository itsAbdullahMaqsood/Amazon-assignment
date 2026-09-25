import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Next 16 renamed middleware.ts to proxy.ts. Signed-out visitors are bounced to
// the project's own sign-in page, carrying the path they asked for. The cart is
// deliberately not listed: anyone can fill one, and signing in happens at
// checkout.
const proxy = async (req: any) => {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production",
        cookieName:
            process.env.NODE_ENV === "production"
                ? "__Secure-authjs.session-token"
                : "authjs.session-token",
    });

    const { pathname, search, origin } = req.nextUrl;

    if (!token) {
        const signInUrl = new URL("/auth/signin", origin);
        signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
        return NextResponse.redirect(signInUrl);
    }

    if (pathname.startsWith("/admin") && token.role !== "admin") {
        return NextResponse.redirect(new URL("/", origin));
    }

    return NextResponse.next();
};

export default proxy;

export const config = {
    matcher: ["/checkout", "/order/:path*", "/profile/:path*", "/movies/my-list", "/admin/:path*"],
};
