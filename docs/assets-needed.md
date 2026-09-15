# Assets needed

> **Updated after Iteration 5.1.** Selected Work is now Pravo365 ·
> Web & Digital Work · Circus & Movement · Moodpack / Director ·
> Snowboard Coaching. Art Learning, Digital Space and AI Commerce are in the
> Lab and keep their evidence.

## Selected Work — evidence status

| Project | Evidence | Still needed |
| --- | --- | --- |
| Pravo365 | ✅ generator UI + input form | generated document, mobile screen |
| Web & Digital Work | ❌ none | 3–4 approved site screenshots — see [`web-projects-review.md`](web-projects-review.md) |
| Circus & Movement | ❌ none | training photo, object/juggling photo, group photo |
| Moodpack / Director | ✅ architecture diagram | Unreal editor screenshot, collision experiment |
| Snowboard Coaching | ❌ none | riding photo, teaching photo |

Three of five have real written content now but **no photograph of any kind**.
Circus and Snowboard Coaching describe work with real people and offer it
commercially; a page that does that with a generated plate is the weakest
thing on the site.

---

## ⚠️ PRIVACY — read before sending any movement photograph

Circus work is with **children aged roughly 6–16**. Therefore:

> **No image containing an identifiable child is automatically portfolio-safe.**

Any such asset is marked **CONSENT / PUBLICATION REVIEW REQUIRED** and will not
be published until you confirm permission exists. The existence of a photograph
is **not** evidence that consent to publish it was given — I will not infer
that, and neither should the pipeline.

Preferred, in order:

1. Images where **you** are demonstrating, alone.
2. **Hands, objects, equipment** — juggling props mid-air, a balance object, a
   board. Often the strongest image anyway, and carries no identity at all.
3. **Wide or back-view group shots** where nobody is identifiable.
4. Material **already published** by a festival or organiser with clearance.
5. Close identifiable portraits of participants — only with explicit written
   consent, and only if you want them there at all.

The same applies to snowboard teaching photographs involving other people,
adults included.

---

## CIRCUS & MOVEMENT

### REQUIRED

1. **Training or workshop photograph**
   - format: WEBP or JPG · ratio 3:2 · min width 1600px
   - used: project hero media
   - ⚠️ CONSENT / PUBLICATION REVIEW REQUIRED if participants are identifiable
2. **Object / juggling photograph**
   - format: WEBP or JPG · ratio 3:2 or 4:5 · min width 1400px
   - props in motion, or hands mid-catch. Identity-free and very usable.
3. **Group or activity photograph**
   - format: WEBP or JPG · ratio 3:2 · min width 1600px
   - ⚠️ CONSENT / PUBLICATION REVIEW REQUIRED

### NICE TO HAVE

4. **Short vertical video** — 5–15s, no audio needed
   - format: MP4 (H.264) · ratio 9:16 · max ~8 MB
5. **A performance or workshop moment**
   - format: WEBP or JPG · ratio 3:2 · min width 1600px

---

## SNOWBOARD COACHING

### REQUIRED

1. **Riding photograph**
   - format: WEBP or JPG · ratio 3:2 · min width 1600px
   - used: project hero media. You riding is ideal — no consent question.
2. **Teaching / instruction photograph**
   - format: WEBP or JPG · ratio 3:2 · min width 1600px
   - ⚠️ CONSENT / PUBLICATION REVIEW REQUIRED if a learner is identifiable.
     A wide shot from behind, on the slope, usually solves this.

### NICE TO HAVE

3. **Short riding clip** — MP4 · 16:9 or 9:16 · max ~8 MB
4. **Equipment or environment shot** — board, snow, the hill. Identity-free.

---

## FACTS STILL NEEDED FROM DENIS

Neither of these blocks the site; the copy is written conservatively so it is
true without them.

1. **Exact official title of the snowboard qualification.**
   The site currently says *"a qualification in the basics of school
   snowboarding"* and names no certificate, awarding body or level. Send the
   exact wording from the certificate and I will use it precisely.

