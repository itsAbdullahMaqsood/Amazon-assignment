import { emailLayout, escapeHtml } from "./layout";

const t = {
    fg: "#0f1419",
    fgMuted: "#525a66",
    fgSubtle: "#737b87",
    line: "#e3e6eb",
    success: "#1a7f4b",
};

const money = (value: number) =>
    `$${(Math.round((Number(value) || 0) * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const line = (label: string, value: string, options: any = {}) => `
  <tr>
    <td style="padding:6px 0;font-size:14px;color:${options.tone === "success" ? t.success : t.fgMuted};">${label}</td>
    <td align="right" style="padding:6px 0;font-size:14px;color:${options.tone === "success" ? t.success : t.fg};${options.strong ? "font-weight:bold;" : ""}">${value}</td>
  </tr>`;

// The order exactly as the order page shows it: every figure comes from the
// saved document, so the email and the page cannot tell different stories about
// what was charged.
const summary = (order: any) => {
    const items = (order.products || [])
        .map(
            (item: any) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid ${t.line};font-size:14px;color:${t.fg};">
      ${escapeHtml(item.name)}<br />
      <span style="font-size:12px;color:${t.fgSubtle};">Qty ${item.qty}${item.size ? ` · size ${escapeHtml(item.size)}` : ""}</span>
    </td>
    <td align="right" style="padding:10px 0;border-bottom:1px solid ${t.line};font-size:14px;color:${t.fg};white-space:nowrap;">
      ${money(item.price * item.qty)}
    </td>
  </tr>`
        )
        .join("");

    // What the coupon took off, derived from the figures the order stores rather
    // than recomputed from the code: goods plus delivery, less the gift card,
    // less what was actually charged.
    const goods = (order.products || []).reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
    const giftCard = order.giftCardApplied || 0;
    const discount = Math.max(0, Math.round((goods + (order.shippingPrice || 0) - giftCard - order.total) * 100) / 100);

    return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  ${items}
  ${line("Items", money(goods))}
  ${line("Delivery", order.shippingPrice > 0 ? money(order.shippingPrice) : "Free")}
  ${discount > 0 ? line(`Coupon ${escapeHtml(order.couponApplied || "")}`, `−${money(discount)}`, { tone: "success" }) : ""}
  ${giftCard > 0 ? line("Gift card", `−${money(giftCard)}`, { tone: "success" }) : ""}
  ${line(order.isPaid ? "Paid" : "To pay on delivery", money(order.total), { strong: true })}
</table>

<p style="margin:0 0 24px;font-size:13px;color:${t.fgSubtle};line-height:1.6;">
  Delivering to ${escapeHtml(
      [order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(" ")
  )}, ${escapeHtml([order.shippingAddress?.address1, order.shippingAddress?.city, order.shippingAddress?.country].filter(Boolean).join(", "))}.
</p>`;
};

const orderConfirmationTemplate = (email: string, url: string, order: any) => {
    const count = (order.products || []).reduce((sum: number, item: any) => sum + (item.qty || 0), 0);

    return emailLayout({
        email,
        url,
        button: "View your order",
        heading: `Thanks — order #${String(order._id).slice(-8).toUpperCase()} is placed`,
        body: order.isPaid
            ? `${count} item${count === 1 ? "" : "s"}, paid with ${order.paymentMethod === "paypal" ? "PayPal" : "a card"}. Payments in this store are simulated, so no money actually moved.`
            : `${count} item${count === 1 ? "" : "s"}, to be paid in cash when it arrives.`,
        content: summary(order),
        footnote:
            "Markaz is a coursework project: nothing is really dispatched and no money changes hands. You can follow the order, or start a return once it is marked delivered, from your account.",
    });
};

export default orderConfirmationTemplate;
