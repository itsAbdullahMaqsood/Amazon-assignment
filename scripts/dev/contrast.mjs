// WCAG contrast over the token pairs the store actually paints. The tokens are
// repeated here from styles/globals.css because the check has to run without a
// browser; keep the two in step.
//
//   node scripts/dev/contrast.mjs
//
// Normal text needs 4.5:1, and a control's own edge needs 3:1 (WCAG 1.4.11),
// which is why form controls use --color-line-control rather than the lighter
// --color-line-strong that decorative edges keep.
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const t = {
  "ink-950": "#0c121c", "ink-900": "#121a27", "ink-800": "#1c2636",
  canvas: "#f5f6f8", surface: "#ffffff", "surface-muted": "#eef0f4",
  line: "#e3e6eb", "line-strong": "#c9ced6", "line-control": "#7e8694",
  fg: "#0f1419", "fg-muted": "#525a66", "fg-subtle": "#656d7a",
  "fg-inverse": "#ffffff", "fg-inverse-muted": "#b8c0cc",
  accent: "#c4b5fd", "accent-strong": "#a78bfa", "accent-soft": "#f1edff",
  "accent-ink": "#5c3fb8", "accent-deep": "#452c93",
  success: "#177043", "success-soft": "#e7f5ed", warning: "#9a5a06", "warning-soft": "#fdf3e2",
  danger: "#c0262d", "danger-soft": "#fdecec", star: "#8b6cf2",
};

const pairs = [
  ["body text", "fg", "canvas"], ["body text on white", "fg", "surface"],
  ["muted text", "fg-muted", "surface"], ["muted on canvas", "fg-muted", "canvas"],
  ["subtle text", "fg-subtle", "surface"], ["subtle on muted", "fg-subtle", "surface-muted"],
  ["link", "accent-ink", "surface"], ["link on canvas", "accent-ink", "canvas"],
  ["link on accent-soft", "accent-ink", "accent-soft"],
  ["primary button", "fg", "accent"], ["primary hover", "fg", "accent-strong"],
  ["secondary button", "fg-inverse", "ink-900"],
  ["header text", "fg-inverse", "ink-900"], ["header muted", "fg-inverse-muted", "ink-900"],
  ["movies body", "fg-inverse-muted", "ink-950"], ["movies heading", "fg-inverse", "ink-950"],
  ["success text", "success", "surface"], ["success on soft", "success", "success-soft"],
  ["warning text", "warning", "surface"], ["warning on soft", "warning", "warning-soft"],
  ["danger text", "danger", "surface"], ["danger on soft", "danger", "danger-soft"],
  ["badge accent", "accent-ink", "accent-soft"],
  ["star", "star", "surface"],
  ["focus ring", "accent-ink", "surface"],
  ["decorative border", "line-strong", "surface"], ["control border", "line-control", "surface"], ["control border on canvas", "line-control", "canvas"], ["control border on muted", "line-control", "surface-muted"],
];

// A border and an icon are not text: WCAG asks 3:1 of them, not 4.5:1. The
// decorative border is under even that on purpose — it is a hairline between
// two panels, not the edge of a control, and nothing depends on seeing it.
const needsOnly3 = new Set(["star", "control border", "control border on canvas", "control border on muted"]);
const exempt = new Set(["decorative border"]);

let failures = [];

for (const [name, fg, bg] of pairs) {
  const r = ratio(t[fg], t[bg]);
  const floor = exempt.has(name) ? 0 : needsOnly3.has(name) ? 3 : 4.5;
  const ok = r >= floor;

  if (!ok) failures.push(`${name} ${r.toFixed(2)} (needs ${floor})`);

  console.log(`${(ok ? "pass" : "FAIL").padEnd(5)} ${r.toFixed(2).padStart(6)}  needs ${String(floor).padEnd(3)}  ${name}  (${fg} on ${bg})`);
}

console.log(failures.length ? `\n${failures.length} below the bar: ${failures.join(", ")}` : "\nEvery pair meets its bar.");
process.exit(failures.length ? 1 : 0);