2. **Exact public name of the Žďár nad Sázavou organisation.**
   You referred to it approximately as "Aktív". The site currently says
   *"local youth and movement activities in the Žďár nad Sázavou area"* and
   names no organisation. A guessed legal name would be a fabricated
   affiliation, so it stays out until confirmed.

3. **Which web projects may be shown and named** — see
   [`web-projects-review.md`](web-projects-review.md).

KoresponDance is named only as participation in the children's programme. No
employment, partnership or authorship is implied anywhere.

---

## How to read this

- **REQUIRED** — the case study is materially weaker without it.
- **NICE TO HAVE** — improves the page but is not load-bearing.
- **Min width** is the long edge for raster images. Larger is fine; smaller
  will look soft on a high-DPI screen.
- Diagrams should be **SVG** wherever possible: they stay sharp at any size,
  and the frontend gives them a padded frame automatically. Author them in the
  site palette — see [`diagram-style.md`](diagram-style.md).
- Upload via the Payload admin → Media, set `kind` and `alt`, then attach to
  the project. See `payload-development.md` → *Adding project media*.

⚠️ **Screenshot hygiene.** Blur, crop or replace any real client name, real
personal data, real contract content, or anything under NDA before exporting.
A case study screenshot showing a real person's contract is worse than no
screenshot.

---

## PRAVO365

### REQUIRED

1. **✅ DONE — Landing / product overview**
   - `pravo365-generator.webp`, captured from the live public site
   - used: project hero media
2. **✅ DONE — Generator interface, structured input**
   - `pravo365-form.webp`; shows numbered step 1 with the field-level
     statute note. Verified free of personal data before capture.
3. **Generated document output**
   - format: WEBP or PNG · ratio 4:5 · min width 1200px
   - used: evidence; shows the artefact the product actually produces
   - note: use a dummy/sample contract, never a real one
4. **Mobile screen**
   - format: WEBP or PNG · ratio 9:16 · min width 900px
   - used: evidence; shows it is a real product, not a desktop demo

### NICE TO HAVE

5. **Workflow diagram** — input → generation → review → export
   - format: SVG · flexible ratio
6. **Before/after of a single input field** showing how a question is phrased
   - format: WEBP or PNG · ratio 16:9 · min width 1400px

---

## MOODPACK / DIRECTOR

### REQUIRED

1. **STILL MISSING — Unreal Editor with the system connected**
   - format: WEBP or PNG · ratio 16:9 · min width 1920px
   - needs UE 5.8 open with the plugin and a scan loaded. No captures of this
     exist on the machine; only packaged builds.
2. **Director interaction — a command and its result**
   - format: WEBP or PNG · ratio 16:9 · min width 1920px
   - used: evidence; ideally shows the command surface and the scene together
3. **✅ DONE — Architecture diagram**
   - `moodpack-architecture.svg`, drawn from the plugin's own documentation
     (README, AI_DIRECTOR, SPLAT_WORKFLOW). Currently the hero evidence.
4. **Spatial / collision experiment**
   - format: WEBP or PNG · ratio 16:9 · min width 1600px
   - used: evidence for the *Experiments* section; a failure case is more
     convincing here than a success

### NICE TO HAVE

5. **Short screen recording of one operation** — 5–15s, no audio needed
   - format: MP4 (H.264) · ratio 16:9 · max ~8 MB
6. **Generation pipeline diagram** (objects / sound feeding the environment)
   - format: SVG

---

## ART LEARNING

### REQUIRED

1. **STILL MISSING — Lesson / prompt screen** ← *highest priority on the site*
   - format: WEBP or PNG · ratio 9:16 · min width 900px
   - A search of Desktop, Documents and the repo found no Art Learning project
     directory, mockups or screenshots. Even a wireframe photo would do; it
     would be labelled clearly as a prototype.
2. **Progression / journey view**
   - format: WEBP or PNG · ratio 9:16 · min width 900px
   - used: evidence; this is the "accumulation not percentage" argument
3. **Upload / capture flow**
   - format: WEBP or PNG · ratio 9:16 · min width 900px
   - used: evidence; shows practice happens on paper
4. **App flow overview** — the daily loop as a single image
   - format: SVG or PNG · flexible

