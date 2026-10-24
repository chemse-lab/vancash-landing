# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "soundfile"]
# ///
"""Cut a VO take into phrases and land each phrase's speech onset on a beat.

    uv run shared/place_vo.py <film>

Reads <film>/audio/vo_plan.json:
    {"take": "shared/vo/v1_takeB.mp3", "words": "shared/vo/v1_takeB.words.json",
     "phrases": [[n_words, beat], ...]}      # phrases in order, sized in words (audio tags skipped)
and <film>/beats.json. Writes <film>/audio/vo.wav (48 kHz stereo, film length) and
<film>/vo_words.json: [{w, t0, t1, p}] with times on the film clock, for the captions.
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
film = Path(sys.argv[1])
plan = json.loads((film / "audio/vo_plan.json").read_text())
grid = json.loads((film / "beats.json").read_text())
dur = float(json.loads((film / "film.json").read_text())["duration"])

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", plan["take"], "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                     capture_output=True, check=True).stdout
take = np.frombuffer(raw, dtype=np.float32)
words = [w for w in json.loads(Path(plan["words"]).read_text())["words"]
         if w.get("type", "word") == "word" and not w["text"].startswith("[")]

out = np.zeros(int(dur * SR) + SR, dtype=np.float32)
placed, i, prev_end = [], 0, -1.0
for p, (n, beat) in enumerate(plan["phrases"]):
    ws = words[i:i + n]
    i += n
    nxt = words[i]["start"] if i < len(words) else len(take) / SR
    a = max(0.0, ws[0]["start"] - 0.05)                     # keep the consonant attack
    b = min(nxt - 0.02, ws[-1]["end"] + 0.18)               # and the release, never the next phrase
    seg = take[int(a * SR):int(b * SR)].copy()
    fi, fo = int(0.008 * SR), int(0.06 * SR)
    seg[:fi] *= np.linspace(0, 1, fi)
    seg[-fo:] *= np.linspace(1, 0, fo)
    onset = grid["offset"] + beat * grid["period"]          # speech onset lands on the beat
    shift = onset - ws[0]["start"]
    s0 = int((a + shift) * SR)
    if a + shift < prev_end - 1e-3:
        print(f"WARNING phrase {p} overlaps the previous one by {prev_end - (a + shift):.2f}s")
    out[s0:s0 + len(seg)] += seg
    prev_end = b + shift
    for w in ws:
        placed.append({"w": w["text"], "t0": round(w["start"] + shift, 3), "t1": round(w["end"] + shift, 3), "p": p})
    print(f"phrase {p:2d} beat {beat:6.2f}  {onset:6.2f}-{prev_end:6.2f}s  {' '.join(w['text'] for w in ws)}")
if i != len(words):
    print(f"WARNING plan covers {i} of {len(words)} words")

out = out[:int(dur * SR)]
sf.write(film / "audio/vo.wav", np.stack([out, out], axis=1), SR, subtype="PCM_24")
(film / "vo_words.json").write_text(json.dumps(placed, ensure_ascii=False, indent=0))
print(f"-> {film}/audio/vo.wav, {film}/vo_words.json ({len(placed)} words, ends {prev_end:.2f}s)")
