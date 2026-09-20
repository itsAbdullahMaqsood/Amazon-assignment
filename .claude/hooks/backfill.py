#!/usr/bin/env python3
"""
Rebuild a session log from a Claude Code transcript.

Only needed for the bootstrap session, which started before the hooks
existed. Re-runnable: it regenerates the file from the transcript each time.
Same filter as the live hook -- prompts and final responses only.

Usage: backfill.py <transcript.jsonl> <repo-root>
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from capture import header, append_entry, log_path  # noqa: E402

SKIP_PREFIXES = ("<command-name>", "<local-command", "<command-message>",
                 "<bash-input>", "<bash-stdout>", "<user-memory-input>")


def text_of(msg):
    content = msg.get("content")
    if isinstance(content, str):
        return content
    out = []
    for b in content or []:
        if isinstance(b, dict) and b.get("type") == "text":
            out.append(b.get("text", ""))
    return "\n".join(o for o in out if o and o.strip())


def main():
    transcript, root = sys.argv[1], sys.argv[2]
    rows = []
    with open(transcript, encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    pass

    session_id = next((r.get("sessionId") for r in rows if r.get("sessionId")),
                      os.path.basename(transcript).replace(".jsonl", ""))
    turns = []  # [prompt, p_time, response, r_time, model]
    for r in rows:
        if r.get("isSidechain") or r.get("isMeta"):
            continue
        msg = r.get("message") or {}
        ts = r.get("timestamp") or ""
        if r.get("type") == "user":
            content = msg.get("content")
            if isinstance(content, list) and any(
                    isinstance(b, dict) and b.get("type") == "tool_result"
                    for b in content):
                continue  # tool result, not a prompt
            t = text_of(msg).strip()
            if not t or t.startswith(SKIP_PREFIXES):
                continue
            turns.append([t, ts, None, None, "unknown"])
        elif r.get("type") == "assistant" and turns:
            t = text_of(msg).strip()
            if t:
                turns[-1][2] = t          # last one wins = final response
                turns[-1][3] = ts
                turns[-1][4] = msg.get("model") or "unknown"

    path = log_path(root, session_id)
    st = {"num": len(turns),
          "first": turns[0][1] if turns else "",
          "last": turns[-1][1] if turns else "",
          "model": turns[-1][4] if turns else "unknown"}
    project = os.path.basename(os.path.abspath(root))
    with open(path, "w", encoding="utf-8") as f:
        f.write(header(session_id, project, st))
    for i, (prompt, pt, resp, rt, model) in enumerate(turns, 1):
        append_entry(path, "PROMPT", i, session_id, pt, model, prompt)
        if resp:
            append_entry(path, "RESPONSE", i, session_id, rt, model, resp)
    print("%s  (%d turns)" % (path, len(turns)))


if __name__ == "__main__":
    main()
