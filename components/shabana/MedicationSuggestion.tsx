"use client";

import Link from "next/link";

import { money } from "@/components/ui/Price";

// A drug label Shabana looked up. Two prices, the cash one and the Plus one,
// exactly as the pharmacy page shows them — and the same reminder that Markaz
// only quotes, it does not dispense.
const MedicationSuggestion = ({ medication, onNavigate }: any) => (
    <article className="rounded-card border border-line bg-surface p-3">
        <Link
            href={`/pharmacy?q=${encodeURIComponent(medication.brandName)}`}
            onClick={onNavigate}
            className="text-sm font-medium text-fg hover:underline"
        >
            {medication.brandName}
        </Link>

        <p className="mt-0.5 text-xs text-fg-muted">
            {[medication.genericName, medication.dosageForm].filter(Boolean).join(" · ")}
        </p>

        <p className="mt-1.5 text-sm">
            <span className="font-medium tabular text-fg">{money(medication.price)}</span>
            <span className="text-fg-muted"> cash · {money(medication.plusPrice)} with Plus</span>
        </p>
    </article>
);

export default MedicationSuggestion;
