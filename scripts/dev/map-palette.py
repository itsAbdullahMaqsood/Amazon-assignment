# Usage: python3 scripts/dev/map-palette.py <files...>
# A first pass when restyling a legacy screen; the redesign finishes the job.
# Maps raw Tailwind palette classes to Markaz tokens in the files given.
import re, sys
M = {
  "bg-white": "bg-surface", "text-white": "text-fg-inverse", "border-white": "border-surface",
  "text-black": "text-fg", "bg-black": "bg-ink-950",
}
def shade(fam, n, prop):
    n = int(n)
    neutral = fam in ("slate","gray","zinc","neutral","stone")
    if neutral:
        if prop == "bg": return "surface-muted" if n <= 100 else "line" if n <= 300 else "fg-subtle" if n <= 500 else "ink-800" if n <= 800 else "ink-900"
        if prop in ("text","fill","stroke"): return "fg-inverse-muted" if n <= 300 else "fg-subtle" if n <= 500 else "fg-muted" if n <= 700 else "fg"
        if prop in ("border","ring","divide","outline"): return "line" if n <= 300 else "line-strong"
        if prop == "placeholder": return "fg-subtle"
        return "line"
    status = {"red":"danger","rose":"danger","green":"success","emerald":"success","teal":"success","yellow":"warning","amber":"warning","orange":"warning",
              "blue":"accent","sky":"accent","indigo":"accent","violet":"accent","purple":"accent","cyan":"accent"}.get(fam)
    if not status: return None
    if status == "accent":
        if prop == "bg": return "accent-soft" if n <= 100 else "accent" if n <= 400 else "accent-ink"
        if prop in ("text","fill","stroke"): return "accent-ink" if n >= 400 else "accent"
        return "accent" if n <= 400 else "accent-ink"
    if prop == "bg": return f"{status}-soft" if n <= 200 else status
    if prop in ("border","ring","outline","divide"): return f"{status}/40" if n <= 300 else status
    return status
pat = re.compile(r"\b(bg|text|border|ring|fill|stroke|divide|outline|placeholder)-(slate|gray|zinc|neutral|stone|red|rose|green|emerald|teal|yellow|amber|orange|blue|sky|indigo|violet|purple|cyan)-(\d{2,3})\b")
for p in sys.argv[1:]:
    s = open(p).read(); o = s
    for k, v in M.items():
        s = re.sub(rf"(?<![\w-]){re.escape(k)}(?![\w-])", v, s)
    s = pat.sub(lambda m: (f"{m.group(1)}-{shade(m.group(2), m.group(3), m.group(1))}" if shade(m.group(2), m.group(3), m.group(1)) else m.group(0)), s)
    if s != o:
        open(p, "w").write(s); print("mapped", p)
