# Contributing

Thanks for helping out! Issues and pull requests are welcome, especially tables that don't convert the way you'd expect.

## Reporting a table that doesn't convert well

Open an issue with:

- the table as text (not a screenshot), inside a code block,
- where it came from (tool and version, e.g. Claude Code, MySQL 8, `kubectl`),
- what you got and what you expected.

**Don't paste private data.** Replace real values with made-up ones; only the table's shape matters.

## Development

Tool versions are pinned in `mise.toml` and managed by [mise](https://mise.jdx.dev). CI uses the same file.

```sh
mise install         # installs the pinned Node.js
npm install
npm run dev          # http://localhost:5173
```

| Script            | What it does                                                   |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                                     |
| `npm test`        | Unit tests (Vitest); `npm run test:watch` to keep them running |
| `npm run check`   | Type-check (`svelte-check` + `tsc`)                            |
| `npm run lint`    | Check formatting (Prettier)                                    |
| `npm run format`  | Fix formatting                                                 |
| `npm run build`   | Production build in `dist/`, prerendered                       |
| `npm run preview` | Serve the production build locally                             |

Before opening a pull request, make sure `npm run check`, `npm test`, `npm run lint` and `npm run build` all pass. CI runs the same checks.

## Project structure

```
src/
  lib/
    parse.ts          finds tables in pasted text and reads them into a grid
    table.ts          shared types; grid -> table (header, wrapped cells)
    format.ts         every output format, as pure functions
    examples.ts       built-in examples for the "Load an example" menu
    *.test.ts         tests next to the code they cover
    *.svelte          UI components
  App.svelte          the page
scripts/
  prerender.ts        renders the page into dist/index.html after the build
  render-images.sh    regenerates the social preview image and touch icon
design/               HTML sources for those images
public/               static files copied as-is (favicon, robots.txt, sitemap)
```

The core is plain TypeScript with no UI dependencies: text goes through `findTables()` → `toTable()` → a format's `render()`. Most changes only touch those files and their tests.

### Adding an output format

1. Write a `(table, options) => string` function in `src/lib/format.ts`.
2. Add an entry to `FORMATS` (id, label, group, hint). The UI picks it up automatically.
3. Add a test with the exact expected output to `src/lib/format.test.ts`.

### Supporting a new kind of input table

1. Teach `src/lib/parse.ts` to recognise and read it, and add its kind to `Kind` / `KIND_LABELS` in `src/lib/table.ts`.
2. Add tests to `src/lib/parse.test.ts`, ideally with real output from the tool (made-up values are fine).
3. List it under "Supported inputs" in `src/App.svelte` and the README.

### Example and test data

Use invented, neutral data only. Never real customer, company or personal data.

### Code style

- Prettier decides formatting (`npm run format`).
- Keep it small: prefer the platform and the standard library over new dependencies.
- Comment only what the code can't say itself (the _why_, not the _what_).

## Images

`public/og-image.png` (1200×630 social preview) and `public/apple-touch-icon.png` are generated from `design/*.html`. After editing those, run:

```sh
./scripts/render-images.sh   # macOS, needs Google Chrome
```

Keep the preview image under 300 KB; WhatsApp drops larger ones.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which checks, tests, builds and publishes to GitHub Pages at [table.berkkaraal.com](https://table.berkkaraal.com).

One-time setup (maintainer):

1. **Settings → Pages → Source**: GitHub Actions.
2. **Settings → Pages → Custom domain**: `table.berkkaraal.com`, then **Enforce HTTPS**.
3. DNS: a `CNAME` record `table` → `berk-karaal.github.io`.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