### NICE TO HAVE

5. **Feedback screen**
   - format: WEBP or PNG · ratio 9:16 · min width 900px
6. **Wireframe → UI evolution**, two or three states side by side
   - format: PNG · ratio 16:9 · min width 1600px

---

## DIGITAL SPACE / HERITAGE

### REQUIRED

1. **✅ DONE — Point cloud**
   - `digital-space-pointcloud.webp`, rendered from the real 2.6 M-vertex
     RealityScan export. Hero evidence.
2. **Reconstructed mesh**
   - format: WEBP or PNG · ratio 16:9 · min width 1920px
3. **✅ DONE — The real location**
   - `digital-space-capture.webp`, one frame from the 45-shot capture pass.
   - ⚠️ The building is not named on the site because which site it is was
     never established. Tell me and I will add it.
4. **Resulting 3D environment** — a view from inside it
   - format: WEBP or PNG · ratio 16:9 · min width 1920px

### NICE TO HAVE

5. **Drone capture still or the capture rig in use**
   - format: WEBP or JPG · ratio 3:2 · min width 1600px
6. **Progression strip** — capture → point cloud → mesh → environment
   - format: PNG or SVG · ratio 21:9 · min width 2400px

---

## AI COMMERCE ENGINE

### REQUIRED

1. **Studio / generator interface**
   - format: WEBP or PNG · ratio 16:10 · min width 1600px
   - used: project hero media
2. **✅ DONE — Pipeline diagram**
   - `ai-commerce-pipeline.svg`, drawn from the real product folder structure,
     `quality_gates.yaml` and the runtime architecture doc. Hero evidence.
3. **QA gates — a run showing a check passing and one failing**
   - format: WEBP or PNG · ratio 16:9 · min width 1600px
   - note: a failing gate is the most convincing image in this whole project
4. **Example export structure** (file tree or output set)
   - format: WEBP or PNG · ratio 4:3 · min width 1200px

### NICE TO HAVE

5. **Manifest sample** (redacted if needed)
   - format: PNG or SVG · ratio 4:3
6. **A set of generated products** shown together
   - format: WEBP or PNG · ratio 16:9 · min width 1600px

---

## LAB

Lab notes are meant to be rough — one image each is plenty, and several need
none at all. All of these are NICE TO HAVE.

| Experiment | Asset | Format | Ratio |
| --- | --- | --- | --- |
| AI controlling Unreal | A placement failure and a success | PNG/WEBP | 16:9 |
| Drawing as a daily habit | Streak or journey screen | PNG/WEBP | 9:16 |
| Navigable space | One reconstruction still | PNG/WEBP | 16:9 |
| Generated product pipelines | A QA gate report | PNG/WEBP | 16:9 |
| Can AI answer my phone? | — none, it is an open question | — | — |
| LiDAR & photogrammetry | Two captures of the same subject, different conditions | PNG/WEBP | 16:9 |
| Voice agents | — none needed | — | — |
| Spatial computing | One spatial UI test | PNG/WEBP | 16:9 |

---

## Totals

| | Count |
| --- | --- |
| **REQUIRED — done** | **6** |
| **REQUIRED — remaining** | **14** |
| REQUIRED — total | 20 |
| NICE-TO-HAVE — remaining | 16 |

### The five that would move things most

1. **Art Learning — anything at all.** One lesson screen or one wireframe
   photo. It is the only project with zero evidence.
2. **MoodPack — one Unreal Editor screenshot** with a scan loaded.
3. **AI Commerce — one QA gate run**, ideally with a check failing.
4. **Pravo365 — one generated document**, using dummy data, never a real one.
5. **Digital Space — the walkable environment**, closing the loop from capture
   to something you can move through.

## Where they land

Each project's `media` array renders on the project page: the **first item
becomes the hero**, in place of the generated plate, and the rest appear in the
*Evidence* block, lazy-loaded. A project with no media keeps the generated
plate and shows no evidence block — which is why Art Learning still looks the
way it does.

Upload steps: [`payload-development.md`](payload-development.md) → *Adding
project media*.
