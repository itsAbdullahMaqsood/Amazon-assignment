# Capture Test

Proof that prompt/response capture is installed, automatic, and works in sessions
other than the one that created it.

## Tool and model

| | |
|---|---|
| Tool | Claude Code (CLI + VS Code extension), v2.1.109 |
| Model (planning + execution) | `claude-opus-5[1m]` — Opus 5, 1M context. One model does both; there is no separate planner/executor split. |
| Canary sessions | `claude-sonnet-4-6` (see note below) |

Note on the canary model: the canaries were run as separate non-interactive
sessions via `claude -p`. The first attempt inherited the 1M-context model and
died with `Usage credits are required for long context requests`, so the canary
sessions were re-run with `--model sonnet`. The model name is recorded per entry,
so this switch is visible in the logs rather than hidden. Build work continues on
`claude-opus-5[1m]`.

## Mechanism

Claude Code has a hooks system — shell commands the CLI runs itself on lifecycle
events. Nothing is manual and nothing depends on the model choosing to log.

Config file changed: **`.claude/settings.json`**

| Event | Fires | Command |
|---|---|---|
| `UserPromptSubmit` | every time a prompt is submitted | `python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/capture.py" prompt` |
| `Stop` | end of every turn | `python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/capture.py" response` |

Both hooks receive a JSON payload on stdin. `UserPromptSubmit` carries the
verbatim `prompt`; `Stop` carries `transcript_path`, the session's JSONL
transcript, from which the script extracts the turn's final assistant message.

Scripts:

- [.claude/hooks/capture.py](.claude/hooks/capture.py) — the hook itself
- [.claude/hooks/backfill.py](.claude/hooks/backfill.py) — one-off reconstruction of
  the bootstrap session (see "Known gap")

### What gets filtered out

The `Stop` hook walks the transcript backwards and takes only the **last assistant
message containing text**. Dropped: `thinking` blocks, `tool_use` blocks,
`tool_result` messages, interim progress messages written between tool calls, and
any message with `isSidechain: true` (subagent output).

## Log location

`.agent-logs/`, one file per session, `YYYY-MM-DD_HH-MM-SS_<session-id>.md`.

The canaries landed in:

- `.agent-logs/2026-09-20_11-41-55_056cbfd7-93dd-4f29-bdcb-eb0c2e225e85.md`
- `.agent-logs/2026-09-20_11-42-09_82058e42-df3a-4487-b99a-7bd3cb46ff4f.md`

`.agent-logs/` is **not** gitignored. `.gitignore` excludes only
`.claude/.capture-state/`, which holds per-session turn counters, not log content.

## Canary 1 — session `056cbfd7`, raw

```
[LOG_ENTRY type=PROMPT num=1 session=056cbfd7]
timestamp: 2026-09-20T11:41:55.421Z
model: claude-sonnet-4-6

CAPTURE TEST — 8x assignment, Abdullah Maqsood


[LOG_ENTRY type=RESPONSE num=1 session=056cbfd7]
timestamp: 2026-09-20T11:42:02.049Z
model: claude-sonnet-4-6

Memory already has context. "8x assignment" logged. Profile up to date.

What do you need built?
```

## Canary 2 — session `82058e42`, raw

A different session id, started after the first exited. This is the check that the
hook is installed in the repo rather than in one session.

```
[LOG_ENTRY type=PROMPT num=1 session=82058e42]
timestamp: 2026-09-20T11:42:09.491Z
model: claude-sonnet-4-6

CAPTURE TEST — second session, 8x assignment, Abdullah Maqsood


[LOG_ENTRY type=RESPONSE num=1 session=82058e42]
timestamp: 2026-09-20T11:42:15.182Z
model: claude-sonnet-4-6

Memory intact. Second session confirmed.

Profile already captured. Want me to update the "8x assignment" note with more detail — or is this purely a memory persistence test?
```

## What did not work first time

**1. `SubagentStop` was wired to the response hook, then removed.**
It looked like free extra coverage. It is not: it fires mid-turn when a subagent
finishes, so it would have written a subagent's last message as that turn's "final
response" and then the deduplication check would have blocked the *real* `Stop`
capture. Removed before the first canary.

**2. Turn numbers were derived by parsing the log file back. This was corruptible.**
The first version counted existing `[LOG_ENTRY type=PROMPT num=` markers in the
log to work out the next turn number. The assignment brief itself contains example
`LOG_ENTRY` blocks — so capturing it verbatim wrote those markers into the log, and
the next turn counted them as real entries.

Anchoring the regex to line-start was tried and was **not** sufficient: a pasted
example sits at line-start too. Reproduced with a prompt containing an unindented
fake entry, and the numbering went `PROMPT num=1` → `RESPONSE num=2` → `PROMPT num=3`.

Fixed by not parsing the log at all. Turn counters live in a sidecar state file at
`.claude/.capture-state/<session-id>.json`, and the `model: pending` placeholder in
a prompt entry is patched by recorded byte offset rather than by search-and-replace,
so text inside a verbatim prompt can never be mistaken for an entry header. The
adversarial prompt is now stored verbatim, fake entry and all, with correct numbering.

**3. First canary attempt returned an API error, not a response.**
`claude -p` inherited the 1M-context model and failed with
`Usage credits are required for long context requests`. The prompt hook had already
fired, so `.agent-logs/2026-09-20_11-36-59_684f5083-...md` contains a prompt with no
response. That file is left in place — it is an honest record of a failed turn, and
it also demonstrates that prompt capture is independent of whether the response
succeeds.

Sessions `ff625977` and `71e941bf` are earlier canaries run against the pre-fix
version of the script. Also left in place. `71e941bf` is a two-turn session and
shows entry numbering incrementing within a single session file.

## Known gap

This bootstrap session (`3d656697`) started **before** `.claude/settings.json`
existed. Claude Code loads hooks at session start, so no hook fired for it. Its log
was reconstructed from the session transcript with `backfill.py`, using the same
prompt/final-response filter, and it may be missing the final turn or two of that
session. Every session from here on is captured live by the hooks.
