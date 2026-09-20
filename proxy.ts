import { NextResponse } from "next/server";

import { auth } from "@/auth";

// Auth protection for the App Router. Next 16 renamed middleware.ts to proxy.ts,
// so the Auth.js handler is exported as the default proxy function here.
export default auth((req) => {
    if (!req.auth) {
        const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
        signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
        return NextResponse.redirect(signInUrl);
    }
});

// Only routes that require a signed-in user run through Auth.js. Public routes,
// static assets and the auth endpoints themselves are left untouched.
export const config = {
    matcher: ["/cart", "/profile/:path*", "/orders/:path*"],
};
