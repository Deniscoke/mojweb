# Photographs — the brief

This folder holds the web versions of Denis's own photographs. Everything in it
is **generated** by `npm run images`. Never put an original photo here: see
"Why the originals stay outside" below.

The site already has a designed place for each photo. Until a photo is
registered, that place renders **nothing** — not a grey box, not a "coming
soon". So the site is complete without photos, and each photo you add simply
appears in its slot.

## Where each photo goes

| Slot | What | Frame | Registered in |
| --- | --- | --- | --- |
| **About** (homepage) | 1–2 frames: circus, snowboard | **4:5** vertical | `src/data/photos.ts`, `placement: 'about'` |
| **Case study** (`/projects/circus-movement/`, `/projects/snowboard-coaching/`, …) | The project's hero and evidence | **3:2** horizontal | `src/data/evidence.ts`, `kind: 'photo'` |
| **Project labs** (`/laby/<lab>/`) | Workshop photos | **3:2** horizontal | `src/data/photos.ts`, `placement: 'laby:<lab-slug>'` |
| Selected Work (homepage list) | — | — | Stays the generated plates. Not a photo slot. |

## What to choose

- **Figure against ground.** A juggler against a dark stage, a rider against
  snow or sky. The page is dark; a busy background turns to noise.
- **Mid-action**, not posed to camera.
- **At least 2400 px** on the long edge. The script warns below that.
- **One vertical (4:5) and one horizontal (3:2)** frame per subject, so each
  slot gets a photo composed for it rather than a crop of the other.
- **Grade it before it comes in**, toward the site's warm ink and bone. The
  site never applies colour filters to a photograph.

## Consent — read this first

Every photo records who agreed to it. The build **refuses** a photo of
children that breaks these rules, so they cannot be forgotten.

| `consent` | Means |
| --- | --- |
| `'adult'` | Everyone recognisable in the frame is an adult who agreed. |
| `'guardian-consent-on-file'` | Children appear, and you hold **written** consent from their guardians. |
| `'non-identifiable'` | Nobody in the frame can be recognised. |

**Children** (`minors: true`):

- only with written guardian consent on file — `consent: 'guardian-consent-on-file'`;
- framed so no child can be recognised: from behind, at a distance, hands at
  work, never a face to camera;
- never given the depth effect (`depth: true` is rejected for them).

`minors` must always be stated, `true` or `false`. It is never guessed.

## Alt text — yours, always

You were there, so you write it. One or two sentences describing what is
actually visible, in English, and Czech and Slovak if you can (other languages
show the English). Not a caption, not a mood: what a person who cannot see the
image needs to know is in it.

A photo without alt text is still shown, but screen readers skip it. Nothing is
ever generated from a file name.

## Adding a photo — three steps

Keep the original wherever you keep your photos. **Name the file what the photo
should be called** — `circus-juggling.jpg` — because that name becomes its id.

**1. Make the web versions.** From the project folder:

```sh
npm run images -- --photo "C:/Users/Admin/Pictures/web/circus-juggling.jpg"
```

For a **case study** use `--evidence` instead; it prints the line to paste into
`evidence.ts`:

```sh
npm run images -- --evidence "C:/Users/Admin/Pictures/web/circus-stage.jpg"
```

Both take several files, or a whole folder, at once.

**2. Register it.** Add an entry to `src/data/photos.ts` (About, labs):

```ts
{
  id: 'about-circus',
  src: 'circus-juggling',            // the file name from step 1, without .jpg
  alt: {
    en: 'What is visible, in one or two sentences.',
    cs: '…',
    sk: '…',
  },
  focal: [42, 30],                   // the point that must stay in frame, % from left and top
  readout: { place: '…', year: 2025, discipline: { en: 'Circus', cs: 'Cirkus', sk: 'Cirkus' } },
  placement: 'about',
  order: 1,
  consent: 'adult',
  minors: false,
},
```

or, for a case study, an entry in `src/data/evidence.ts` with `kind: 'photo'`,
the `file`, `width` and `height` printed in step 1, your `alt`, and the project
slug.

**3. Look at it.**

```sh
npm run build && npm run preview
```

Check the frame on a phone width and on desktop. If the subject sits too close
to an edge, move `focal`.

### `focal`

`[x, y]` in percent of the photo: `[50, 50]` is the centre, `[30, 20]` is left
of centre and near the top. Put it on the face, the hands, the clubs — whatever
must never be cropped. It decides how the 4:5 and 3:2 frames crop and is the
point the photo moves around as you scroll.

### `readout`

The mono line under the frame — `PLACE · YEAR · DISCIPLINE`. Every part is
optional; leave out anything you are not sure of rather than guess.

## Why the originals stay outside

A camera or phone original carries metadata — often the GPS position where it
was taken. Everything inside `public/` is published as-is, so an original
dropped here would publish that too. The script reads the original from where
it is, writes new files with **all metadata removed** (turned the right way up
first), and never copies the original into the project. If it finds an
original in this folder it warns.

## What the script writes

For `--photo`, into this folder:

- `<name>-640w.webp`, `<name>-960w.webp`, `<name>-1440w.webp`

and into `src/data/generated/photos.json`: each photo's size and a tiny blurred
preview that shows for the moment before the photo loads. The browser picks
the file that fits the screen; the frame's shape is reserved up front, so
nothing on the page jumps when it arrives.

To **remove** a photo: delete its entry from `photos.ts`, delete its
`<name>-*w.webp` files here, and run `npm run images`.

## How the photos move

Gently, and only while you scroll. Each photo sits in its frame like a view
through a window: as the frame comes up the screen the photo settles into
place, and by the time it reaches the middle of the screen it is exactly as you
framed it — still, sharp, uncropped by any effect. It moves again only as it
leaves the top. On desktop a frame tilts a few degrees under the mouse.

With "reduce motion" turned on, with the site's Calm setting, or in a browser
that cannot do this, the photo is simply shown in its frame. It is never hidden
and never faded in.

A second, stronger effect — real depth computed from the photo (`depth: true`)
— comes later, for hand-picked adult photos only. It needs a depth map made on
this machine; until one exists, `depth: true` has no effect.
