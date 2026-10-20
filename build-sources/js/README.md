# Splunk SDK reference theme — JSDoc overlay

Splunk branding for JSDoc output, matching the Sphinx (`poc-python-sdk/theme/`)
and JavaDoc (`poc-java-sdk/theme/`) overlays. Proven against the migrated
`splunk-sdk-javascript` sources: 49 pages, builds clean.

## Files

| File | Purpose |
|---|---|
| `splunk-jsdoc.css` | All branding — token layer, selector overrides, masthead. |
| `layout.tmpl` | JSDoc layout override. Links the CSS last and injects the masthead. |

## Install

```bash
npm install --save-dev jsdoc@^4
mkdir -p theme && cp splunk-jsdoc.css layout.tmpl theme/
```

`jsdoc.json`:

```json
{
  "plugins": ["jsdoc-plugins/splunk-jsdoc-plugin.js"],
  "source": { "include": ["lib"] },
  "opts": { "recurse": true },
  "templates": {
    "default": {
      "layoutFile": "theme/layout.tmpl",
      "staticFiles": { "include": ["theme/splunk-jsdoc.css"] }
    }
  },
  "splunk": {
    "product": "Splunk SDK for JavaScript",
    "docsBase": "https://splunk.github.io/splunk-sdk-javascript",
    "currentVersion": "latest",
    "versions": [["latest", "2.0.2 (latest)"], ["1.12.0", "1.12.0"]],
    "portalUrl": "https://dev.splunk.com/enterprise/docs/devtools/javascript/sdk-javascript/"
  }
}
```

`conf.default.layoutFile` and `conf.default.staticFiles` are both honored by
JSDoc's default template (`templates/default/publish.js`), so no post-build
step is needed to inject either the CSS or the masthead.

## Why this one is a selector overlay, not a token remap

The other two kits were themed by remapping the generator's *own* CSS custom
properties — JDK 21 javadoc exposes 34 of them, Furo exposes 104. **JSDoc's
default template exposes zero.** It hardcodes 11 colors and 9 `font-family`
declarations across a 358-line, 64-rule stylesheet.

So this overlay declares the Splunk token layer itself at `:root` and then
overrides JSDoc's concrete selectors with it. The *values* are identical to the
other two kits — that is what preserves cross-kit consistency — but the
mechanism is more fragile, because it depends on JSDoc's selector names rather
than a documented theming contract. Pin the JSDoc version and re-check the
overlay on upgrade.

For reference, the two common third-party templates are no better: `docdash`
also hardcodes its colors, and `clean-jsdoc-theme` ships only compiled
`dist/publish.js` with no inspectable CSS.

## What it changes

Beyond colors and type, three structural changes bring JSDoc in line with the
other kits:

**Sidebar moved to the left.** JSDoc floats `#main` left at 70% and `nav` right
at 30%. Flipped so the sidebar is a fixed left column, matching Furo. The
content column is fluid (`width: calc(100% - 15rem)`) with a max-width cap, so
a fixed sidebar plus content never exceeds the viewport.

**Headings rescaled.** JSDoc's `h1` is `'Open Sans Light'` at 48px / weight
200, which reads nothing like the Sphinx or JavaDoc titles. Brought to 2rem /
weight 700.

**Member signatures given an orange left border**, matching the treatment used
for API blocks in the other two kits.

## Two selector collisions worth knowing about

Both bit during development and both are documented inline in the CSS:

**JSDoc's sidebar is a bare `<nav>`, and so is the masthead's inner element.**
A bare `nav { … }` rule therefore hits both. All sidebar rules are scoped to
`body > nav`; and because that scoping stops them countering JSDoc's generic
`nav { float: right; width: 30% }` for the masthead, `.splunk-masthead__inner`
needs explicit `float: none; width: auto; position: static` resets. Without
them the masthead floats right at 30% width.

**JSDoc colors links via `a, a:visited, a:active`** at specificity (0,1,0),
which ties with a bare class. Masthead anchors are written as
`a.splunk-masthead__*` so they win on specificity rather than relying on source
order. (JavaDoc needed the same treatment for a different reason — it uses
`a[href]` at (0,1,1), which *beats* a bare class.)

## Backported to the other two kits

Development here surfaced a bug present in all three overlays: every masthead
flex child was `flex: none`, so below roughly 900px their intrinsic widths
exceeded the viewport and the page gained a horizontal scrollbar. Fixed in all
three by making the product name shrinkable with ellipsis
(`flex: 0 1 auto; min-width: 0`) and shedding items in priority order —
portal link at 62em, the "Version" label at 48em, product name and divider at
30em. The wordmark and version selector always survive.

## Open items

Same two as the other kits: the real **Splunk Data Sans** typeface is served
from dev.splunk.com's own origin, so GitHub Pages falls back to
Helvetica/Arial until the woff files are vendored (a licensing question); and
the masthead renders a **text wordmark** standing in for the licensed logo
asset.

JSDoc-specific: **no dark scheme.** Furo gives the Python kit light and dark
for free; JavaDoc has no dark mode at all; this overlay is light-only. If dark
mode is wanted, it has to be hand-built for both JSDoc and JavaDoc, or dropped
from the Python kit for consistency. That is a product decision.

Also JSDoc-specific: the **version list is baked in at build time** via
`conf.splunk.versions`. Historical builds will therefore show a frozen list.
The agreed production design replaces this with a runtime fetch of a
`versions.json` manifest injected post-build — see
`../DOX-TO-JSDOC-FINDINGS.md`.

## Also covers the two logging kits

`splunk-javascript-logging` and `splunk-bunyan-logger` already use JSDoc
(`"docs": "jsdoc -d docs ."`). This overlay applies to them unchanged apart
from the `conf.splunk` block, so solving JSDoc styling once covers three of the
six kits.
