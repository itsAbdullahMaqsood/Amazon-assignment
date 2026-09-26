import connectDb from "@/lib/db";
import User from "@/models/User";

// "Sign out everywhere" works by comparing the version in a token against the
// account's, which means a database read on every auth() call. One page render
// calls auth() twice — the root layout and the page itself — and they run
// concurrently, so the same primary-key lookup was issued twice, milliseconds
// apart, for every signed-in page view.
//
// The in-flight promise is shared, so concurrent callers wait on one read; the
// answer is then held briefly so the calls a page makes afterwards are free.
// The cost is that a sign-out takes up to TTL_MS to reach a session that is
// mid-burst: short enough for "straight away" to stay true.
const TTL_MS = 5000;

type Entry = { version: number | null; at: number; inFlight: Promise<number | null> | null };

// On globalThis for the same reason the mongoose connection is: Next loads this
// module once per entry graph, so a plain module-level Map would give the root
// layout and the page a cache each and dedupe nothing.
const globalCache = globalThis as any;

globalCache.markazSessionVersions ||= new Map<string, Entry>();

const cache: Map<string, Entry> = globalCache.markazSessionVersions;

const read = async (userId: string) => {
    await connectDb();
    const user: any = await User.findById(userId).select("sessionVersion").lean();

    // A deleted account has no version, and its tokens must stop working.
    return user ? user.sessionVersion || 1 : null;
};

export const currentSessionVersion = async (userId: string) => {
    const hit = cache.get(userId);

    if (hit?.inFlight) {
        return hit.inFlight;
    }

    if (hit && Date.now() - hit.at < TTL_MS) {
        return hit.version;
    }

    const inFlight = read(userId)
        .then((version) => {
            cache.set(userId, { version, at: Date.now(), inFlight: null });

            return version;
        })
        .catch((error) => {
            // A failed read must not be remembered as an answer.
            cache.delete(userId);
            throw error;
        });

    cache.set(userId, { version: hit?.version ?? null, at: 0, inFlight });

    // The map only ever holds the accounts seen in the last few seconds, but a
    // long-lived process should not grow it without bound.
    if (cache.size > 500) {
        for (const [key, entry] of cache) {
            if (!entry.inFlight && Date.now() - entry.at >= TTL_MS) cache.delete(key);
        }
    }

    return inFlight;
};

// Called by the route that raises the version, so the process that handled the
// sign-out does not keep serving its own stale answer for the next few seconds.
export const forgetSessionVersion = (userId: string) => cache.delete(String(userId));
