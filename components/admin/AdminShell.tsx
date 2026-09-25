"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ClipboardDocumentListIcon,
    CubeIcon,
    FolderIcon,
    FolderOpenIcon,
    HomeIcon,
    PlusCircleIcon,
    TicketIcon,
    UsersIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectMenuSidebarDashboard, toggleSidebar } from "@/redux/slices/MenuSlice";
import useFocusTrap from "@/components/shared/useFocusTrap";

const links = [
    { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon, exact: true },
    { label: "Orders", href: "/admin/dashboard/orders", icon: ClipboardDocumentListIcon },
    { label: "Products", href: "/admin/dashboard/product", icon: CubeIcon, exact: true },
    { label: "Create Product", href: "/admin/dashboard/product/create", icon: PlusCircleIcon },
    { label: "Categories", href: "/admin/dashboard/categories", icon: FolderIcon },
    { label: "Sub-Categories", href: "/admin/dashboard/sub-categories", icon: FolderOpenIcon },
    { label: "Coupons", href: "/admin/dashboard/coupons", icon: TicketIcon },
    { label: "Users", href: "/admin/dashboard/users", icon: UsersIcon },
];

const isActive = (pathname: string, link: any) =>
    link.exact
        ? pathname === link.href || (link.href.endsWith("/product") && /\/product\/[^/]+\/edit/.test(pathname))
        : pathname.startsWith(link.href);

const NavLinks = ({ pathname, collapsed, onNavigate }: any) => (
    <ul className="space-y-1">
        {links.map((link) => {
            const active = isActive(pathname, link);
            const Icon = link.icon;

            return (
                <li key={link.href}>
                    <Link
                        href={link.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? link.label : undefined}
                        className={`flex items-center gap-3 h-11 rounded-lg px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            collapsed ? "justify-center" : ""
                        } ${
                            active
                                ? "bg-white/10 text-white font-semibold"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                        <Icon className={`w-5 h-5 shrink-0 ${active ? "text-accent" : ""}`} />
                        {collapsed ? <span className="sr-only">{link.label}</span> : link.label}
                    </Link>
                </li>
            );
        })}
    </ul>
);

// Sidebar collapse state lives in Redux (and persists with the rest of the
// store); the phone drawer is local, since it only matters while it is open.
const AdminShell = ({ user, children }: any) => {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const collapsed = useAppSelector(selectMenuSidebarDashboard);
    const [drawer, setDrawer] = useState<boolean>(false);
    const drawerRef = useRef<HTMLDivElement | null>(null);

    useFocusTrap(drawerRef, drawer, () => setDrawer(false));

    return (
        <div className="min-h-screen bg-gray-100 md:flex">
            {/* Tablet and desktop: a fixed-height rail that collapses to icons. */}
            <aside
                className={`hidden md:flex flex-col shrink-0 sticky top-0 h-screen bg-ink-900 text-white transition-[width] duration-200 ${
                    collapsed ? "w-[76px]" : "w-64"
                }`}
            >
                <div className={`flex items-center h-16 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
                    {!collapsed && (
                        <Link href="/admin/dashboard" className="font-bold tracking-tight">
                            markaz <span className="text-accent font-normal">admin</span>
                        </Link>
                    )}
                    <button
                        onClick={() => dispatch(toggleSidebar())}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-expanded={!collapsed}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                        {collapsed ? (
                            <ChevronDoubleRightIcon className="w-5 h-5" />
                        ) : (
                            <ChevronDoubleLeftIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-2">
                    <NavLinks pathname={pathname} collapsed={collapsed} />
                </nav>

                <div className="px-3 py-4 border-t border-white/10">
                    <Link
                        href="/"
                        title={collapsed ? "Back to store" : undefined}
                        className={`flex items-center gap-3 h-11 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            collapsed ? "justify-center" : ""
                        }`}
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 shrink-0" />
                        {collapsed ? <span className="sr-only">Back to store</span> : "Back to store"}
                    </Link>
                    {!collapsed && (
                        <p className="px-3 mt-3 text-xs text-slate-400 truncate">
                            Signed in as {user?.name}
                        </p>
                    )}
                </div>
            </aside>

            {/* Phones: a top bar and a drawer. */}
            <div className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-3 bg-ink-900 text-white">
                <button
                    onClick={() => setDrawer(true)}
                    aria-label="Open admin menu"
                    aria-expanded={drawer}
                    className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <Link href="/admin/dashboard" className="font-bold">
                    markaz <span className="text-accent font-normal">admin</span>
                </Link>
                <Link href="/" aria-label="Back to store" className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10">
                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                </Link>
            </div>

            {drawer && (
                <div className="md:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
                    <div
                        ref={drawerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Admin menu"
                        className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-ink-900 text-white flex flex-col"
                    >
                        <div className="flex items-center justify-between h-14 px-4">
                            <span className="font-bold">
                                markaz <span className="text-accent font-normal">admin</span>
                            </span>
                            <button
                                onClick={() => setDrawer(false)}
                                aria-label="Close admin menu"
                                className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-2">
                            <NavLinks pathname={pathname} collapsed={false} onNavigate={() => setDrawer(false)} />
                        </nav>
                        <Link
                            href="/"
                            className="flex items-center gap-3 h-12 px-6 border-t border-white/10 text-sm text-slate-300"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            Back to store
                        </Link>
                    </div>
                </div>
            )}

            <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
};

export default AdminShell;
