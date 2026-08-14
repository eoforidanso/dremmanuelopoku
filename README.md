# Opoku for President — Akatakyie USA

A one-page campaign website for **Katakyie Dr. Emmanuel Opoku (AH69/AO356)**, candidate for
President of Akatakyie USA. Plain HTML, CSS and JavaScript — no build step, no dependencies,
no tracking. Colours, slogan and the five pillars are taken from the campaign poster.

```
site/
├── index.html      all page content
├── styles.css      navy + gold brand styling
├── script.js       mobile menu, scroll reveal, pledge form
└── assets/
    ├── poster.jpg     the original campaign poster
    ├── portrait.jpg   studio headshot, cropped 4:5
    ├── crest.jpg      OWASS crest cropped from the poster
    ├── court.jpg      multipurpose court on the OWASS campus
    ├── boulevard.jpg  the Akatakyie USA Boulevard sign
    ├── campus.jpg     members on campus in Kumasi
    ├── chapter.jpg    a chapter gathering
    ├── reunion.jpg    a reunion group photograph
    └── gala.jpg       a fundraising dinner
```

## Preview it locally

```bash
cd site && python3 -m http.server 8765
```

Then open <http://localhost:8765>. (Opening `index.html` directly in a browser also works.)

## Before it goes live — fill these in

Everything below is a placeholder. Nothing on the page invents facts about the candidate.

1. **Campaign email** — `campaign@example.org` appears twice: in `script.js`
   (`CAMPAIGN_EMAIL`, where the pledge form sends) and in the footer of `index.html`.
2. **The first hundred days** — the six commitments in the *Plan* section are a sensible
   draft, not the campaign's manifesto. Replace them with the real platform.
3. **Endorsements** — three empty slots in the *Voices* section. Only publish quotes the
   person has agreed to in writing.
4. **Delete the two grey `.note` lines** (in *Plan* and *Voices*) once the content is real —
   they are editing reminders, not page copy.
5. **Gallery captions** — the six photographs in the *Record* section are captioned by occasion,
   not by person, because nobody has confirmed who is in each frame. Add names, dates and places
   once the campaign can verify them.
6. **The crest** — still a crop out of the poster JPEG, so it is soft at large sizes. Swap in a
   clean crest file if you have one.

## Build

```bash
./build.sh
```

Assembles `dist/` — the deployable folder. The site is plain HTML/CSS/JS, so the "build" is a
copy plus a `.nojekyll` marker; there is no bundler or transpiler. `dist/` is git-ignored and
rebuilt in CI.

## Publishing

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
builds and publishes `dist/` to GitHub Pages. It needs Pages switched on once, with
**Settings → Pages → Source: GitHub Actions**.

Any other static host works too — drop `dist/` onto [Netlify](https://app.netlify.com/drop)
or Cloudflare Pages. Point the campaign's domain at it afterwards.

## Notes

- The pledge form has no backend. It opens the visitor's own email app with the details
  filled in, so no member data is stored on the site. If you would rather collect submissions
  in a spreadsheet, swap the form for a Formspree, Netlify Forms or Google Form endpoint.
- The design commits to the poster's dark navy in both light and dark system themes.
- Reduced-motion, keyboard focus, skip link and 48px touch targets are all handled.
