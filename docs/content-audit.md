# Content audit — before Iteration 3

Read: homepage (all six locales), About, What I Do, Currently, all five project
detail pages, all eight experiment records, Payload schemas, current CMS
content, the six locale dictionaries, and `iteration-3-cms-notes.md`.

---

## STRONG

Things that already read as specific and credible.

- **Pravo365's constraint is stated plainly.** "for the Czech legal
  environment" is a real limit, and limits read as true in a way that
  capability claims do not.
- **Project statuses are honest.** Four of five projects are *not* live and
  say so. The maturity meter makes that legible at a glance instead of hiding
  it behind uniform presentation.
- **The Lab exists at all.** Eight open questions, three of them explicitly
  unanswered (`open-question`), is unusual and is the single most convincing
  thing on the site.
- **The contact section refuses to invent.** "Contact details are being added"
  where an address would go is better than a plausible fake.
- **`writtenLocales` + the untranslated note.** Serving English prose inside a
  Spanish page *and saying so* is more trustworthy than silent fallback.
- **Currently carries a real date stamp** (`2026-08`) taken from the content,
  not from `new Date()`.
- **The experiment titles are genuinely questions**, not features dressed as
  questions: "Can an AI answer my phone?"

## GENERIC

Could sit on any creative technologist's portfolio. This is the bulk of the
problem.

- **What I Do reads as agency service cards.** "AI workflows, agents,
  generative systems and process automation" is a keyword list. Nothing in it
  is specific to Denis.
- **`hero.intro`** — "Projects, prototypes and experiments. Some are finished.
  Some are still questions." Pleasant, but it describes a portfolio in
  general.
- **`work.lead`** — "A working archive rather than a portfolio" is a nice
  line that is then contradicted by the archive being one sentence deep.
- **Three of five project descriptions are one-line category restatements.**
  Art Learning, Digital Space and AI Commerce Engine each say roughly what
  their category already said.
- **`about.paragraphs[1]`** — "AI, product development, the web, multimedia,
  3D, automation and experimental technology" is seven nouns doing the work of
  one story.
- **The four `services.items` bodies are interchangeable** with any agency's.

## DUPLICATED

- **"turns vague ideas into things you can actually test"** (About pull) vs
  **"From an ambiguous idea to a functioning prototype"** (Services item 1) vs
  **"I make ideas real."** (hero). Three phrasings of one thought within one
  scroll.
- **"experiments"** appears in `hero.intro`, `work.lead`, `lab.lead` and in
  three project descriptions. The word has stopped carrying meaning.
- **Lab lead** ("not case studies yet — and may never be") restates the Lab
  state markers that are visible two lines below it.
- **Digital Space** and the **LiDAR / photogrammetry** and **spatial
  computing** experiments currently say nearly the same thing at three
  different depths, with no link between them.

## MISSING

What a visitor needs and cannot currently get.

- **Any case study beyond Pravo365 and MoodPack.** Three of five projects have
  no `detail` block, so their pages render one sentence. This is the largest
  gap on the site.
- **The driving question per project.** The Lab has questions; Projects do
  not. Schema has no `question` field.
- **"What I learned".** The `learning` field exists in the Payload schema and
  is **not mapped by the normalizer or rendered anywhere** — written content
  would currently vanish. (Bug, fixed this iteration.)
- **Any visual evidence.** Every plate is generated SVG. There is not one
  screenshot of anything actually built.
- **Experiment detail.** `whatITried` / `whatHappened` / `nextQuestion` exist
  in schema, hold no content, and have no route to render on.
- **Project ↔ experiment links.** `relatedProject` exists and is empty on all
  eight experiments, so the two halves of the site never reference each other.
- **The education → experimentation → building arc.** About jumps from
  teaching to "AI, product development, the web…" with no middle.
- **Year / timeframe** on any project.

## NEEDS EVIDENCE

Claims that would be far stronger with an asset. Full list with formats and
ratios in [`assets-needed.md`](assets-needed.md).

| Claim | Evidence needed |
| --- | --- |
| Pravo365 is live and usable | Landing + generator UI + generated document + mobile |
| AI can operate Unreal Engine | Editor screenshot, Director interaction, architecture diagram |
| Art Learning is a real prototype | Lesson screen, progression/journey, upload flow |
| Places can be digitised | Point cloud, scanned mesh, source location, final environment |
| The commerce pipeline is systematic | Studio UI, pipeline diagram, QA gates, export structure |
| Spatial/LiDAR experiments happened | Capture stills, scan process |

Without these, five of the six strongest claims rest on prose alone.

## MOVE DEEPER

Content currently on the homepage that belongs one level down.

- **`about.paragraphs`** — the teaching-as-laboratory idea deserves the full
  three-phase story on a page of its own or an expanded About; the homepage
  should carry a teaser only.
- **Project descriptions** are being asked to do case-study work in one
  sentence. Shorten on the homepage, expand on the detail page.
- **The technology lists inside `services.items`** belong in the individual
  case studies where they can be attached to something concrete.
- **`lab.lead`'s explanation** of what a lab entry is — the entries
  demonstrate it; the Lab index page can carry the framing instead.

---

## Conclusions driving Iteration 3

1. The site's structure is finished; its **content depth is not**. Three
   projects have no case study at all.
2. Two schema fields (`learning`) and one whole relationship (`relatedProject`)
   are **built but unused** — cheap depth already paid for.
3. The homepage **over-explains** and the detail pages **under-explain**. The
   fix is redistribution, not more words.
4. Nothing on the site is **seen**, only described. Assets are the highest-
   leverage missing input, and they are the one thing that must come from
   Denis rather than from code.
