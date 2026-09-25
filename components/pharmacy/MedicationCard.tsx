import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { money } from "@/components/ui/Price";
import { cn } from "@/components/ui/cn";
import { PLUS_DISCOUNT } from "@/lib/pharmacy";

// Both prices, with the one that applies to this account marked. The membership
// is read on the server, so the highlighted price is the one a member would
// actually be quoted rather than a badge inviting them to join.
const PriceBlock = ({ label, value, applies }: any) => (
    <div
        className={cn(
            "rounded-card border px-4 py-3",
            applies ? "border-accent-ink bg-accent-soft" : "border-line bg-surface"
        )}
    >
        <p className="text-xs text-fg-muted">{label}</p>
        <p className="font-display text-xl font-semibold tabular text-fg">{money(value)}</p>
        {applies && <p className="text-xs font-medium text-accent-deep">Your price</p>}
    </div>
);

const MedicationCard = ({ medication, member }: any) => (
    <article className="rounded-card border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-fg">{medication.brandName}</h3>
                <p className="mt-0.5 text-sm text-fg-muted">
                    {[medication.genericName, medication.dosageForm, medication.route?.toLowerCase()].filter(Boolean).join(" · ")}
                </p>
                {medication.manufacturer && <p className="mt-0.5 text-xs text-fg-subtle">Labelled by {medication.manufacturer}</p>}
            </div>

            <div className="flex gap-3">
                <PriceBlock label="Cash price" value={medication.price} applies={!member} />
                <PriceBlock label={`Plus price (−${PLUS_DISCOUNT}%)`} value={medication.plusPrice} applies={member} />
            </div>
        </div>

        {medication.purpose && (
            <p className="mt-4 border-t border-line pt-3 text-sm text-fg-muted">
                <span className="font-medium text-fg">Purpose, from the label: </span>
                {medication.purpose}
            </p>
        )}

        {!member && (
            <p className="mt-3 text-sm text-fg-muted">
                <Link href="/plus" className="text-link">
                    Markaz Plus
                </Link>{" "}
                would bring this to {money(medication.plusPrice)}.
            </p>
        )}
    </article>
);

export default MedicationCard;
