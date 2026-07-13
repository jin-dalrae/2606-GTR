# GTR midterm site

Public multipage site served under **`/midterm/`**.

## URLs (after build)

| Path | Page |
|------|------|
| `/` | Redirect → `/midterm/` |
| `/midterm/` | Landing |
| `/midterm/research/` | Research library |
| `/midterm/gtr/` | Evidence archive (reports + PRDs) |
| `/midterm/prototype/` | Guided multi-role prototype shell |
| `/midterm/prototype1/` | Assessment (founder) |
| `/midterm/prototype2/` | Founder dashboard (interactive) |
| `/midterm/prototype2/mobile/` | Founder mobile shell |
| `/midterm/prototype3/` | Investor portfolio board |
| `/midterm/prototype4/` | Program director cohort board |
| `/midterm/vision/` | Next vision |
| `/midterm/prototype/?tab=p5` | Leaderboard (inside guided prototype) |
| `/midterm/leaderboard/` | Leaderboard full-page (also iframe target) |
| `/midterm/app/` | Full product demo |

## Commands

```bash
# Build into showcase/dist/midterm/
npm run build:midterm

# Build + local preview
npm run dev:site
# → http://localhost:5177/midterm/
```

## Source layout

- [`site/`](.) — marketing pages (landing, research notes, prototype shell, vision)
- [`../evidence/`](../evidence/) — GTR evidence archive vendored from `2606-slides/gtr`
- [`../scripts/build-midterm.mjs`](../scripts/build-midterm.mjs) — assembles `showcase/dist/midterm` and rewrites absolute paths to `/midterm/...`
