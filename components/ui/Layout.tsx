import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

import { cn } from "./cn";

// The page column: 1280px max, 16px gutters on phones, 32px on desktop. A
// narrower page passes its own max-w-* and that wins, rather than two width
// classes fighting over which one the stylesheet happens to put last.
export const Container = ({ as: Tag = "div", className = "", children }: any) => (
    <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", !/(^|\s)max-w-/.test(className) && "max-w-page", className)}>
        {children}
    </Tag>
);

export const PageHeader = ({ title, description, eyebrow, action, className = "" }: any) => (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between pt-6 pb-4 md:pt-10 md:pb-6", className)}>
        <div className="min-w-0">
            {eyebrow && <div className="mb-2">{eyebrow}</div>}
            <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-fg">{title}</h1>
            {description && <p className="mt-1.5 text-fg-muted max-w-2xl">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
    </div>
);

export const SectionHeader = ({ title, description, action, as: Tag = "h2", className = "" }: any) => (
    <div className={cn("flex items-end justify-between gap-4 mb-4", className)}>
        <div className="min-w-0">
            <Tag className="font-display text-xl font-semibold tracking-tight text-fg">{title}</Tag>
            {description && <p className="text-sm text-fg-muted mt-0.5">{description}</p>}
        </div>
        {action && <div className="shrink-0 text-sm">{action}</div>}
    </div>
);

export const Breadcrumbs = ({ items, className = "" }: any) => (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-fg-muted", className)}>
        <ol className="flex flex-wrap items-center gap-1">
            {items.map((item: any, i: number) => (
                <li key={`${item.label}-${i}`} className="flex items-center gap-1 min-w-0">
                    {i > 0 && <ChevronRightIcon className="h-4 w-4 text-fg-subtle shrink-0" aria-hidden="true" />}
                    {item.href && i < items.length - 1 ? (
                        <Link href={item.href} className="hover:text-fg hover:underline truncate">
                            {item.label}
                        </Link>
                    ) : (
                        <span aria-current={i === items.length - 1 ? "page" : undefined} className="text-fg truncate">
                            {item.label}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    </nav>
);

// `as` is the heading level: an empty state usually sits under a page heading,
// but on the pages that are nothing but an empty state — 404, forbidden — it is
// the page's own heading and has to be the h1.
export const EmptyState = ({ icon: Icon, title, description, action, as: Heading = "h2", className = "" }: any) => (
    <div className={cn("flex flex-col items-center text-center rounded-card border border-dashed border-line-strong bg-surface px-6 py-12", className)}>
        {Icon && (
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                <Icon className="h-6 w-6" />
            </span>
        )}
        <Heading className="font-display text-lg font-semibold text-fg">{title}</Heading>
        {description && <p className="mt-1 max-w-md text-sm text-fg-muted">{description}</p>}
        {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
);

export const Skeleton = ({ className = "" }: any) => (
    <div aria-hidden="true" className={cn("animate-pulse rounded-control bg-surface-muted", className)} />
);

// Tabs whose state lives in the URL, so a tab can be linked to and survives a
// reload. Scrolls sideways on phones rather than wrapping.
export const LinkTabs = ({ tabs, active, label = "Sections", className = "" }: any) => (
    <nav aria-label={label} className={cn("border-b border-line", className)}>
        <ul className="-mb-px flex gap-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab: any) => {
                const current = tab.value === active;

                return (
                    <li key={tab.value} className="shrink-0">
                        <Link
                            href={tab.href}
                            aria-current={current ? "page" : undefined}
                            scroll={false}
                            className={cn(
                                "inline-flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors",
                                current ? "border-accent-ink text-fg" : "border-transparent text-fg-muted hover:text-fg hover:border-line-strong"
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={cn("rounded-full px-1.5 text-xs tabular", current ? "bg-accent-soft text-accent-ink" : "bg-surface-muted text-fg-muted")}>
                                    {tab.count}
                                </span>
                            )}
                        </Link>
                    </li>
                );
            })}
        </ul>
    </nav>
);

export const Notice = ({ tone = "accent", title, children, className = "" }: any) => {
    const tones: Record<string, string> = {
        accent: "bg-accent-soft border-accent text-fg",
        success: "bg-success-soft border-success/30 text-fg",
        warning: "bg-warning-soft border-warning/30 text-fg",
        danger: "bg-danger-soft border-danger/30 text-fg",
        neutral: "bg-surface-muted border-line text-fg",
    };

    return (
        <div role={tone === "danger" ? "alert" : undefined} className={cn("rounded-card border px-4 py-3 text-sm", tones[tone], className)}>
            {title && <p className="font-semibold">{title}</p>}
            {children && <div className={title ? "mt-0.5 text-fg-muted" : ""}>{children}</div>}
        </div>
    );
};
