# Iteration 5 — Selected Work restructure

The site's positioning widened from software to include physical practice.
Technology, Learning, **Movement**, Creative Work.

## What changed

### Selected Work

| # | Project | State |
| --- | --- | --- |
| 1 | Pravo365 | unchanged — full case study + real product screenshots |
| 2 | **Web & Digital Work** | new, short entry |
| 3 | **Contemporary Circus** | new, short entry |
| 4 | Moodpack / Director | unchanged — full case study + architecture diagram |
| 5 | **Snowboarding** | new, short entry |

### Moved into the Lab

Art Learning, Digital Space / Heritage and AI Commerce Engine are no longer
Selected Work. Each is now a lab note carrying its driving question and a
condensed *what I tried / what happened / next question* in EN, CS and SK.

**Their evidence moved with them** — the point cloud and capture frame are on
the Digital Space note, the pipeline diagram on the AI Commerce note.

The Lab went from 8 entries to 11.

### Homepage

- Disciplines line: `Technology · Learning · Movement · Creative Work`
  (was `Technology × Education × AI × Creative Work`)
- New band between the hero and Selected Work: **BUILD · TEACH · MOVE ·
  EXPLORE**, localised in all six
- *What I do* → **Things I can help with**, four items → seven: Websites,
  AI & Automation, Workshops, Education, Circus, Snowboarding, Consulting
- Contact heading → *Have something in mind? / Let's talk.*

## Nothing was deleted

The three moved projects are **drafts, not deletions**. Their full case
studies — eight sections each, three locales, plus Spanish, Serbian and
Turkish short fields — are intact in Payload.

To bring one back:

1. Payload admin → **Projects** → open it (drafts are listed)
2. Set **Featured** on, give it an **Order**
3. **Publish**
4. Rebuild

Its route, prose, media and translations all return. If you also want it out
of the Lab, unpublish the matching experiment.

⚠️ Re-running `npm run restructure` will move it back into the Lab again —
the script is idempotent and re-asserts the whole arrangement. Edit
`cms/src/content/restructure.ts` first, or just do the change in the admin and
leave the script alone.

## The two thin entries

Contemporary Circus and Snowboarding carry a category, a status and one
sentence. Nothing else.

A search of `Desktop`, `Documents` and the repo found **no material for either**
— no project directory, no photographs, no video, no notes. So there is no case
study, because writing one would have meant inventing a practice.

Their pages currently read:

> Contemporary circus — an ongoing physical practice. Not written up yet.

To fill them in, tell me what is actually true — how long, teaching or
performing or both, where, and whether any photos or footage exist — and they
become full case studies like the others.

The same applies to the two lines in *Things I can help with*. They describe
the areas without claiming a service model, because what you offer in circus
and snowboarding (coaching? workshops? guiding?) was never established.

## The `ongoing` status

Project status was a software maturity ladder: experiment → prototype →
in development → live. A physical practice is none of those.

`ongoing` was added to the Projects schema and ranks alongside `live` in
`STATUS_RANK`, so the maturity meter reads as established rather than
unfinished. Labelled in all six locales.

## Fallback drift

`src/data/*.ts` still describes the **old** five projects and eight
experiments. A CMS-off build therefore produces the previous structure, not
this one.

That is expected — the fallback is an emergency net, not a mirror — but the
gap is now wide enough to matter. If it should track the new arrangement,
say so and I will regenerate the fallback files from Payload.

## Known inconsistency

`site.author.role` still reads **"Creative Technologist · Product Builder ·
Educator"**. That line predates this restructure and no longer covers
movement, but inventing a new professional title is not something I should do
on your behalf. It is the one visible line on the site that disagrees with the
new positioning. Options: leave it, drop it, or send me the wording.
