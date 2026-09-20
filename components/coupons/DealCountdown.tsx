"use client";

import { useEffect, useState } from "react";

const pad = (value: number) => String(value).padStart(2, "0");

// Counts down to the end of the deal day. The first paint renders nothing so the
// server HTML and the hydrated clock cannot disagree.
const DealCountdown = () => {
    const [remaining, setRemaining] = useState<string>("");

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const end = new Date(now);
            end.setHours(24, 0, 0, 0);

            const seconds = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));

            setRemaining(
                `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(
                    seconds % 60
                )}`
            );
        };

        tick();
        const id = setInterval(tick, 1000);

        return () => clearInterval(id);
    }, []);

    if (!remaining) {
        return <span className="text-xs font-bold">Limited time deal</span>;
    }

    return (
        <span className="text-xs font-bold tabular-nums">Ends in {remaining}</span>
    );
};

export default DealCountdown;
