// Auto-reorder is a reminder, not a standing order: Markaz never places one of
// these by itself, and the page that shows them says so. These are the rules
// the route and the panel share.

export const WEEK_OPTIONS = [
    { value: 2, label: "Every 2 weeks" },
    { value: 4, label: "Every 4 weeks" },
    { value: 8, label: "Every 2 months" },
    { value: 12, label: "Every 3 months" },
    { value: 26, label: "Every 6 months" },
];

export const weeksLabel = (weeks: number) =>
    WEEK_OPTIONS.find((option) => option.value === Number(weeks))?.label || `Every ${weeks} weeks`;

export const nextDueDate = (from: Date, weeks: number) =>
    new Date(from.getTime() + Number(weeks) * 7 * 86400000);

export const dueIn = (nextAt: any) => Math.ceil((new Date(nextAt).getTime() - Date.now()) / 86400000);

export const dueLabel = (nextAt: any) => {
    const days = dueIn(nextAt);

    if (days < 0) return `Due ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    if (days < 21) return `Due in ${days} days`;

    return `Due ${new Date(nextAt).toLocaleDateString("en-US", { day: "numeric", month: "long" })}`;
};
