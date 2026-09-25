import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { firstRenewal, membershipState, planById, plans } from "@/lib/membership";

// POST { plan }  — join, which always starts with the trial.
// DELETE         — cancel, which takes effect immediately.
//
// The membership is what decides whether checkout waives delivery, so it is
// only ever written here, and every date on it is computed on the server.
export const POST = async (req: Request) => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        const { plan } = await req.json();

        if (!plans.some((entry) => entry.id === plan)) {
            return NextResponse.json({ message: "Unknown plan." }, { status: 400 });
        }

        await connectDb();

        const user: any = await User.findById(session.user.id).select("membership");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const current = membershipState(user.membership);

        // Already a member: this is a plan change, and it keeps the start date
        // rather than handing out a second trial.
        if (current.active) {
            user.membership.plan = plan;
            await user.save();

            return NextResponse.json({
                membership: membershipState(user.membership),
                message: `Your plan is now ${planById(plan).name.toLowerCase()}.`,
            });
        }

        const startedAt = new Date();

        user.membership = {
            plan,
            status: "trial",
            startedAt,
            trialEndsAt: firstRenewal(startedAt),
            renewsAt: firstRenewal(startedAt),
            cancelledAt: undefined,
        };

        await user.save();

        return NextResponse.json({
            membership: membershipState(user.membership),
            message: "You're a Markaz Plus member. Delivery charges are waived from your next order.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const DELETE = async () => {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Not signed in" }, { status: 401 });
        }

        await connectDb();

        const user: any = await User.findById(session.user.id).select("membership");

        if (!user?.membership?.startedAt) {
            return NextResponse.json({ message: "There is no membership to cancel." }, { status: 400 });
        }

        user.membership.status = "cancelled";
        user.membership.cancelledAt = new Date();
        await user.save();

        return NextResponse.json({
            membership: membershipState(user.membership),
            message: "Your membership has ended. Delivery is charged per item again.",
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
