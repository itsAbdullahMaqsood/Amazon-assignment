import connectDb from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Video from "@/models/Video";
import Medication from "@/models/Medication";
import { escapeRegex } from "@/utils/regex";
import { money } from "@/components/ui/Price";
import { statusLabel } from "@/lib/orderQueries";
import { membershipState } from "@/lib/membership";
import { toTitle } from "@/lib/movieQueries";
import { dueLabel, weeksLabel } from "@/lib/autoReorder";
import { hasPlusDelivery } from "@/lib/plusAccess";

const on = (value: any) =>
    value ? new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";

// Markaz Movies, searched the way the shopper asks for a film: by its title, by
// a genre, or by nothing at all when they just want something to watch.
export const searchTitles = async ({ keywords = [], maxPrice = 0 }: any, exclude: string[] = []) => {
    await connectDb();

    const terms = (keywords || [])
        .map((keyword: string) => String(keyword).trim())
        .filter((keyword: string) => keyword.length > 2)
        .slice(0, 3);

    // A title already shown higher up the answer is not shown again.
    const clause: any = exclude.length ? { _id: { $nin: exclude } } : {};

    if (terms.length) {
        clause.$or = terms.flatMap((term: string) => {
            const pattern = { $regex: escapeRegex(term), $options: "i" };

            return [{ title: pattern }, { genres: pattern }];
        });
    }

    // A budget means "something I can actually buy for that", so it filters on
    // titles Markaz sells rather than on the whole catalogue.
    if (maxPrice > 0) {
        clause.price = { $gt: 0, $lte: maxPrice };
    }

    const videos: any[] = await Video.find(clause).sort({ popularity: -1 }).limit(3).lean();

    return videos.map(toTitle);
};

// The pharmacy look-up, by brand name, generic name or active substance.
export const searchLabels = async ({ keywords = [] }: any, exclude: string[] = []) => {
    const term = (keywords || []).map((keyword: string) => String(keyword).trim()).filter(Boolean).join(" ").slice(0, 60);

    if (term.length < 2) {
        return [];
    }

    await connectDb();

    const pattern = { $regex: escapeRegex(term), $options: "i" };
    const medications: any[] = await Medication.find({
        ...(exclude.length && { _id: { $nin: exclude } }),
        $or: [{ brandName: pattern }, { genericName: pattern }, { substance: pattern }],
    })
        .sort({ brandName: 1 })
        .limit(3)
        .lean();

    return medications.map((medication) => ({
        _id: String(medication._id),
        brandName: medication.brandName,
        genericName: medication.genericName || "",
        dosageForm: medication.dosageForm || "",
        price: medication.price || 0,
        plusPrice: medication.primePrice || 0,
    }));
};

// What Shabana is allowed to know about the person she is talking to: enough to
// answer "where is my order" and "am I a member" from fact rather than from a
// guess, and nothing more. No address, no email, no phone number, no payment
// detail. The panel and the privacy page both say this is sent.
export const getAccountContext = async (userId: string) => {
    await connectDb();

    const [user, orders]: any[] = await Promise.all([
        User.findById(userId)
            .select("name email membership giftCardBalance whishlist lists watchlist library autoReorder")
            .populate({ path: "autoReorder.product", model: "Product", select: "name" })
            .lean(),
        Order.find({ user: userId })
            .select("products total status isPaid paymentMethod createdAt paidAt deliveredAt returnRequests")
            .sort({ createdAt: -1 })
            .limit(4)
            .lean(),
    ]);

    if (!user) {
        return "";
    }

    const plus = await hasPlusDelivery(user);
    const membership = membershipState(user.membership);
    const live = (user.library || []).filter((entry: any) => entry.type === "rent" && new Date(entry.expiresAt) > new Date());

    const lines = [
        `Their first name: ${String(user.name || "").split(" ")[0]}`,
        membership.active
            ? `Markaz Plus: ${membership.inTrial ? `free trial until ${on(membership.trialEndsAt)}` : `member on the ${membership.plan.name.toLowerCase()} plan, next due ${on(membership.renewsAt)}`}. Delivery charges are waived.`
            : plus.plus
              ? `Markaz Plus: not their own membership, but ${plus.through} shares one with them, so their delivery charges are waived.`
              : "Markaz Plus: not a member, so delivery is charged per item.",
        `Markaz gift card balance: ${money(user.giftCardBalance || 0)}`,
        `Saved items: ${(user.whishlist || []).length}. Named lists: ${(user.lists || []).length}. Films on My list: ${(user.watchlist || []).length}.`,
    ];

    if (orders.length) {
        lines.push("Their most recent orders, newest first:");

        for (const order of orders) {
            const state = statusLabel(order);
            const items = (order.products || []).reduce((sum: number, line: any) => sum + (line.qty || 0), 0);
            const first = order.products?.[0]?.name || "an item";
            const returns = (order.returnRequests || []).length;

            lines.push(
                `- Order #${String(order._id).slice(-8).toUpperCase()}: ${state.label}, placed ${on(order.createdAt)}, ${items} item${items === 1 ? "" : "s"} including "${first}", ${money(order.total)}${
                    order.deliveredAt ? `, delivered ${on(order.deliveredAt)}` : ""
                }${returns ? `, ${returns} return request${returns === 1 ? "" : "s"} on it` : ""}. Its page is /order/${order._id}`
            );
        }
    } else {
        lines.push("They have not placed an order yet.");
    }

    if (live.length) {
        lines.push(`Rentals still running: ${live.length}, the next ending ${on(live[0].expiresAt)}.`);
    }

    for (const repeat of (user.autoReorder || []).slice(0, 3)) {
        lines.push(`Auto-reorder: "${repeat.product?.name || "an item"}" ${weeksLabel(repeat.everyWeeks).toLowerCase()}, ${dueLabel(repeat.nextAt).toLowerCase()}.`);
    }

    return lines.join("\n");
};
