import test from "node:test";
import assert from "node:assert/strict";

import { decodePreferences, defaultPreferences, encodePreferences } from "@/lib/preferences";
import { memberIssue } from "@/lib/household";
import { WEEK_OPTIONS, dueLabel, nextDueDate, weeksLabel } from "@/lib/autoReorder";
import { isShareable, validateName } from "@/lib/lists";

test("preferences survive a round trip through the cookie", () => {
    const values = { useBrowsingHistory: false, reduceMotion: true, largerText: true };

    assert.deepEqual(decodePreferences(encodePreferences(values)), values);
});

test("a missing or damaged cookie falls back to the defaults", () => {
    assert.deepEqual(decodePreferences(""), defaultPreferences);
    assert.deepEqual(decodePreferences(undefined), defaultPreferences);
    assert.deepEqual(decodePreferences("nonsense"), defaultPreferences);
});

test("a half-written cookie keeps the defaults for what it does not say", () => {
    assert.deepEqual(decodePreferences("m1"), { ...defaultPreferences, reduceMotion: true });
});

test("a household member needs a name and a real-looking email", () => {
    assert.match(memberIssue("", "sara@markaz.shop"), /name/);
    assert.match(memberIssue("Sara", "not-an-email"), /email address/);
    assert.equal(memberIssue("Sara", "sara@markaz.shop"), "");
});

test("you cannot put yourself, or the same person twice, in your household", () => {
    assert.match(memberIssue("Me", "me@markaz.shop", [], "ME@markaz.shop"), /your own email/);
    assert.match(memberIssue("Sara", "SARA@markaz.shop", ["sara@markaz.shop"]), /already/);
});

test("auto-reorder only offers intervals it can label", () => {
    for (const option of WEEK_OPTIONS) {
        assert.equal(weeksLabel(option.value), option.label);
    }
});

test("the next due date is the interval away, in whole weeks", () => {
    const from = new Date("2026-01-01T00:00:00Z");

    assert.equal(nextDueDate(from, 4).toISOString().slice(0, 10), "2026-01-29");
});

test("a due date reads as a countdown, and says when it has passed", () => {
    assert.match(dueLabel(new Date(Date.now() + 3 * 86400000)), /in 3 days/);
    assert.match(dueLabel(new Date(Date.now() - 2 * 86400000)), /2 days ago/);
});

test("a list name has to be usable and unique", () => {
    assert.match(validateName(""), /Enter a name/);
    assert.match(validateName("x".repeat(60)), /50 characters/);
    assert.match(validateName("Kitchen", ["kitchen"]), /already have a list/);
    assert.equal(validateName("Kitchen", ["Bedroom"]), "");
});

test("only a shared or public list has a link worth giving out", () => {
    assert.equal(isShareable("private"), false);
    assert.equal(isShareable("shared"), true);
    assert.equal(isShareable("public"), true);
});
