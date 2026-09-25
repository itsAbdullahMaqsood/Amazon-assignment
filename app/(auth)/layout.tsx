import Link from "next/link";
import { ArchiveBoxIcon, HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

import Wordmark from "@/components/ui/Wordmark";

const reasons = [
    { icon: ShoppingBagIcon, text: "Your cart stays as it is while you sign in" },
    { icon: ArchiveBoxIcon, text: "Orders, returns and refunds in one place" },
    { icon: HeartIcon, text: "Saved items and lists on every device you use" },
];

// Sign-in screens drop the store's navigation: one form, a way home, and on
// wide screens a navy panel that says what an account is for.
const AuthLayout = ({ children }: any) => (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_28rem] xl:grid-cols-[1fr_32rem]">
        <div className="flex flex-col">
            <header className="px-6 pt-6 lg:px-10">
                <Link href="/" aria-label="Markaz home" className="inline-block">
                    <Wordmark tone="dark" />
                </Link>
            </header>
            <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
                <div className="w-full max-w-sm">{children}</div>
            </main>
            <footer className="px-6 pb-6 text-center text-xs text-fg-subtle lg:px-10 lg:text-left">
                <Link href="/customer-service/managing-your-account" className="hover:underline">
                    Help with signing in
                </Link>{" "}
                ·{" "}
                <Link href="/customer-service/security-privacy" className="hover:underline">
                    Privacy
                </Link>
            </footer>
        </div>

        <aside className="relative hidden overflow-hidden bg-ink-900 p-10 text-fg-inverse lg:flex lg:flex-col lg:justify-end">
            <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
            <p className="relative font-display text-3xl font-semibold leading-tight">
                Fewer steps between you and the thing you came for.
            </p>
            <ul className="relative mt-8 space-y-4">
                {reasons.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-fg-inverse-muted">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fg-inverse/10">
                            <Icon className="h-5 w-5 text-accent" />
                        </span>
                        {text}
                    </li>
                ))}
            </ul>
        </aside>
    </div>
);

export default AuthLayout;
