import { cn } from "./cn";

const Card = ({ as: Tag = "div", padded = true, className = "", children, ...rest }: any) => (
    <Tag
        className={cn("bg-surface border border-line rounded-card", padded && "p-4 md:p-6", className)}
        {...rest}
    >
        {children}
    </Tag>
);

export const CardHeader = ({ title, description, action, className = "" }: any) => (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
        <div>
            <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
            {description && <p className="text-sm text-fg-muted mt-0.5">{description}</p>}
        </div>
        {action}
    </div>
);

export default Card;
