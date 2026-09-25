import Link from "next/link";

import Wordmark from "@/components/ui/Wordmark";
import { Container } from "@/components/ui/Layout";
import { accountLinks, helpLinks, quickLinks, stores } from "./Header/navigation";

const Column = ({ title, links }: any) => (
    <div>
        <h2 className="text-sm font-semibold text-fg-inverse">{title}</h2>
        <ul className="mt-3 space-y-2">
            {links.map((link: any) => (
                <li key={link.href}>
                    <Link href={link.href} className="text-sm text-fg-inverse-muted hover:text-fg-inverse hover:underline">
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

// Three short columns of places that exist, instead of a wall of corporate
// links. Every entry here is a real page in this store.
const Footer = () => (
    <footer className="mt-16 bg-ink-900 text-fg-inverse">
        <Container className="py-12">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <div className="col-span-2 max-w-xs md:col-span-1">
                    <Wordmark />
                    <p className="mt-3 text-sm text-fg-inverse-muted">
                        A general store with fewer steps between you and the thing you came for. Ask Shabana
                        when you&apos;re not sure what that is.
                    </p>
                </div>
                <Column
                    title="Shop"
                    links={[
                        { label: "All departments", href: "/browse" },
                        ...quickLinks,
                        { label: "Groceries", href: "/groceries" },
                        { label: "Markaz Home", href: "/furniture" },
                        { label: "Pharmacy", href: "/pharmacy" },
                    ]}
                />
                <Column title="Your account" links={accountLinks.slice(0, 6)} />
                <Column title="More from Markaz" links={[...stores.slice(1), ...helpLinks.slice(0, 1)]} />
            </div>
        </Container>

        <div className="border-t border-fg-inverse/10">
            <Container className="flex flex-col gap-2 py-5 text-xs text-fg-inverse-muted sm:flex-row sm:items-center sm:justify-between">
                <p>© {new Date().getFullYear()} Markaz. A coursework project: payments are simulated and nothing ships.</p>
                <p>
                    Product data from dummyjson, films from TMDB, medication labels from openFDA.
                </p>
            </Container>
        </div>
    </footer>
);

export default Footer;
