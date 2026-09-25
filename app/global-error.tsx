"use client";

// Replaces the root layout when the layout itself throws, so it ships its own
// <html> and cannot rely on the stylesheet, the fonts or the design tokens
// loading. Everything here is inline for that reason.
const GlobalError = ({ error, retry }: any) => (
    <html lang="en">
        <body
            style={{
                margin: 0,
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                background: "#f5f6f8",
                color: "#0f1419",
                display: "flex",
                minHeight: "100vh",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <main style={{ maxWidth: 420, textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>
                    markaz<span style={{ color: "#a78bfa" }}>.</span>
                </p>
                <h1 style={{ marginTop: 24, fontSize: 20, fontWeight: 600 }}>Markaz didn&apos;t load</h1>
                <p style={{ marginTop: 8, color: "#525a66", lineHeight: 1.5 }}>
                    Something failed before the page could be drawn. Trying again is usually enough.
                </p>
                {error?.digest && (
                    <p style={{ marginTop: 12, fontSize: 12, color: "#7a828e" }}>Reference {error.digest}</p>
                )}
                <button
                    onClick={() => retry()}
                    style={{
                        marginTop: 24,
                        padding: "10px 24px",
                        borderRadius: 10,
                        border: "none",
                        background: "#c4b5fd",
                        color: "#0f1419",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    Try again
                </button>
            </main>
        </body>
    </html>
);

export default GlobalError;
