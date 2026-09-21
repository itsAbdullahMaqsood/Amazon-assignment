"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";

const clampStep = (value: number, precision: number) =>
    Math.min(5, Math.max(precision, Math.round(value / precision) * precision));

const Stars = ({ value, precision, size }: any) => {
    const rating = Number(value) || 0;
    const rounded = Math.round(rating / precision) * precision;

    return (
        <>
            {[0, 1, 2, 3, 4].map((index) => {
                const filled = Math.min(Math.max(rounded - index, 0), 1);

                // A fraction of a star is a filled star clipped to a percentage
                // width over a slate outline, so ratings are never rounded to a
                // whole star.
                return (
                    <span key={index} className="relative inline-flex">
                        <StarIcon className={`${size} text-slate-300`} />
                        <span
                            className="absolute top-0 left-0 overflow-hidden"
                            style={{ width: `${filled * 100}%` }}
                        >
                            <StarIcon className={`${size} text-[#FFA41C]`} />
                        </span>
                    </span>
                );
            })}
        </>
    );
};

// Read-only by default. With `onChange` it becomes a slider: click the left or
// right half of a star for x.5 or x, hover to preview, and arrow keys step by
// `precision` so the control works without a mouse.
const StarRating = ({ value, precision = 0.5, size = "w-5 h-5", onChange, label = "Rating" }: any) => {
    const [hover, setHover] = useState<number>(0);

    if (!onChange) {
        return (
            <span
                className="inline-flex items-center"
                role="img"
                aria-label={`${Number(value || 0).toFixed(1)} out of 5 stars`}
            >
                <Stars value={value} precision={precision} size={size} />
            </span>
        );
    }

    const current = Number(value) || 0;

    const valueAt = (event: any) => {
        const box = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - box.left) / box.width;

        return clampStep(Math.ceil(ratio * 5 / precision) * precision, precision);
    };

    const onKeyDown = (event: any) => {
        const steps: any = {
            ArrowRight: current + precision,
            ArrowUp: current + precision,
            ArrowLeft: current - precision,
            ArrowDown: current - precision,
            Home: precision,
            End: 5,
        };

        if (event.key in steps) {
            event.preventDefault();
            onChange(clampStep(steps[event.key], precision));
        }
    };

    return (
        <span
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-valuemin={precision}
            aria-valuemax={5}
            aria-valuenow={current || undefined}
            aria-valuetext={current ? `${current} out of 5 stars` : "Not rated"}
            onClick={(event) => onChange(valueAt(event))}
            onMouseMove={(event) => setHover(valueAt(event))}
            onMouseLeave={() => setHover(0)}
            onKeyDown={onKeyDown}
            className="inline-flex items-center cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-[#007185] focus-visible:ring-offset-2"
        >
            <Stars value={hover || current} precision={precision} size={size} />
        </span>
    );
};

export default StarRating;
