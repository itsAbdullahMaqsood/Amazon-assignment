import { createLocalStore } from "@/lib/localStore";

// Deregistering a device only hides it for this browser; there is no device
// registry in the database to write to.
export const DEVICES_KEY = "markaz:devices";

export const deviceStore = createLocalStore<string[]>(DEVICES_KEY, []);

export const deregisterDevice = (id: string) => {
    deviceStore.set((current: any) =>
        Array.isArray(current) && current.includes(id) ? current : [...(current || []), id]
    );
};

export const registerDevice = (id: string) => {
    deviceStore.set((current: any) => (current || []).filter((entry: string) => entry !== id));
};

// The seeded half of the list: the kind of hardware an Amazon account usually
// carries, with fixed registration dates so the page renders the same every time.
export const seededDevices = [
    {
        id: "fire-tv-stick-4k",
        name: "Fire TV Stick 4K — Living room",
        type: "Streaming media player",
        icon: "TvIcon",
        registeredOn: "2024-11-02",
        detail: "Markaz Movies, app downloads and Shabana voice search",
    },
    {
        id: "kindle-paperwhite",
        name: "Kindle Paperwhite (11th Gen)",
        type: "E-reader",
        icon: "BookOpenIcon",
        registeredOn: "2023-06-18",
        detail: "Kindle books, Plus Reading and Whispersync",
    },
    {
        id: "echo-dot-5",
        name: "Echo Dot (5th Gen) — Kitchen",
        type: "Smart speaker",
        icon: "SpeakerWaveIcon",
        registeredOn: "2025-01-09",
        detail: "Shabana, shopping lists and music playback",
    },
];

// A deliberately small user-agent read: enough to name the browser and platform
// in the "this device" row, with no attempt at a full UA database.
export const describeUserAgent = (userAgent: string) => {
    const ua = String(userAgent || "");

    const browser =
        (/Edg\//.test(ua) && "Edge") ||
        (/OPR\/|Opera/.test(ua) && "Opera") ||
        (/Firefox\//.test(ua) && "Firefox") ||
        (/Chrome\//.test(ua) && "Chrome") ||
        (/Safari\//.test(ua) && "Safari") ||
        "Browser";

    const platform =
        (/iPhone/.test(ua) && "iPhone") ||
        (/iPad/.test(ua) && "iPad") ||
        (/Android/.test(ua) && "Android") ||
        (/Mac OS X|Macintosh/.test(ua) && "macOS") ||
        (/Windows/.test(ua) && "Windows") ||
        (/Linux/.test(ua) && "Linux") ||
        "this computer";

    const mobile = /iPhone|iPad|Android/.test(ua);

    return {
        id: "this-browser",
        name: `${browser} on ${platform}`,
        type: mobile ? "Mobile browser" : "Web browser",
        icon: mobile ? "DevicePhoneMobileIcon" : "ComputerDesktopIcon",
        detail: "The browser you are reading this page in, read from the request's user-agent header",
        isCurrent: true,
    };
};
