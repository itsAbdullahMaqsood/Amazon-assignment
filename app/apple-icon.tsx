import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The same mark as app/icon.svg, rendered to PNG for iOS home screens, which do
// not accept SVG icons. Colours are the ink-900 and accent tokens.
const AppleIcon = () =>
    new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#121a27",
                }}
            >
                <svg width="150" height="150" viewBox="0 0 32 32">
                    <path
                        d="M7.5 22.5v-8.25a3.25 3.25 0 0 1 6.5 0v8.25M14 14.25a3.25 3.25 0 0 1 6.5 0v8.25"
                        fill="none"
                        stroke="#c4b5fd"
                        strokeWidth="2.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="24.75" cy="21.25" r="1.9" fill="#c4b5fd" />
                </svg>
            </div>
        ),
        size
    );

export default AppleIcon;
