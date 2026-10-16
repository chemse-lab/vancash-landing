# VanCash ERP · الحلقة 1: critique log

## Round 1
| hook | read | motion | variety | brand | sync | min |
|  6   |  6   |   7    |    8    |   9   |  7   |  6  |

Evidence: hook b0-4 shows the eyebrow and the dashboard card, the first line only starts rising at b1;
read b77-83 the navy words "حفظ البيانات" sit half outside their lime marker on the navy page, so their
tops vanish; motion: springs and RTL whips with blur hold up, but b199-203 (trial), b299-301 (next) and
b323-325 (end card) land the whip on an almost empty page; variety: paper / blue / navy / mint pages,
real screens, diagrams, a table; brand: real screenshots only, brand blue + lime highlighter, Cairo
(the app's face) + IBM Plex Sans Arabic; sync: 50/61 hits within 20 ms (the misses are soft blips under
the voice, the onset detector picks the syllables), mix -14.1 LUFS, -1.2 dBTP.

Worst three:
1. [b77-83] Navy text on a 0.36-em lime bar on a navy page: the upper half of "حفظ البيانات" is navy
   on navy -> the key words of the scene become unreadable -> marker() gets a `box` mode (a lime block
   from 0.95 em above the baseline to 0.35 em below) and question() uses it.
2. [b199-203, b299-301, b323-325] The whip lands on a page whose content waits for later words ->
   a cut that opens on near-blank -> trial's title, next's title and the end card's logo, wordmark and
   panel start with the push (START - 0.5), the voice still times the highlights.
3. [b0-4] Frame 0 has no words; the first line starts after the first beat -> a weak first two
   seconds -> line A's first word is already rising on frame 0 (start -0.3 beat) and the card enters
   larger, settling to its place.

Checks failed: cut opens on near-blank (3 places, fixed above).
Verdict: ANOTHER ROUND

## Round 2
| hook | read | motion | variety | brand | sync | min |
|  7   |  8   |   7    |    8    |   9   |  7   |  7  |

Evidence: hook b0 now has "قبل" rising beside the dashboard card arriving large; read b77-83 the box
highlight keeps "حفظ البيانات" navy on lime, readable on the phone page; motion strip_panel: at b18.7
the blue panel appears at full opacity, square to the frame, on top of a card tilted -2 deg (a pop,
not a transformation); strip_whip50: both pages on screen, blur on the fast middle; sync 50/61 within
20 ms: five feature-chip blips in 1.5 s under the voice (b115-117) and the whip whooshes keyed to the
landing instead of the fastest frame read as misses.

Worst three:
1. [b18.7-20] The panel pops in -> the hook's best image is replaced, not transformed -> the panel takes
   the card's tilt (-0.035 rad -> 0) and fades in over the first 25 % of the move while it grows.
2. [b115-117, all whips] Accents the ear can't place -> the mix is busier than it sounds -> keep two of
   the five feature blips (first and last), whip whooshes peak on the whip's fastest frame
   (START - PUSH / 2), done-check bells +2 dB.
3. [b0-4] Hook is now acceptable; the card's arrival could carry more weight -> leave for round 3
   after the motion fixes, judge on the range video.

Checks failed: none new.
Verdict: ANOTHER ROUND

## Round 3
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  8   |  8  |

Evidence: hook b0 "قبل" is rising beside the real dashboard card arriving large and settling; the
question lands with the highlighter on "بياناتك" at b10; read: every headline and table row reads on
phone_p1..3, the smallest labels are 24-30 px UI (eyebrows, pills), the price note is fine print by
intent; motion: springs with overshoot on every entrance, RTL whips with both pages on screen and
12-sample blur, the blue frame now grows out of the tilted card (strip_panel), the camera pushes into
the dashboard's sync badges on "بياناتك"; variety: 13 scenes, paper / blue / navy / mint pages, a real
screen tour, two diagrams, a table, a checklist, a split screen; brand: the site's tokens, its own icon
set and favicon mark, Cairo + IBM Plex Sans Arabic, real screenshots only; sync: whooshes land on each
whip's landing beat with the voice, ticks/pops/bells on their frames, mix -14.1 LUFS / -1.2 dBTP.

Remaining (not blocking): small pill labels are the first thing to grow if the episode is cut for
Shorts; the voice is one generated take per section (the ElevenLabs account allows one generation at a
time); the price count-up runs 0.8 beat.

Checks: no banned defaults; longest hold without a new event is the end card (b324-336, by design);
no cut opens on blank; all Arabic renders in the film's faces; one accent; end card holds 8 s.
Verdict: READY
