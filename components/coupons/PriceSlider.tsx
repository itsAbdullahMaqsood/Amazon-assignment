"use client";

import { useState } from "react";

const thumb =
    "pointer-events-none absolute w-full appearance-none bg-transparent h-5 " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none " +
    "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full " +
    "[&::-webkit-slider-thumb]:bg-[#0F5FA6] [&::-webkit-slider-thumb]:border-2 " +
    "[&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 " +
    "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0F5FA6] [&::-moz-range-thumb]:border-2 " +
    "[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer";

// Two overlaid range inputs. The URL is only rewritten when a handle is released,
// so dragging does not fire a request per pixel. The caller keys this component on
// the committed range, so a new range remounts it instead of syncing in an effect.
const PriceSlider = ({ ceiling, min, max, onCommit }: any) => {
    const [lo, setLo] = useState<number>(min);
    const [hi, setHi] = useState<number>(max);

    const percent = (value: number) => (ceiling ? (value / ceiling) * 100 : 0);
    const commit = () => onCommit(lo, hi);

    return (
        <div>
            <p className="text-sm font-bold">
                ${lo.toLocaleString()} &ndash; ${hi.toLocaleString()}
                {hi >= ceiling ? "+" : ""}
            </p>

            <div className="relative h-5 mt-3">
                <span className="absolute top-1/2 -translate-y-1/2 w-full h-1 rounded bg-slate-300" />
                <span
                    className="absolute top-1/2 -translate-y-1/2 h-1 rounded bg-[#0F5FA6]"
                    style={{ left: `${percent(lo)}%`, right: `${100 - percent(hi)}%` }}
                />

                <input
                    type="range"
                    aria-label="Minimum price"
                    min={0}
                    max={ceiling}
                    value={lo}
                    onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
                    onMouseUp={commit}
                    onTouchEnd={commit}
                    onKeyUp={commit}
                    className={thumb}
                />
                <input
                    type="range"
                    aria-label="Maximum price"
                    min={0}
                    max={ceiling}
                    value={hi}
                    onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
                    onMouseUp={commit}
                    onTouchEnd={commit}
                    onKeyUp={commit}
                    className={thumb}
                />
            </div>
        </div>
    );
};

export default PriceSlider;
