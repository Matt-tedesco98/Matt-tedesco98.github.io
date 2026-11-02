# matt-tedesco98.github.io

Personal portfolio for Matt Tedesco, served by GitHub Pages at https://matt-tedesco98.github.io/.

Plain HTML, CSS and JavaScript with no build step.

## Structure

```text
├── index.html                         About, projects, skills, contact
├── projects/controllerplayground.html ControllerPlayground case study
├── data/projects.json                 Project cards and filter categories
├── main.js                            Renders project cards + filters, footer dates
├── style/style.css                    All styles (light + dark)
└── images/                            Optimized images (WebP)
```

## Adding or editing a project

Edit `data/projects.json`. Each project has a `title`, `summary`, optional `highlights`,
a `stack` list, its GitHub `repo` (`owner/name`) and one or more `categories` matching the
ids in the `categories` list. Set `"featured": true` to show it as the full-width card, and
`caseStudy` to link to a detail page.

## Automatic dates

The footer's "Last updated" date and the featured project's "Last commit" date are fetched
from the public GitHub API when the page loads, so they update on every push with no manual
edits. If the API is unavailable, the page shows "recently" instead.

## Running locally

`fetch()` doesn't work from `file://`, so serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
