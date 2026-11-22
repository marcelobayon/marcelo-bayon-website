# Updating your résumé (no local setup needed)

All the résumé text — the 3D station cards, the text résumé, and the home
page — comes from **one file**:

```
src/data/resume-content.ts
```

Edit that file and the whole site updates. You can do it entirely from your
browser; you don't need to install anything.

## The 60-second way (GitHub web editor)

1. Go to the file on GitHub:
   **https://github.com/marcelobayon/marcelo-bayon-website/blob/Marcelobayon/src/data/resume-content.ts**
2. Click the **pencil icon** (✏️ "Edit this file") at the top right.
3. Make your change (see the examples below).
4. Scroll down, click **Commit changes**.
5. Netlify rebuilds automatically. Your edit is live in **~1–2 minutes**.

You can do this from your phone too.

## It's safe to experiment

If you make a typo that breaks the file (a missing comma or quote), **the build
fails and the live site keeps the last good version** — nothing breaks in
public. You'll see a red ✗ on that deploy in your Netlify dashboard; just fix
the line and commit again. A green ✓ means it went live.

## What's in the file

| Section | What it controls |
| --- | --- |
| `PROFILE` | Name, headline, tagline, intro, location, email, links |
| `EXPERIENCE` | Jobs — title, org, dates, summary, bullet `highlights`, `tech` |
| `EDUCATION` | Schools / training |
| `SKILL_GROUPS` | The skill chips, grouped |
| `VENTURES` | Your projects + their `status` label |
| `PUBLICATIONS` | Books |
| `CERTIFICATIONS` | Licenses / certs |
| `SUMMIT` | The "Where I'm pointed" statement + values |
| `STATIONS` | The six chapter names/labels (rarely need changing) |

## Common edits

**Fix a job title or dates** — find the role in `EXPERIENCE` and change the
text inside the quotes:

```ts
title: "Software Development Engineer I",
period: "May 2021 – Feb 2023",
```

**Add a bullet to a job** — add a line inside that job's `highlights: [ ... ]`,
each in quotes, ending with a comma:

```ts
highlights: [
  "Existing bullet.",
  "Your new bullet goes here.",
],
```

**Change a venture's status** — edit its `status`. Allowed values:
`"concept"`, `"prototype"`, `"in-development"`, `"live"`.

```ts
status: "live",
```

**Update contact** — in `PROFILE`:

```ts
email: "marcelo@marcelobayon.com",
links: {
  github: "https://github.com/marcelobayon",
  linkedin: "https://www.linkedin.com/in/your-handle",  // add this line to show LinkedIn
  site: "https://marcelobayon.com",
},
```

## The three rules that keep it from breaking

1. **Keep the quotes** `"like this"` around every piece of text.
2. **Keep the commas** at the end of each line inside a list or object.
3. **Don't delete brackets** `[ ]`, `{ }`, or `( )` — only edit what's between them.

## Open items to confirm

The bottom of `resume-content.ts` has a `CONTENT_NOTES` comment listing the few
facts set conservatively (Amazon title, UDAF end date, older-role dates, the
omitted Colorado College entry, contact details, book titles). Update those when
you've confirmed them.

---

*Want a nicer form-based editor instead of editing the file? A git-based CMS
(e.g. Decap) can be added at `/admin` later — it needs a one-time auth setup on
your GitHub/Netlify account.*
