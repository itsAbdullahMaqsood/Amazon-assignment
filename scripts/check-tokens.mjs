// Fails when a redesigned folder uses a colour that is not a design token: a hex
// literal, an arbitrary [#...] class, or a raw Tailwind palette class such as
// bg-slate-100. Folders join the list as their pages are redesigned.
import fs from "fs";
import path from "path";

const CHECKED = JSON.parse(fs.readFileSync(new URL("./token-folders.json", import.meta.url), "utf8"));

const palette =
    "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const rules = [
    { name: "hex literal", re: /#[0-9a-fA-F]{3,8}\b(?![\w-])/g },
    { name: "raw palette class", re: new RegExp(`\\b(?:bg|text|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|decoration|accent|shadow)-(?:${palette})-\\d{2,3}\\b`, "g") },
    { name: "black/white class", re: /\b(?:bg|text|border|from|to|ring)-(?:black|white)\b/g },
];

const walk = (target) => {
    if (!fs.existsSync(target)) return [];
    if (fs.statSync(target).isFile()) return [target];
    return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => walk(path.join(target, entry.name)));
};

let problems = 0;

for (const file of CHECKED.flatMap(walk).filter((f) => /\.(tsx?|jsx?)$/.test(f))) {
    const lines = fs.readFileSync(file, "utf8").split("\n");

    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;

        for (const rule of rules) {
            for (const match of line.matchAll(rule.re)) {
                // Entity references like &#39; are not colours.
                if (rule.name === "hex literal" && line[match.index - 1] === "&") continue;
                problems++;
                console.log(`${file}:${i + 1}  ${rule.name}: ${match[0]}`);
            }
        }
    });
}

if (problems) {
    console.log(`\n${problems} colour value(s) outside the design tokens.`);
    process.exit(1);
}

console.log(`check:tokens: ${CHECKED.length} folder(s) clean.`);
