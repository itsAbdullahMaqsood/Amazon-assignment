import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Full Amazon Clone React",
    description: "full amazon clone React",
};

const RootLayout = ({ children }: any) => {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <div className={inter.className}>{children}</div>
                </Providers>
            </body>
        </html>
    );
};

export default RootLayout;
