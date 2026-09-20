#!/usr/bin/env python3
"""
8x assignment capture hook.

Two modes:
  prompt   -- wired to UserPromptSubmit. Appends the verbatim user prompt.
  response -- wired to Stop. Extracts the FINAL assistant text message of the
              turn from the session transcript and appends it.

Only prompts and final responses are logged. Thinking blocks, tool calls,
tool results, intermediate progress messages and subagent output are dropped.

Turn numbers and frontmatter come from a sidecar state file, never from
re-parsing the log. A verbatim prompt can legitimately contain text that looks
exactly like a LOG_ENTRY header (the assignment brief does), and parsing the
log back would let a pasted example corrupt the real numbering.
"""

import json
import os
import sys
import glob
from datetime import datetime, timezone

AUTHOR = "itsabdullahmaqsood"
TOOL = "claude-code"


def now_iso():
    t = datetime.now(timezone.utc)
    return t.strftime("%Y-%m-%dT%H:%M:%S.") + "%03dZ" % (t.microsecond // 1000)


def state_path(cwd, session_id):
    d = os.path.join(cwd, ".claude", ".capture-state")
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, "%s.json" % session_id)


def load_state(cwd, session_id):
    p = state_path(cwd, session_id)
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except Exception:
            pass
    return {"num": 0, "resp_done": 0, "first": None, "last": None,
            "model": "unknown", "path": None}


def save_state(cwd, session_id, st):
    p = state_path(cwd, session_id)
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(st, f, indent=2)
    os.replace(tmp, p)


def log_path(cwd, session_id, st=None):
    if st and st.get("path") and os.path.exists(st["path"]):
        return st["path"]
    d = os.path.join(cwd, ".agent-logs")
    os.makedirs(d, exist_ok=True)
    hits = sorted(glob.glob(os.path.join(d, "*_%s.md" % session_id)))
    if hits:
        return hits[0]
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    return os.path.join(d, "%s_%s.md" % (stamp, session_id))


def header(session_id, project, st):
    first = st.get("first") or now_iso()
    return (
        "---\n"
        "session_id: %s\n"
        "date: %s\n"
        "author: %s\n"
        "model: %s\n"
        "tool: %s\n"
        "project: %s\n"
        "total_exchanges: %d\n"
        "first_prompt_time: %s\n"
        "last_prompt_time: %s\n"
        "---\n\n"
        "# Session Log - %s\n\n"
        "Session: `%s` | Project: `%s` | Author: `%s`\n\n"
        "---\n\n"
    ) % (session_id, first[:10], AUTHOR, st.get("model", "unknown"), TOOL,
         project, st.get("num", 0), first, st.get("last") or first,
         first[:10], session_id[:8], project, AUTHOR)


def rewrite_header(path, session_id, project, st):
    """Replace the frontmatter block in place. Entries are never touched.

    The header changes length as the turn count grows, so any recorded byte
    offset into the file is shifted by the same delta.
    """
    raw = open(path, "rb").read() if os.path.exists(path) else b""
    marker = b"\n---\n\n"
    end = raw.find(marker, raw.find(marker) + 1)  # end of the header block
    old_len = end + len(marker) if end != -1 else 0
    body = raw[old_len:]
    new_head = header(session_id, project, st).encode("utf-8")
    tmp = path + ".tmp"
    open(tmp, "wb").write(new_head + body)
    os.replace(tmp, path)
    if st.get("pending_offset") is not None:
        st["pending_offset"] += len(new_head) - old_len


def append_entry(path, kind, num, session_id, ts, model, text):
    """Append an entry. Returns the byte offset of its model value."""
    head = "[LOG_ENTRY type=%s num=%d session=%s]\ntimestamp: %s\nmodel: " % (
        kind, num, session_id[:8], ts)
    blob = (head + model + "\n\n" + text + "\n\n\n").encode("utf-8")
    with open(path, "ab") as f:
        off = f.tell() + len(head.encode("utf-8"))
        f.write(blob)
    return off


def patch_model(path, offset, model):
    """Replace the 'pending' placeholder at a known byte offset.

    Offset-based on purpose: a search-and-replace could match text inside a
    verbatim prompt instead of the real entry header.
    """
    raw = open(path, "rb").read()
    if raw[offset:offset + 7] != b"pending":
        return
    out = raw[:offset] + model.encode("utf-8") + raw[offset + 7:]
    tmp = path + ".tmp"
    open(tmp, "wb").write(out)
    os.replace(tmp, path)


def last_assistant(transcript_path):
    """(text, model) of the final assistant text message in the transcript."""
    if not transcript_path or not os.path.exists(transcript_path):
        return None, None
    rows = []
    with open(transcript_path, encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    for row in reversed(rows):
        if row.get("type") != "assistant" or row.get("isSidechain"):
            continue
        msg = row.get("message") or {}
        content = msg.get("content")
        if isinstance(content, str):
            chunks = [content]
        else:
            chunks = [b.get("text", "") for b in (content or [])
                      if isinstance(b, dict) and b.get("type") == "text"]
        text = "\n".join(c for c in chunks if c and c.strip()).strip()
        if text:
            return text, msg.get("model") or "unknown"
    return None, None


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0
    mode = sys.argv[1] if len(sys.argv) > 1 else "prompt"
    session_id = payload.get("session_id") or "unknown-session"
    cwd = payload.get("cwd") or os.getcwd()
    project = os.path.basename(os.path.abspath(cwd))
    st = load_state(cwd, session_id)
    path = log_path(cwd, session_id, st)
    st["path"] = path
    fresh = not os.path.exists(path)

    if mode == "prompt":
        prompt = payload.get("prompt")
        if prompt is None:
            return 0
        ts = now_iso()
        st["num"] += 1
        st["last"] = ts
        if not st["first"]:
            st["first"] = ts
        if fresh:
            open(path, "w", encoding="utf-8").write(
                header(session_id, project, st))
        st["pending_offset"] = append_entry(
            path, "PROMPT", st["num"], session_id, ts, "pending", prompt)
    else:
        num = st["num"]
        if num == 0 or st.get("resp_done", 0) >= num:
            return 0
        text, model = last_assistant(payload.get("transcript_path"))
        if not text:
            return 0
        st["resp_done"] = num
        st["model"] = model
        off = st.get("pending_offset")
        if off is not None:
            patch_model(path, off, model)
            st["pending_offset"] = None
        append_entry(path, "RESPONSE", num, session_id, now_iso(), model, text)

    rewrite_header(path, session_id, project, st)
    save_state(cwd, session_id, st)
    return 0


if __name__ == "__main__":
    sys.exit(main())
