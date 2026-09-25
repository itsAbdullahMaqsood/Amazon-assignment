import Badge from "@/components/ui/Badge";

const StatusPill = ({ state }: any) => <Badge tone={state?.tone || "neutral"}>{state?.label}</Badge>;

export default StatusPill;
