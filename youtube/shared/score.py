# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""VanCash ERP · episodes 2-6: the lo-fi bed and the voice-over edit, on one grid.

    MOTION_REEL_SKILL=<skill> uv run shared/score.py ep02        (from youtube/)

Reads  <ep>/audio/plan.json   {"seed", "sections", "gap_before": {sid: s}}
       <ep>/audio/takes/sNN_a.wav + sNN_words.json (one ElevenLabs take per section, Scribe timings)
Writes <ep>/audio/music.wav, <ep>/audio/vo.wav, <ep>/beats.json, <ep>/vo_timeline.json,
       <ep>/vo_words.json (each section's words, section-relative seconds, for the film and captions)
       and the film's duration in <ep>/film.json.

The same bed as episode 1 (ep01/audio/score.py) so the series sounds like one show; the seed and the
order of the gap licks change per episode.

88 BPM, 4/4, D major. Each section's speech onset lands on an even beat (a half bar) at least
GAP seconds after the previous section ends; the film keys every shot to these onsets.
Lo-fi: FM keys on IVmaj7 - iii7 - ii7 - V7, swung hats, a soft boom-bap kit from the series
title on, vinyl dust throughout, a three-note answer in the longer gaps, a resolve under the end card.
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal


def _skill_dir():
    if os.environ.get("MOTION_REEL_SKILL"):
        return Path(os.environ["MOTION_REEL_SKILL"])
    found = sorted((Path.home() / ".claude/plugins").glob("**/skills/motion-reel/scripts/dsp.py"))
    if found:
        return found[-1].parent.parent
    sys.exit("set MOTION_REEL_SKILL to the folder that holds the motion-reel SKILL.md")


sys.path.insert(0, str(_skill_dir() / "scripts"))
from dsp import *  # noqa: E402,F403
import dsp  # noqa: E402  (dsp.rng is rebound by seed(); read it through the module)

if len(sys.argv) < 2:
    sys.exit("usage: uv run shared/score.py <episode dir, e.g. ep02>")
FILM = (Path.cwd() / sys.argv[1]).resolve()
HERE = FILM / "audio"
PLAN = json.loads((HERE / "plan.json").read_text())
BPM = 88
BEAT = 60 / BPM
seed(PLAN["seed"])

SECTIONS = PLAN["sections"]
FIRST_BEAT = 1          # the hook's voice starts one beat in; frame 0 is already a shot
GAP = PLAN.get("gap", 0.85)   # minimum silence between sections (s)
GAP_BEFORE = PLAN["gap_before"]
END_CARD_BEATS = 10     # music after the last word: the end card holds >= 5 s
LICK_ROT = PLAN.get("lick_rotate", 0)


def T(b):
    return b * BEAT


def speech_bounds(y, thresh_db=-34):
    hop = int(SR * 0.005)
    n = len(y) // hop
    rms = np.sqrt(np.mean(y[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms / rms.max())
    loud = np.nonzero(db > thresh_db)[0]
    return loud[0] * 0.005, (loud[-1] + 1) * 0.005


def compress(x, thresh_db=-24, ratio=2.6, attack=0.005, release=0.09, makeup_db=3):
    e = env_follow(x, attack, release)
    over = np.maximum(20 * np.log10(e + 1e-9) - thresh_db, 0)
    return x * 10 ** ((-over * (1 - 1 / ratio) + makeup_db) / 20)


def vo_chain(x):
    x = filt(x, "highpass", 80, 2)
    x = peq(x, 250, -2.0, 1.0)
    x = peq(x, 3000, 2.5, 0.9)
    x = peq(x, 9000, 1.5, 0.7)
    return compress(x)


def build_vo():
    """Place each take so its speech onset lands on an even beat; return the edit plan."""
    plan, beat = [], FIRST_BEAT
    prev_end = None
    for sid in SECTIONS:
        y, sr = sf.read(HERE / "takes" / f"{sid}_a.wav")
        assert sr == SR, f"{sid}: expected {SR} Hz"
        on, off = speech_bounds(y)
        if prev_end is not None:
            need = prev_end + GAP_BEFORE.get(sid, GAP)
            beat = int(np.ceil(need / BEAT / 2 - 1e-9)) * 2
        shift = T(beat) - on
        plan.append({"id": sid, "beat": beat, "t": round(T(beat), 4), "shift": round(shift, 4),
                     "end": round(off + shift, 4), "y": y, "on": on, "off": off})
        prev_end = off + shift
    return plan


def main():
    plan = build_vo()
    last_word = plan[-1]["end"]
    end_beat = int(np.ceil(last_word / BEAT / 4 + 1e-9)) * 4          # the bar after the last word
    total_beats = end_beat + END_CARD_BEATS
    total_beats = int(np.ceil(total_beats / 4)) * 4
    DUR = round(T(total_beats), 4)
    N = int(SR * DUR)

    print(f"{BPM} bpm, {total_beats} beats = {DUR:.2f} s ({int(DUR // 60)}:{DUR % 60:05.2f})")
    print("VO edit:")
    for a, b in zip(plan, plan[1:] + [None]):
        gap = (b["t"] - a["end"]) if b else DUR - a["end"]
        print(f"  {a['id']}  beat {a['beat']:4d}  {a['t']:7.2f} - {a['end']:7.2f}  gap {gap:5.2f} s")

    # ---------------------------------------------------------------- voice
    vo = np.zeros(N + SR)
    for p in plan:
        y = p["y"].copy()
        fi = int(0.004 * SR)
        y[:fi] *= np.linspace(0, 1, fi)
        y[-fi:] *= np.linspace(1, 0, fi)
        s = int(round(p["shift"] * SR))
        if s < 0:
            y, s = y[-s:], 0
        vo[s:s + len(y)] += y
    vo = vo_chain(vo[:N])
    vo = vo / (np.abs(vo).max() + 1e-9) * 0.7
    sf.write(HERE / "vo.wav", np.stack([vo, vo]).T, SR, subtype="PCM_24")

    # ---------------------------------------------------------------- the bed
    drums, bass, music, fx, dust = (Bus(DUR, BPM) for _ in range(5))
    # D major: IVmaj7 - iii7 - ii7 - V7, one chord per bar
    prog = [(["G3", "B3", "D4", "F#4"], "G1"), (["F#3", "A3", "C#4", "E4"], "F#1"),
            (["E3", "G3", "B3", "D4"], "E1"), (["A3", "C#4", "E4", "G4"], "A1")]
    groove_from = plan[1]["beat"] - 4                  # the kit enters a bar before the series title
    groove_to = end_beat
    swing = 0.09

    for bar in range(total_beats // 4):
        b0 = bar * 4
        notes, root = prog[bar % 4]
        if b0 < groove_to:
            music.add(keys(notes, T(4) + 0.3), b0, 0.42, pan=-0.08)
            music.add(keys(notes[1:], T(1.5)), b0 + 2.5, 0.16, pan=0.12)
        if groove_from <= b0 < groove_to:
            for pos, g in ((0, 0.8), (2.5, 0.55)):
                drums.add(kick(soft=True), b0 + pos, g)
            for pos in (1, 3):
                drums.add(clap(tight=True), b0 + pos, 0.16, pan=0.06)
            for k in range(8):
                pos = k * 0.5 + (swing if k % 2 else 0)
                drums.add(hat(), b0 + pos, 0.09 if k % 2 else 0.06, pan=0.22)
            bass.add(bass_note(root.replace("1", "2"), T(2.2), 500), b0, 0.5)
            bass.add(bass_note(root.replace("1", "2"), T(1.2), 500), b0 + 2.5, 0.38)

    # three-note answers in the longer gaps between sections (D pentatonic, falling)
    licks = [["A5", "F#5", "D5"], ["B5", "A5", "F#5"], ["D6", "B5", "A5"], ["F#5", "E5", "D5"]]
    licks = licks[LICK_ROT % 4:] + licks[:LICK_ROT % 4]
    li = 0
    for a, b in zip(plan, plan[1:]):
        gap = b["t"] - a["end"]
        if gap >= 1.5:
            start = np.ceil((a["end"] + 0.15) / BEAT * 2) / 2
            for j, nt in enumerate(licks[li % len(licks)]):
                music.add(ks_pluck(hz(nt), 0.9, bright=0.45, buzz=0.1), start + j * 0.5, 0.2, pan=0.25)
            li += 1

    # the series title: a soft swell into its downbeat
    fx.add(riser(T(3.5)) * 0.5, plan[1]["beat"] - 3.5, 0.18)
    fx.add(crash(2.0), plan[1]["beat"], 0.08)

    # end card: the progression resolves to Dmaj9 and rings out
    music.add(pad_chord(["D3", "A3", "C#4", "E4", "F#4"], T(END_CARD_BEATS) + 1.0, (900, 2200),
                        attack=0.2, release=1.2), end_beat, 0.32)
    music.add(keys(["D3", "F#3", "A3", "C#4", "E4"], T(6)), end_beat, 0.5)
    bass.add(bass_note("D2", T(4), 450), end_beat, 0.5)
    drums.add(kick(soft=True), end_beat, 0.9)
    fx.add(crash(2.4), end_beat, 0.1)

    # vinyl dust: a filtered noise floor and sparse seeded crackles
    n = dust.x.shape[1]
    floor_ = filt(dsp.rng.standard_normal(n), "bandpass", [700, 5000]) * 0.004
    dust.x += np.stack([floor_, floor_])
    for i in range(int(DUR * 7)):
        t = dsp.rng.uniform(0, DUR)
        s = int(t * SR)
        pop = filt(dsp.rng.standard_normal(int(0.004 * SR)), "highpass", 2000) * dsp.rng.uniform(0.01, 0.05)
        e = min(s + len(pop), n)
        dust.x[:, s:e] += pop[: e - s] * (0.6 if dsp.rng.uniform() < 0.5 else 1.0)

    kick_t = [T(b) for b in range(groove_from, groove_to) if b % 4 in (0,)] + \
             [T(b + 2.5) for b in range(groove_from, groove_to, 4)]
    pump = sidechain(sorted(kick_t), bass.x.shape[1], 0.25, 0.12)
    ir = reverb_ir(1.8, 0.45)
    wet_src = music.x * 0.5 + fx.x * 0.3
    wet = np.stack([signal.fftconvolve(wet_src[c], ir[c])[: wet_src.shape[1]] for c in range(2)])
    bed = drums.x * 0.75 + bass.x * pump * 0.7 + music.x * pump * 0.8 + fx.x * 0.6 + wet * 0.35 + dust.x
    bed = np.stack([filt(filt(ch, "highpass", 30), "lowpass", 9000) for ch in bed])[:, :N]   # warm top
    bed /= np.abs(bed).max() + 1e-9
    bed *= 0.5
    fade = int(1.2 * SR)
    bed[:, -fade:] *= np.linspace(1, 0, fade) ** 2
    sf.write(HERE / "music.wav", bed.T, SR, subtype="PCM_24")

    # ---------------------------------------------------------------- grid + timeline
    grid_src = drums.x[:, :N].mean(axis=0).astype(np.float32)
    m = measure_beats(grid_src[int(T(groove_from) * SR):int(T(groove_to) * SR)], SR, BPM)
    beats = [round(T(i), 5) for i in range(total_beats + 1)]
    grid = {"bpm": BPM, "period": round(BEAT, 6), "offset": 0.0, "beats": beats, "downbeats": beats[::4],
            "duration": DUR, "measured": {"bpm": m["bpm"], "fit_residual_ms": m["fit_residual_ms"]},
            "sections": [{"name": p["id"], "beat": p["beat"]} for p in plan] + [{"name": "end", "beat": end_beat}],
            "source": "shared/score.py (synthesized at exactly 88 bpm; grid checked on the drum stem)"}
    (FILM / "beats.json").write_text(json.dumps(grid, indent=1))
    print(f"grid check on drums: {m['bpm']} bpm, fit rms {m['fit_residual_ms']} ms")

    timeline = {"bpm": BPM, "period": BEAT, "duration": DUR, "end_beat": end_beat,
                "sections": [{k: p[k] for k in ("id", "beat", "t", "shift", "end")} for p in plan]}
    (FILM / "vo_timeline.json").write_text(json.dumps(timeline, indent=1))
    words = {}
    for sid in SECTIONS:
        ws = json.loads((HERE / "takes" / f"{sid}_words.json").read_text())["words"]
        words[sid] = [[x["text"], round(x["start"], 3), round(x["end"], 3)] for x in ws if x.get("type", "word") == "word"]
    (FILM / "vo_words.json").write_text(json.dumps(words, ensure_ascii=False, indent=0))
    cfg = json.loads((FILM / "film.json").read_text())
    cfg["duration"] = DUR
    cfg["poster"] = round(T(plan[1]["beat"] + 6), 2)
    (FILM / "film.json").write_text(json.dumps(cfg, ensure_ascii=False, indent=1) + "\n")
    print(f"-> music.wav, vo.wav, beats.json, vo_timeline.json, vo_words.json; film.json duration {DUR}")


if __name__ == "__main__":
    main()
