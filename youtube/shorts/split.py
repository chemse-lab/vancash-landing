# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "soundfile"]
# ///
"""Cut one narration take into the video's sections.

    uv run shorts/split.py tt01

Each TikTok is voiced in a single ElevenLabs take (one even read, ~60 s) instead of one take per
section. This finds where each section of shorts/scripts.json starts and ends in the Scribe word
timings, cuts the take halfway through the pause between sections, and writes what
shared/score.py expects:

    <film>/audio/takes/full.wav + full_words.json      (input: the take and its Scribe timings)
    <film>/audio/takes/sNN_a.wav + sNN_words.json      (output: one clip per section, words relative to it)
"""
import difflib
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

Y = Path(__file__).resolve().parent.parent
film = sys.argv[1]
TAKES = Y / film / "audio" / "takes"
SCRIPTS = json.loads((Y / "shorts" / "scripts.json").read_text())
video = next(v for v in SCRIPTS["videos"] if v["id"] == film)
sections = [(sid, SCRIPTS["cta"] if txt == "CTA" else txt) for sid, txt in video["sections"]]


def norm(s):
    s = re.sub(r"[ً-ْٰـ]", "", s)          # tashkeel and tatweel
    s = re.sub(r"[،,.:؛؟?!«»\"()]", "", s)
    return s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ى", "ي").replace("ة", "ه").strip()


# prompt tokens, each tagged with its section
ptoks, psec = [], []
for i, (_, txt) in enumerate(sections):
    for t in txt.split():
        if norm(t):
            ptoks.append(norm(t)); psec.append(i)

words = [w for w in json.loads((TAKES / "full_words.json").read_text())["words"] if w.get("type", "word") == "word"]
stoks = [norm(w["text"]) for w in words]

# map each prompt token to a Scribe word where the two sequences agree
sm = difflib.SequenceMatcher(a=ptoks, b=stoks, autojunk=False)
p2s = {}
for a, b, n in sm.get_matching_blocks():
    for k in range(n):
        p2s[a + k] = b + k
ratio = sum(n for _, _, n in sm.get_matching_blocks()) / max(len(ptoks), 1)

# first and last Scribe word of each section; a section's words are everything up to the next one's first word
first = []
for i in range(len(sections)):
    idx = [p2s[k] for k in range(len(ptoks)) if psec[k] == i and k in p2s]
    if not idx:
        sys.exit(f"{film}: section {sections[i][0]} not found in the take")
    first.append(min(idx))
bounds = [(first[i], (first[i + 1] - 1) if i + 1 < len(first) else len(words) - 1) for i in range(len(first))]

y, sr = sf.read(TAKES / "full.wav")
dur = len(y) / sr


def quietest(a, b, hop=0.005, win=0.012):
    """The quietest moment between a and b (s): the pause between two sentences can be under 0.1 s."""
    a, b = max(0.0, a), min(dur, b)
    best, best_t = None, (a + b) / 2
    t = a
    while t <= b:
        seg = y[int(t * sr): int((t + win) * sr)]
        e = float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 1.0
        if best is None or e < best:
            best, best_t = e, t + win / 2
        t += hop
    return best_t


cuts = [max(0.0, words[bounds[0][0]]["start"] - 0.15)]
for i in range(len(bounds) - 1):
    e, s = words[bounds[i][1]]["end"], words[bounds[i + 1][0]]["start"]
    cuts.append(quietest(min(e, s) - 0.02, max(e, s) + 0.05))   # never well inside the last word
cuts.append(min(dur, words[bounds[-1][1]]["end"] + 0.45))

fade = int(0.012 * sr)
print(f"{film}: {len(words)} Scribe words, {len(ptoks)} script words, match {ratio:.0%}, take {dur:.2f} s")
for i, (sid, _) in enumerate(sections):
    a, b = int(cuts[i] * sr), int(cuts[i + 1] * sr)
    clip = y[a:b].copy()
    clip[:fade] *= np.linspace(0, 1, fade)
    clip[-fade:] *= np.linspace(1, 0, fade)
    sf.write(TAKES / f"{sid}_a.wav", clip, sr)
    ws = [dict(w, start=round(w["start"] - cuts[i], 3), end=round(w["end"] - cuts[i], 3))
          for w in words[bounds[i][0]: bounds[i][1] + 1]]
    (TAKES / f"{sid}_words.json").write_text(json.dumps({"words": ws}, ensure_ascii=False))
    gap = words[bounds[i + 1][0]]["start"] - words[bounds[i][1]]["end"] if i + 1 < len(bounds) else 0
    print(f"  {sid}  {len(ws):3d} words  {cuts[i]:6.2f}-{cuts[i + 1]:6.2f}  ({cuts[i + 1] - cuts[i]:5.2f} s)"
          f"  pause after {gap:4.2f} s  | {' '.join(w['text'] for w in ws[:4])} …")
