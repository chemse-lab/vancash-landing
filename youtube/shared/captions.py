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


def phrases(words, max_words=9, max_chars=46):
    out, cur = [], []
    for i, (txt, a, b) in enumerate(words):
        cur.append((txt, a, b))
        chars = sum(len(x[0]) + 1 for x in cur)
        nxt = words[i + 1][0] if i + 1 < len(words) else None
        at_punct = bool(PUNCT.search(txt))
        if nxt is None or (at_punct and len(cur) >= 3) or len(cur) >= max_words or \
                (nxt and chars + len(nxt) > max_chars and len(cur) >= 3):
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    # a dangling one- or two-word tail joins the phrase before it
    merged = []
    for p in out:
        if merged and len(p) <= 2 and not PUNCT.search(merged[-1][-1][0]):
            merged[-1] += p
        else:
            merged.append(p)
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
