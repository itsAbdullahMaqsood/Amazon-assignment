// Static copy for the /business landing page. Nothing here touches mongoose, so
// the client components on that page can import it too.

export const steps = [
    {
        number: "1",
        title: "Create your free account",
        body: "Sign up with a work email address. There is no fee to open or keep a business account.",
    },
    {
        number: "2",
        title: "Add your team",
        body: "Invite buyers, set spending limits and decide who needs an approver before an order goes through.",
    },
    {
        number: "3",
        title: "Start buying",
        body: "Shop business pricing, pay with a shared method and export the spend report your finance team asks for.",
    },
];

export const benefits = [
    {
        icon: "TagIcon",
        title: "Business pricing & quantity discounts",
        body: "Business-only prices on millions of items, with the price per unit dropping as the quantity goes up.",
    },
    {
        icon: "UserGroupIcon",
        title: "Multi-user accounts",
        body: "One account, many buyers. Group people by team or site and give each group its own permissions.",
    },
    {
        icon: "CheckBadgeIcon",
        title: "Approval workflows",
        body: "Route orders over a threshold to an approver, so nothing unexpected reaches the card.",
    },
    {
        icon: "ChartBarIcon",
        title: "Purchasing analytics",
        body: "Dashboards for spend by group, buyer and category, plus exports for your accounting system.",
    },
    {
        icon: "ReceiptPercentIcon",
        title: "Tax-exempt purchasing",
        body: "Enrol your exemption certificates once and eligible purchases are charged without sales tax.",
    },
    {
        icon: "CreditCardIcon",
        title: "Shared payment methods",
        body: "Store a company card or line of credit centrally and let approved buyers charge to it.",
    },
];

export const comparison = [
    { feature: "Price to open the account", personal: "Free", business: "Free" },
    { feature: "Business-only pricing", personal: "—", business: "On millions of items" },
    { feature: "Quantity discounts", personal: "—", business: "Tiered by unit" },
    { feature: "Users on one account", personal: "1", business: "Unlimited, grouped by team" },
    { feature: "Approval workflows", personal: "—", business: "Rules by amount, group or buyer" },
    { feature: "Spend analytics", personal: "Order history only", business: "Dashboards and CSV export" },
    { feature: "Tax exemption", personal: "—", business: "Certificates on file" },
    { feature: "Payment methods", personal: "Personal cards", business: "Shared cards and lines of credit" },
    { feature: "Invoices", personal: "Order receipt", business: "Downloadable VAT-ready invoices" },
];

export const quotes = [
    {
        quote: "We pulled six suppliers down to one account and our office managers stopped chasing receipts.",
        name: "Priya N.",
        role: "Operations lead, 40-person design studio",
    },
    {
        quote: "Approvals were the whole reason we moved. Anything over £250 now waits for me instead of surprising me.",
        name: "Tom H.",
        role: "Finance manager, regional contractor",
    },
    {
        quote: "Quantity pricing on consumables alone covered the time it took to set the account up.",
        name: "Dana R.",
        role: "Practice manager, dental group",
    },
];

export const faqs = [
    {
        title: "How much does an Markaz Business account cost?",
        content:
            "Opening and using a business account is free. Optional Business Plus plans add shared delivery benefits and deeper analytics, and are billed yearly per user tier.",
    },
    {
        title: "Can I use the same email as my personal account?",
        content:
            "Use a separate work address. If you already shop with a personal account on that email you will be asked to convert it or pick another address, so personal orders stay out of your company's reporting.",
    },
    {
        title: "Who can see what my team buys?",
        content:
            "Account administrators see orders placed on the business account, including buyer, group and cost centre. Buyers see their own orders and anything shared with their group.",
    },
    {
        title: "Does my business have to be registered?",
        content:
            "Sole traders, charities, schools and registered companies can all open an account. Some benefits, such as tax exemption, need documents that prove your status.",
    },
    {
        title: "How do approval workflows work?",
        content:
            "You set a rule, for example any order above a set amount or from a restricted category. Matching orders pause in the approver's queue until they approve or decline, and the buyer is notified either way.",
    },
    {
        title: "Can I keep my existing payment terms?",
        content:
            "Eligible accounts can apply for a line of credit with standard terms. Until then, shared cards can be stored centrally and restricted to named buyers.",
    },
];
