import { LinkTabs } from "@/components/ui/Layout";

// Orders by state, and returns, as one row of tabs: returns are a view of your
// orders, not a separate centre.
const OrdersNav = ({ tabs = [], active, returnsCount, params = "" }: any) => (
    <LinkTabs
        label="Orders"
        active={active}
        tabs={[
            ...tabs.map((tab: any) => ({
                value: tab.value,
                label: tab.label,
                count: tab.count,
                href: `/profile/orders${tab.value || params ? `?${new URLSearchParams({ ...(tab.value && { tab: tab.value }), ...Object.fromEntries(new URLSearchParams(params)) }).toString()}` : ""}`,
            })),
            { value: "returns", label: "Returns", count: returnsCount, href: "/profile/returns" },
        ]}
    />
);

export default OrdersNav;
