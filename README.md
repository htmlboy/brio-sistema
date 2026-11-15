# Sistema Brío

The canonical Brío 2.0 HTML, assets and PDF generator live in the private
`htmlboy/brio-source` repository under `rules/`. This public repository contains
only generated rules artifacts and the existing Sistema site. Do not edit the
rules HTML or PDF here; edit the canonical HTML and rebuild once.

- Current HTML: `/reglas/2.0/` and `/reglas/`.
- Embed: `/reglas/2.0/?embed=1` (also consumed by Online).
- Generated PDF: `/descargas/brio-2.0.pdf`.
- Existing download link: `/descargas/Brio_Reglas_Rapidas.pdf` (same PDF).
- `/reglas/1.0/` redirects to 2.0; no 1.0 rules source is retained.
- `/reglas/manifest.json` identifies the exact canonical source commit, input
  digest and checksums of the public HTML, assets and PDF.

## Update

From a clean checkout of the chosen brio-source commit, using Node 24:

```sh
npm ci --prefix rules
npx --prefix rules playwright install chromium
npm run test:rules
npm run build:rules
npm run stage:rules -- /absolute/path/to/brio-sistema
```

Review and commit the resulting public diff. In this repository, validate with
`node tools/verify-rules.mjs .`. GitHub Actions checks the same artifact before
publishing Pages. Source CI also builds and uploads the isolated artifact named
with its source SHA. No private checkout is published and no new publishing
secret is required. See `rules/README.md` in brio-source for the full contract.

The source-owned navigation bridge in `reglas/assets/navigation.js` sends the
existing React shell's rules links to the canonical HTML; its legacy compiled
JSX is not an editorial source. Reconcile that shell in the separate source
cleanup task rather than editing its minified JavaScript.

Merge the paired source migration before this publication/removal of
`rules-source/`. Changing the displayed rules does not update Online's executable
dice mechanics. The supplied 2.0 document retains its review label.
Rollback by reverting the publication commit to restore the previous artifact.

Copyright (c) 2026 Javier U. All rights reserved. Third-party components retain
their respective licenses. Font license is included with the generated assets.
