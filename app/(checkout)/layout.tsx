import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";

import Wordmark from "@/components/ui/Wordmark";
import Toaster from "@/components/ui/Toaster";

// Checkout gets a quiet shell: the wordmark, a way back to the cart, and
// nothing else to click away to while paying.
const CheckoutLayout = ({ children }: any) => (
    <div className="flex min-h-dvh flex-col">
        <header className="bg-ink-900 text-fg-inverse">
            <div className="mx-auto flex h-14 max-w-page items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" aria-label="Markaz home">
                    <Wordmark size="sm" />
                </Link>
                <p className="flex items-center gap-1.5 text-sm text-fg-inverse-muted">
                    <LockClosedIcon className="h-4 w-4" />
                    Checkout
                </p>
                <Link href="/cart" className="text-sm text-fg-inverse-muted hover:text-fg-inverse hover:underline">
                    Back to cart
                </Link>
            </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="py-6 text-center text-xs text-fg-subtle">
            © {new Date().getFullYear()} Markaz · payments are simulated in this store
        </footer>
        <Toaster />
    </div>
);

export default CheckoutLayout;
