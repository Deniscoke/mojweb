# Assets found

A search of the accessible project directories for material that could serve as
real evidence. Nothing here came from the internet and nothing is stock.

Searched: `C:\Users\Admin\Desktop`, `Documents`, `IndiWeb`, `source`,
`draci-voice-bot`, `reality scan2`, `ansel`, and the repo itself.

**Originals were never modified.** Publishable derivatives were written to
`artifacts/evidence-ready/`; the untouched intermediates sit in
`artifacts/evidence-raw/`.

---

## USED — now published

### 1. Pravo365 — generator overview

| | |
| --- | --- |
| Source | `https://pravo365.cz/cs/generator` (live public product) |
| Project | Pravo365 |
| Shows | Contract-type chooser grouped by area of law; each card cites the sections of the Czech Civil Code it is built on. Banner states output is a working draft to be checked by a lawyer. |
| Quality | Good. 1440×900, captured at device scale. |
| Safe to publish | **Yes.** Public marketing/product page, no login, no personal data. |
| Placement | Pravo365 — hero evidence |

### 2. Pravo365 — structured input step

| | |
| --- | --- |
| Source | `https://pravo365.cz/cs/generator` → "Kupní smlouva" |
| Project | Pravo365 |
| Shows | Numbered step 1 "Smluvní strany" with 23 empty fields and a field-level legal note ("Povinné pro podnikatele dle § 435 NOZ"). |
| Quality | Good. |
| Safe to publish | **Yes.** Verified programmatically before capture: 0 e-mail addresses, 0 phone numbers, 0 birth numbers, 0 prefilled values. Nothing was typed into the form and nothing was submitted. |
| Placement | Pravo365 — evidence |

> The cookie banner and feedback widget were hidden with CSS for the capture.
> They were **not** clicked — no consent was given on anyone's behalf.

### 3. Digital Space — photogrammetric reconstruction

| | |
| --- | --- |
| Source | `Desktop/reality scan/kasna.ply` (148 MB) |
| Project | Digital Space / Heritage |
| Shows | Hexagonal stone pavilion with a slate hipped roof on a grass mound ringed by a gravel path, rendered from the scan's own 2.6 M coloured vertices. Header: `comment Created in RealityScan`. |
| Quality | Excellent, and unusually honest — the reconstruction breaks off raggedly at the capture boundary. |
| Safe to publish | **Yes.** Exterior of a building, no people, no personal data. |
| Placement | Digital Space — hero evidence |

Rendered with a purpose-written orthographic point-cloud rasteriser
(`artifacts/evidence-raw/`, script kept in the scratchpad). Nothing was added
to the data: colours, geometry and the ragged edge are all as captured.

### 4. Digital Space — capture frame

| | |
| --- | --- |
| Source | `Desktop/reality scan/Reality scan/IMG_1625.HEIC` (one of 45) |
| Project | Digital Space / Heritage |
| Shows | Historic facade: yellow render between white pilaster strips, ornamental stucco capital, two arched windows. |
| Quality | Good. Phone capture, EXIF-rotated during conversion. |
| Safe to publish | **Yes.** Public building exterior, no people, no identifying signage. |
| Placement | Digital Space — evidence |

> The building is deliberately **not named** on the site. Which site it is was
> not established, and inventing an attribution would be exactly the kind of
> claim this project refuses to make.

### 5. MoodPack — architecture diagram *(authored)*

| | |
| --- | --- |
| Source facts | `Desktop/MoodPackPlugin/MoodPack3D/Documentation/` — `README.md`, `AI_DIRECTOR.md`, `SPLAT_WORKFLOW.md` |
| Project | Moodpack / Director |
| Placement | Moodpack — hero evidence |

Every element is taken from that documentation: the `.ply`/NanoGS and
`.lcc2`/XGrids import paths, the invisible collision shell built from the scan
mesh, `MoodPackSplatWorldRoot`, the first-person character, the optional AI
Director, the separate Mood Pack server reached over HTTP via
`MOODPACK_SERVER`, third-party paid providers, and the documented behaviour
without a server. No module or capability was invented.

