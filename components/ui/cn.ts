// Joins class names, dropping the falsy ones: cn("a", cond && "b").
export const cn = (...parts: any[]) => parts.filter(Boolean).join(" ");
