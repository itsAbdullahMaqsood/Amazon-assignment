import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { auth } from "@/auth";

import "@/styles/globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Full Amazon Clone React",
    description: "full amazon clone React",
};

// The session is resolved on the server and handed to SessionProvider so
// useSession() has it on first paint instead of fetching after hydration.
const RootLayout = async ({ children }: any) => {
    const session = await auth();

    return (
        // Extensions such as Grammarly add attributes to <body> before React
        // hydrates, which React reports as a hydration mismatch. Suppressing it
        // here keeps real mismatches visible everywhere else.
        <html lang="en">
            <body suppressHydrationWarning>
                <Providers session={session}>
                    <div className={inter.className}>{children}</div>
                </Providers>
            </body>
        </html>
    );
};

export default RootLayout;
