// The app imports itself through the "@/..." alias that tsconfig.json defines
// and Node does not know about, and it writes those imports without a file
// extension the way a bundler allows. This hook does both jobs — map the alias
// to the project root, then find the file — so the test runner loads exactly
// the modules the app loads, with no build step and no extra dependency.
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const CANDIDATES = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx"];

const resolveFile = (base) => {
    for (const suffix of CANDIDATES) {
        const candidate = `${base}${suffix}`;

        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
        }
    }

    return null;
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        // "@/lib/price" -> <root>/lib/price.ts
        if (specifier.startsWith("@/")) {
            const file = resolveFile(path.join(root, specifier.slice(2)));

            if (file) {
                return nextResolve(pathToFileURL(file).href, context);
            }
        }

        // "./layout" -> the sibling layout.ts
        if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
            const file = resolveFile(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));

            if (file) {
                return nextResolve(pathToFileURL(file).href, context);
            }
        }

        return nextResolve(specifier, context);
    },
});
