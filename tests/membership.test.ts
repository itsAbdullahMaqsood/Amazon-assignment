import test from "node:test";
import assert from "node:assert/strict";

import { TRIAL_DAYS, isMember, membershipState, planById } from "@/lib/membership";

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);

test("no membership means no membership", () => {
    for (const value of [null, undefined, {}, { status: "trial" }]) {
        assert.equal(membershipState(value).active, false);
        assert.equal(isMember(value), false);
    }
});

test("a cancelled membership stops waiving delivery immediately", () => {
    const state = membershipState({ plan: "annual", status: "cancelled", startedAt: daysAgo(3) });

    assert.equal(state.active, false);
    assert.equal(isMember({ plan: "annual", status: "cancelled", startedAt: daysAgo(3) }), false);
});

test("the first 30 days are the trial", () => {
    const fresh = membershipState({ plan: "annual", status: "trial", startedAt: daysAgo(3) });

    assert.equal(fresh.active, true);
    assert.equal(fresh.inTrial, true);

    const older = membershipState({ plan: "annual", status: "trial", startedAt: daysAgo(TRIAL_DAYS + 1) });

    assert.equal(older.active, true, "it stays a membership after the trial");
    assert.equal(older.inTrial, false);
});

test("the renewal date is always in the future, however old the membership is", () => {
    // It is computed on read rather than stored, so it cannot go stale while
    // nothing is billing.
    const state = membershipState({ plan: "monthly", status: "active", startedAt: daysAgo(400) });

    assert.ok(new Date(state.renewsAt as string).getTime() > Date.now(), state.renewsAt as string);
});

test("an unknown plan falls back rather than throwing", () => {
    assert.equal(planById("nonsense").id, "monthly");
    assert.equal(membershipState({ plan: "nonsense", status: "trial", startedAt: daysAgo(1) }).plan?.id, "monthly");
});
