"use client";

import Link from "next/link";
import Image from "next/image";

import QuantityStepper from "@/components/ui/QuantityStepper";
import Badge from "@/components/ui/Badge";
import { money } from "@/components/ui/Price";
import { colorName } from "@/lib/colors";

// One cart line. The price and stock come from the last re-price against the
// database; a quantity above what is in stock is capped here, and a line whose
// product has left the catalogue says so instead of keeping an old price.
const CartLine = ({ line, onQty, onRemove, onSave, saving }: any) => {
    const href = line.slug ? `/product/${line.slug}?style=${line.style}` : undefined;
    const variant = line.color?.color ? colorName(line.color.color) : line.style > 0 ? `Style ${Number(line.style) + 1}` : "";
    const moved = !line.unavailable && line.previousPrice && Math.abs(line.previousPrice - line.price) >= 0.01;
    const lowStock = !line.unavailable && line.quantity > 0 && line.quantity <= 5;
    const image = line.images?.[0]?.url;

    const Name = href ? Link : "span";

    return (
        <li className="flex gap-4 py-5">
            <Name href={href as any} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-card bg-surface-muted md:h-28 md:w-28">
                {image && <Image src={image} alt="" fill sizes="112px" className="object-contain p-2" />}
            </Name>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Name href={href as any} className="line-clamp-2 font-medium leading-snug text-fg hover:underline underline-offset-2">
                            {line.name}
                        </Name>
                        <p className="mt-0.5 text-sm text-fg-muted">
                            {[variant, line.size && !/^one size$/i.test(line.size) ? `Size ${line.size}` : ""].filter(Boolean).join(" · ") ||
                                money(line.price) + " each"}
                        </p>
                    </div>
                    <p className="shrink-0 text-right font-semibold tabular">
                        {line.unavailable ? "—" : money(line.price * line.qty)}
                    </p>
                </div>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {line.unavailable && <Badge tone="danger">No longer available</Badge>}
                    {moved && (
                        <Badge tone={line.price < line.previousPrice ? "success" : "warning"}>
                            Price {line.price < line.previousPrice ? "dropped" : "went up"} from {money(line.previousPrice)}
                        </Badge>
                    )}
                    {lowStock && <Badge tone="warning">Only {line.quantity} left</Badge>}
                    {!line.unavailable && line.shipping > 0 && <Badge>{money(line.shipping)} delivery</Badge>}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3">
                    {!line.unavailable && (
                        <QuantityStepper
                            size="sm"
                            value={line.qty}
                            max={Math.max(1, line.quantity)}
                            onChange={onQty}
                            onRemove={onRemove}
                            label={`Quantity of ${line.name}`}
                        />
                    )}
                    {!line.unavailable && (
                        <button type="button" onClick={onSave} disabled={saving} className="text-sm text-link disabled:opacity-60">
                            Save for later
                        </button>
                    )}
                    <button type="button" onClick={onRemove} className="text-sm text-fg-muted hover:text-danger hover:underline cursor-pointer">
                        Remove
                    </button>
                </div>
            </div>
        </li>
    );
};

export default CartLine;
