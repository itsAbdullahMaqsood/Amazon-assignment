"use client";

import { useState } from "react";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

import { cn } from "@/components/ui/cn";

const dateOf = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

// Codes that checkout will really accept today, straight from the Coupon
// collection. Tapping one copies it, because the next thing you do with a code
// is paste it into the box at checkout.
const CouponStrip = ({ coupons }: any) => {
    const [copied, setCopied] = useState("");

    if (!coupons.length) {
        return null;
    }

    const copy = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(code);
        } catch {
            // Clipboard blocked: the code is on screen either way.
            setCopied("");
        }
    };

    return (
        <section aria-label="Coupon codes" className="mt-5 rounded-card border border-accent bg-accent-soft p-4">
            <h2 className="text-sm font-semibold text-fg">
                {coupons.length === 1 ? "A code that works at checkout" : "Codes that work at checkout"}
            </h2>
            <p className="mt-0.5 text-sm text-fg-muted">
                Enter one under &ldquo;Have a coupon code?&rdquo; on the checkout page. It comes off the goods, not the
                delivery, and one code applies per order.
            </p>

            <ul className="mt-3 flex flex-wrap gap-2">
                {coupons.map((coupon: any) => (
                    <li key={coupon.code}>
                        <button
                            type="button"
                            onClick={() => copy(coupon.code)}
                            className={cn(
                                "flex items-center gap-2 rounded-control border border-dashed bg-surface px-3 py-2 text-sm cursor-pointer",
                                copied === coupon.code ? "border-success text-success" : "border-line-strong text-fg hover:border-accent-ink"
                            )}
                        >
                            <span className="font-semibold tracking-wide">{coupon.code}</span>
                            <span className="text-fg-muted">{coupon.percent}% off</span>
                            {copied === coupon.code ? (
                                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                            ) : (
                                <ClipboardDocumentIcon className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
                            )}
                            <span className="sr-only">{copied === coupon.code ? "Copied" : "Copy code"}</span>
                        </button>
                        <p className="mt-1 text-xs text-fg-subtle">Until {dateOf(coupon.endDate)}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default CouponStrip;
