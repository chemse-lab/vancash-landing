"""Arabic captions (SRT) and YouTube chapter times for an episode, from the voice-over edit the film uses.

    python3 shared/captions.py ep02      (from youtube/)

Reads  <ep>/vo_words.json      each section's words, section-relative seconds (Scribe)
       <ep>/vo_timeline.json   where each section's take sits in the film
       <ep>/audio/plan.json    "caption_replace": spoken -> written forms ("فان كاش" -> "VanCash", numbers),
                               "chapters": one title per section
Writes <ep>/publish/<ep>.ar.srt and prints the chapter list for youtube.md.

A cue is one spoken phrase: words are grouped up to punctuation, kept between ~3 and ~9 words.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path.cwd()
EP = sys.argv[1] if len(sys.argv) > 1 else sys.exit("usage: python3 shared/captions.py <ep>")
FILM = ROOT / EP
PUNCT = re.compile(r"[،.:؟!؛]$")
DEFAULT_REPLACE = {"فان كاش": "VanCash", "آي إم إي آي": "IMEI"}


def stamp(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def phrases(words, max_chars=50):
    """Clauses end at punctuation; a long clause is split evenly; a one- or two-word clause joins a neighbour."""
    clauses, cur = [], []
    for w in words:
        cur.append(w)
        if PUNCT.search(w[0]):
            clauses.append(cur)
            cur = []
    if cur:
        clauses.append(cur)
    size = lambda c: sum(len(x[0]) + 1 for x in c)
    split = []
    for c in clauses:
        n = -(-size(c) // max_chars)
        if n <= 1:
            split.append(c)
            continue
        k = -(-len(c) // n)
        split += [c[i:i + k] for i in range(0, len(c), k)]
    out = []
    for c in split:                       # a short clause joins the one before it if they fit together
        if out and (len(c) <= 2 or len(out[-1]) <= 2) and size(out[-1]) + size(c) <= max_chars:
            out[-1] = out[-1] + c
        else:
            out.append(c)
    merged = []
    for c in out:                         # a short one left over joins the one after it
        if merged and len(merged[-1]) <= 2 and size(merged[-1]) + size(c) <= max_chars + 6:
            merged[-1] = merged[-1] + c
        else:
            merged.append(c)
    return merged


def main():
    plan = json.loads((FILM / "audio" / "plan.json").read_text())
    repl = {**DEFAULT_REPLACE, **plan.get("caption_replace", {})}
    words = json.loads((FILM / "vo_words.json").read_text())
    tl = json.loads((FILM / "vo_timeline.json").read_text())
    shift = {s["id"]: s["shift"] for s in tl["sections"]}

    cues = []
    for sid in plan["sections"]:
        for p in phrases(words[sid]):
            line = " ".join(x[0] for x in p)
            for k in sorted(repl, key=len, reverse=True):
                line = line.replace(k, repl[k])
            cues.append((sid, p[0][1], p[-1][2], line))

    out, prev_end = [], 0.0
    for i, (sid, a, b, line) in enumerate(cues, 1):
        t0 = max(prev_end, shift[sid] + a - 0.05)
        t1 = shift[sid] + b + 0.25
        if i < len(cues):
            nsid, na, _, _ = cues[i]
            t1 = min(t1, shift[nsid] + na - 0.06)
        out.append(f"{i}\n{stamp(t0)} --> {stamp(t1)}\n{line}\n")
        prev_end = t1
    pub = FILM / "publish"
    pub.mkdir(exist_ok=True)
    (pub / f"{EP}.ar.srt").write_text("\n".join(out), encoding="utf-8")
    print(f"{len(cues)} cues -> {pub / (EP + '.ar.srt')}")

    titles = plan.get("chapters")
    if titles:
        print("\nchapters:")
        for k, s in enumerate(tl["sections"]):
            t = 0 if k == 0 else s["t"]              # the whip lands on the section's first beat
            print(f"{int(t // 60)}:{int(t % 60):02d} {titles[k]}")


if __name__ == "__main__":
    main()