### 6. AI Commerce Engine — pipeline diagram *(authored)*

| | |
| --- | --- |
| Source facts | `Desktop/Etsy/ETSY/EduCommerce/` — `docs/07_RUNTIME_ARCHITECTURE.md`, `config/quality_gates.yaml`, `products/BTS-001/` |
| Project | AI Commerce Engine |
| Placement | AI Commerce — hero evidence |

Stages match the real product folder (`brief`, `sources`, `master`, `exports`,
`previews`, `qa`, `metadata`). The eight gate families are the actual keys in
`quality_gates.yaml`. The product/profile/release scopes and SHA-256 binding,
the content-addressed exports behind a registrar lock, the dry-run default and
`PublishApproval` are all documented behaviour. No revenue or business claim
appears.

---

## FOUND, NOT USED

### Michel Rodange monument scan

`Desktop/reality scan/Michel Rodange monument.ply` — 3.0 M vertices, exported
by Artec 3D. **Geometry only, no vertex colour**, so a render would be an
untextured grey mass that says less than the RealityScan pavilion. Held back
rather than published as a weaker duplicate.

### RealityScan texture maps

`kasna_u1_v1_diffuse.png` (78 MB), `_normal.png`, `_unwrap.png` — all 8192².
The "unwrap" turned out to be a **UV checker test pattern** (A1–H8 colour
grid), not a mesh unwrap, so it shows nothing about the captured place. Not
used.

### EduCommerce product pages

`Desktop/Etsy/canva_pages/Page_01…Page_15.png` — a generated content-calendar
product. Genuine pipeline output, but it is a *marketing planner*, and putting
it on the page would shift the case study's argument from "the pipeline is
verifiable" to "here is a product for sale". The diagram makes the point
better. Available if you want it.

### MoodPack Unreal builds

`Desktop/MoodPackPlugin/Build`, `Build58`, `MoodPackPackagedTest/ArchiveZamok`
— packaged builds with no captured stills. Running the editor to capture a live
screenshot needs Unreal Engine 5.8 and a scan loaded; that is a manual step for
Denis, not something to fabricate.

### Desktop/Mood pack *(different project — do not confuse)*

`Desktop/Mood pack/ARCHITECTURE.md` describes a **Next.js + Supabase + fal.ai
virtual property-staging app** — photo in, restyled room out. Despite the
shared name it is **not** the portfolio's "Moodpack / Director" (agent
operating Unreal). It was explicitly excluded from the architecture diagram.
If it is a project in its own right it deserves its own case study; it is not
evidence for this one.

---

## REVIEW BEFORE PUBLISHING

Nothing published in this iteration is in this category. Recorded for the
future:

- **`Desktop/Etsy/ETSY/EduCommerce/config/quality_gates.yaml`** — one line
  matched a `secret`-like pattern (it is a gate identifier, not a credential).
  The file itself is **not** published; only facts were read from it. If a
  screenshot of it is ever wanted, read it line by line first.
- **`Desktop/Etsy/ETSY/EduCommerce/logs/`, `debug.log`, `state/`** — not
  inspected and not published. Assume they may contain paths, keys or run
  detail until reviewed.
- **`Desktop/reality scan/Reality scan/IMG_*.HEIC`** — 45 frames, of which 12
  were viewed. The rest are unreviewed; any further use needs a look for
  bystanders, vehicle plates or signage.
- **`Desktop/právnikAI/`** — source of a live legal product. `docs/` includes
  `STRIPE_SETUP.md` and legal-review material. Not opened beyond a filename
  listing, and nothing from it is published.

## Not searched

`OneDrive`, `Pictures`, `Videos`, `VERCA`, `youtube channel`, and the many
other Desktop folders were left alone — they are outside the five projects and
more likely to hold personal material. Say the word if something relevant
lives there.
