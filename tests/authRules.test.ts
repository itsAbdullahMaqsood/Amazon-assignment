import test from "node:test";
import assert from "node:assert/strict";

import { emailQuery, normaliseEmail, passwordIssue, passwordRules } from "@/lib/authRules";

// One module decides what a password is, and both the form and the route that
// sets one call it. These tests are the reason they cannot drift apart again:
// the change-password route used to demand 6 characters while sign-up demanded
// 8 plus a letter and a number.

test("a password needs length, a letter and a number", () => {
    assert.match(passwordIssue("short1"), /at least 8/);
    assert.match(passwordIssue("12345678"), /a letter/);
    assert.match(passwordIssue("abcdefgh"), /a number/);
    assert.equal(passwordIssue("abcdefg1"), "");
});

test("the checklist on screen and the rule on the server are the same rule", () => {
    const password = "abcdefg1";

    assert.equal(
        passwordRules.every((rule) => rule.test(password)),
        passwordIssue(password) === ""
    );
});

test("a very long password is refused rather than silently truncated by bcrypt", () => {
    assert.match(passwordIssue(`${"a".repeat(72)}1`), /72 characters or fewer/);
});

test("emails are matched without case mattering", () => {
    assert.equal(normaliseEmail("  Me@Example.COM "), "me@example.com");
});

test("a regex metacharacter in an email cannot change the query", () => {
    const query: any = emailQuery("a.b+c@x.com");

    assert.ok(query.email.$regex.includes("\\."), query.email.$regex);
    assert.ok(query.email.$regex.includes("\\+"), query.email.$regex);
    assert.equal(query.email.$options, "i");
});
