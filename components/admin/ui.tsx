// Shared building blocks for every admin page, so the dashboard reads as one
// product rather than a set of screens built at different times.

export const btn = {
    primary:
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-sm font-medium text-[#0F1111] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#007185] focus-visible:ring-offset-2 outline-none",
    secondary:
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-sm text-[#0F1111] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#007185] focus-visible:ring-offset-2 outline-none",
    danger:
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white hover:bg-red-50 border border-red-300 text-sm text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 outline-none",
    icon: "inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#007185] outline-none",
};

export const field =
    "w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25";

export const label = "block text-sm font-medium text-slate-700 mb-1";

export const table = {
    wrap: "overflow-x-auto rounded-xl border border-slate-200 bg-white",
    table: "w-full text-sm text-left",
    head: "bg-slate-50 text-xs uppercase tracking-wide text-slate-500",
    th: "px-4 py-3 font-medium whitespace-nowrap",
    row: "border-t border-slate-100 hover:bg-slate-50/60",
    td: "px-4 py-3 align-middle",
};

export const PageHeader = ({ title, description, actions }: any) => (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-bold text-[#0F1111]">{title}</h1>
            {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
);

export const Panel = ({ title, action, children, className = "" }: any) => (
    <section className={`bg-white rounded-xl border border-slate-200 ${className}`}>
        {title && (
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-[#0F1111]">{title}</h2>
                {action}
            </div>
        )}
        <div className="p-5">{children}</div>
    </section>
);

const tones: any = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/20",
    slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
    violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
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
        <p className="font-semibold text-[#0F1111]">{title}</p>
        {children && <div className="text-sm text-slate-600 mt-1">{children}</div>}
    </div>
);
