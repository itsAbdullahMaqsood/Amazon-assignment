// Shared building blocks for every admin page, so the dashboard reads as one
// product rather than a set of screens built at different times.

export const btn = {
    primary:
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-accent hover:bg-accent-strong border border-accent text-sm font-medium text-fg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-2 outline-none",
    secondary:
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-surface hover:bg-surface-muted border border-line text-sm text-fg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-2 outline-none",
    danger:
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-surface hover:bg-danger-soft border border-danger/40 text-sm text-danger cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 outline-none",
    icon: "inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-muted text-fg-muted cursor-pointer disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-accent-ink outline-none",
};

export const field =
    "w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm outline-none focus:border-accent-ink focus:ring-2 focus:ring-accent-ink/25";

export const label = "block text-sm font-medium text-fg-muted mb-1";

export const table = {
    wrap: "overflow-x-auto rounded-xl border border-line bg-surface",
    table: "w-full text-sm text-left",
    head: "bg-surface-muted text-xs uppercase tracking-wide text-fg-subtle",
    th: "px-4 py-3 font-medium whitespace-nowrap",
    row: "border-t border-line hover:bg-surface-muted/60",
    td: "px-4 py-3 align-middle",
};

export const PageHeader = ({ title, description, actions }: any) => (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">{title}</h1>
            {description && <p className="text-sm text-fg-muted mt-1">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
);

export const Panel = ({ title, action, children, className = "" }: any) => (
    <section className={`bg-surface rounded-xl border border-line ${className}`}>
        {title && (
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
                <h2 className="font-display font-semibold text-fg">{title}</h2>
                {action}
            </div>
        )}
        <div className="p-5">{children}</div>
    </section>
);

const tones: any = {
    green: "bg-success-soft text-success ring-success/20",
    amber: "bg-warning-soft text-warning ring-warning/20",
    blue: "bg-accent-soft text-accent-ink ring-accent-ink/20",
    red: "bg-danger-soft text-danger ring-danger/20",
    slate: "bg-surface-muted text-fg-muted ring-line-strong/20",
    violet: "bg-accent-soft text-accent-ink ring-accent-ink/20",
};

export const Badge = ({ tone = "slate", children }: any) => (
    <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${tones[tone]}`}
    >
        {children}
    </span>
);

// One colour per Order status, used by the dashboard and the orders page alike.
export const statusTone: any = {
    "Not Processed": "slate",
    Processing: "blue",
    Dispatched: "violet",
    Completed: "green",
    Cancelled: "red",
};

export const EmptyState = ({ title, children }: any) => (
    <div className="text-center py-12 px-4">
        <p className="font-semibold text-fg">{title}</p>
        {children && <div className="text-sm text-fg-muted mt-1">{children}</div>}
    </div>
);
