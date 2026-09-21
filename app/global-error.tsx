"use client";

// Replaces the root layout when the layout itself throws, so it ships its own
// <html> and cannot rely on anything above it.
const GlobalError = ({ error, retry }: any) => {
    return (
        <html lang="en">
            <body style={{ fontFamily: "system-ui, sans-serif", padding: "80px 24px", textAlign: "center" }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Amazon is temporarily unavailable</h1>
                <p style={{ marginTop: 8, color: "#565959" }}>
                    The page failed to load. Try again in a moment.
                </p>
                {error?.digest && (
                    <p style={{ marginTop: 12, fontSize: 12, color: "#8d9192" }}>
                        Reference: {error.digest}
                    </p>
                )}
                <button
                    onClick={() => retry()}
                    style={{
                        marginTop: 24,
                        padding: "8px 24px",
                        borderRadius: 999,
                        border: "1px solid #FCD200",
                        background: "#FFD814",
                        cursor: "pointer",
                    }}
                >
                    Try again
                </button>
            </body>
        </html>
    );
};

export default GlobalError;
