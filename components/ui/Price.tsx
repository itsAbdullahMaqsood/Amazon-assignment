import { cn } from "./cn";

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// The one money format the store uses: "$1,234.50".
export const money = (value: any) => formatter.format(Number(value) || 0);

const sizes: Record<string, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "font-display text-3xl",
};

// Price as a shopper reads it: what you pay, then (only when there is a real
// saving) the list price struck through and the saving in green.
const Price = ({ value, listPrice, size = "md", showSaving = true, className = "" }: any) => {
    const amount = Number(value) || 0;
    const list = Number(listPrice) || 0;
    const saving = list > amount ? Math.round(((list - amount) / list) * 100) : 0;

    return (
        <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular", className)}>
            <span className={cn("font-semibold text-fg", sizes[size])}>{money(amount)}</span>
            {saving > 0 && (
                <>
                    <span className="text-sm text-fg-subtle line-through">{money(list)}</span>
                    {showSaving && <span className="text-sm font-medium text-success">Save {saving}%</span>}
                </>
            )}
        </span>
    );
};

export default Price;
