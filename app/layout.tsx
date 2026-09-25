import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";

import { auth } from "@/auth";
import { siteUrl } from "@/lib/site";

import "@/styles/globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bricolage = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-bricolage",
    weight: ["500", "600", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl()),
    title: {
        default: "Markaz: a general store",
        template: "%s · Markaz",
    },
    description:
        "Markaz is a general store: clothing, electronics, home, beauty, groceries and movies, with an assistant called Shabana to help you choose.",
    applicationName: "Markaz",
    openGraph: {
        siteName: "Markaz",
        type: "website",
    },
};

export const viewport: Viewport = {
    themeColor: "#121a27",
};

// The session is resolved on the server and handed to SessionProvider so
// useSession() has it on first paint instead of fetching after hydration.
const RootLayout = async ({ children }: any) => {
    const session = await auth();

    return (
        // Extensions such as Grammarly add attributes to <body> before React
        // hydrates, which React reports as a hydration mismatch. Suppressing it
        // here keeps real mismatches visible everywhere else.
        <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
            <body suppressHydrationWarning>
                <Providers session={session}>{children}</Providers>
            </body>
        </html>
    );
};

export default RootLayout;
