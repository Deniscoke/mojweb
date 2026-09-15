# Diagram style

Portfolio diagrams are authored as SVG in the site's own visual language, so a
diagram reads as part of the page rather than as a picture pasted into it.
Two exist so far: `moodpack-architecture.svg` and `ai-commerce-pipeline.svg`.

## Rules

**Dark ground.** Diagrams are drawn on `#08080a` — the page ground. The media
component frames `kind: diagram` on `--c-ink` with padding, so a light diagram
would drop a white slab into a dark page.

**The site's own tokens.** No new colours.

| Role | Token | Value |
| --- | --- | --- |
| Ground | `--c-void` | `#08080a` |
| Panel | `--c-ink` | `#101014` |
| Hairline | `--c-line` | `#23232b` |
| Stronger line, arrows | `--c-line-strong` | `#34343e` |
| Primary text | `--c-bone` | `#ebe7de` |
| Body text | `--c-bone-dim` | `#a7a29a` |
| Micro labels | `--c-bone-faint` | `#6b6862` |
| Accent — the point being made | `--c-signal` | `#ff4a1c` |
| Cold accent — Lab only | `--c-lab` | `#74e9b6` |

**Two typefaces, same as the site.** JetBrains Mono for micro labels —
uppercase, `letter-spacing: 0.14em`, 11px. Inter Tight for headings (17–19px,
weight 600) and body (13–13.5px, weight 300).

**Numbered stages.** `01`, `02`, `03` in mono, matching the section indices
used across the site.

**Editorial grid.** 56px outer margin, a rule under the header, a rule above
the footer line. Panels are 1px-stroked rectangles with `rx="2"` — the same
near-square corner the site uses.

**One accent per diagram.** Signal marks the single most important claim —
the problem being solved, the gate row. If everything is accented, nothing is.

**A closing line.** Each diagram ends with a mono label and one sentence
stating the honest limitation: what happens without the server, where channel
limits actually live. This is the diagram equivalent of the site's habit of
saying what a thing does *not* do.

## Accessibility

- `role="img"` plus a full `aria-label` on the root `<svg>` describing the
  whole flow in prose. Screen-reader users get the argument, not a list of
  boxes.
- A `<title>` element as well.
- Never rely on colour alone — every accented item also carries a label.
- Text stays live text, never outlines, so it scales and can be selected.

## Sizing

`viewBox` with explicit `width`/`height` so Payload records real dimensions and
the page reserves the right box (no layout shift). Landscape, roughly 1200×660
to 1200×720. Diagrams are `object-fit: contain`, so they letterbox rather than
crop.

## Authoring

Write the SVG by hand and check well-formedness:

```bash
python -c "import xml.dom.minidom as m; m.parse('docs/../artifacts/evidence-ready/your-diagram.svg')"
```

Then add it to `mediaSpecs` in `cms/src/content/media.ts` with
`kind: 'diagram'`, real `alt` text, and run `npm run media:import` from `cms/`.

**Only draw what is documented.** Both current diagrams cite their source
files in [`assets-found.md`](assets-found.md). A diagram that invents a module
is worse than no diagram — it is a confident-looking lie.
