"use client";

import Link from "next/link";

// Segment-level boundary. `retry` re-renders the segment on the server, which is
// enough for the transient database or upstream-API failures this app can hit.
const Error = ({ error, retry }: any) => {
    return (
        <main className="bg-white min-h-[60vh]">
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-[#0F1111]">
                    Sorry, something went wrong on our end.
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                    Nothing you did caused this. Try the page again, and if it keeps failing use
                    the links below.
                </p>

                {error?.digest && (
                    <p className="text-xs text-slate-400 mt-3">Reference: {error.digest}</p>
                )}

                <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                        onClick={() => retry()}
                        className="px-6 py-2 rounded-full bg-linear-to-r from-amazon-orange to-yellow-300 text-amazon-blue_dark cursor-pointer"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-2 rounded-full border border-slate-300 text-[#0F1111]"
                    >
                        Back to home
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default Error;
