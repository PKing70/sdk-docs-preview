# Splunk SDK reference documentation — GitHub Pages preview

A preview of the six Splunk SDK and logging-library API references rendered as
standalone GitHub Pages sites with consistent Splunk branding.

**Live:** https://pking70.github.io/sdk-docs-preview/

## Why this exists

The SDK reference docs are currently published to docs.splunk.com, served
inside an iframe under that site's wrapper. docs.splunk.com is being
decommissioned. The proposal is to publish each kit as a standalone site at
`splunk.github.io/<repo>/`, with dev.splunk.com acting as the reader-facing hub
that links out to them.

This repo demonstrates what that looks like, and proves the mechanics of
serving these generators from GitHub Pages. It is a hand-built static snapshot
on a personal account — not connected to the real SDK repos, and not
automated.

## Contents

| Path | Kit | Generator | Pages |
|---|---|---|---|
| `splunk-sdk-python/` | Splunk SDK for Python | Sphinx + Furo | 12 |
| `splunk-sdk-java/` | Splunk SDK for Java | JavaDoc 21 | 187 |
| `splunk-library-javalogging/` | Splunk Logging for Java | JavaDoc 21 | 42 |
| `splunk-sdk-javascript/` | Splunk SDK for JavaScript | JSDoc 4 | 49 |
| `splunk-javascript-logging/` | Splunk Logging for JavaScript | JSDoc 4 | 6 |
| `splunk-bunyan-logger/` | Splunk Bunyan Logger | JSDoc 4 | 5 |

301 HTML pages total.

## What it demonstrates

**Consistent branding across three different generators.** All six kits share
one masthead definition and one set of design tokens, taken from
`@splunk/themes` at `family="prisma"`, `density="comfortable"` — the same
configuration dev.splunk.com uses. Sphinx and JavaDoc were themed by remapping
the generator's own CSS custom properties; JSDoc exposes none, so that overlay
declares the token layer itself and overrides concrete selectors.

**In-page search with no backend.** Sphinx ships `searchindex.js` and JavaDoc
ships its own client-side search index, so search works on those kits with
nothing server-side. This decouples the migration from any search-backend work.

**Version selection.** Each masthead carries a version selector. In this
preview the options point at the future production URLs and therefore dead-end;
see the note on the landing page.

## Notes

`.nojekyll` at the root is required. GitHub Pages runs Jekyll, which ignores
underscore-prefixed directories — Sphinx keeps its assets in `_static/`, so
without that file the Python kit publishes unstyled and silently.

All six kits emit only relative asset paths, so this tree works unchanged at
any URL depth. Moving it to `splunk.github.io/<repo>/` is a copy, not a
rebuild.

See `DEPLOY.md` for the full deployment notes, verification checklist, and one
pre-existing SDK content bug worth fixing.
