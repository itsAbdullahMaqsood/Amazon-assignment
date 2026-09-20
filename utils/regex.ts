// Filter values arrive straight from the URL, so they are escaped before ever
// reaching a Mongo $regex: unescaped input is both an injection and a ReDoS risk.
export const escapeRegex = (value: string) =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "a_b_c" -> "^a|^b|^c", every part escaped.
export const alternationFromParam = (param: string) =>
    String(param)
        .split("_")
        .filter(Boolean)
        .map((part) => `^${escapeRegex(part)}`)
        .join("|");
