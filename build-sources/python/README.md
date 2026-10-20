# Splunk SDK reference theme — Sphinx / Furo overlay

A Splunk-branded theme for the SDK reference docs, built as a token remap over
[Furo](https://pradyunsg.me/furo/) rather than a theme from scratch. Proven
against `splunk-sdk-python` (12 pages, builds clean).

## Files

| File | Purpose |
|---|---|
| `splunk-theme.css` | All branding. Remaps Furo's CSS custom properties onto Splunk design tokens, plus the masthead and archived-version banner styles. |
| `page.html` | Sphinx template override. Injects the masthead into Furo's `announcement` block. |

## Token provenance

Nothing here is eyeballed. Values were extracted from the real design system:

- **Colors, typography, metrics** — `@splunk/themes` v1.12, resolved via
  `getTheme({ family: 'prisma', colorScheme: 'light'|'dark', density: 'comfortable' })`.
  That is the exact configuration dev.splunk.com passes to `SplunkThemeProvider`
  in `src/components/ThemeProvider/ThemeProvider.tsx`.
- **Brand colors and the logo gradient** — `src/styles/CustomColors.ts`
  (orange `#F99D1C`, orange-dark `#F05A22`, pink `#EE1D62`, pink-dark `#ED0080`).
- **Content width** — `LAYOUT_MAX_WIDTH_PX = 67.75rem` from `src/styles/consts.ts`.

Resolved values, for reference:

| Token | Light | Dark |
|---|---|---|
| `backgroundColorPage` | `#f9f9f9` | `#111215` |
| `backgroundColorSection` | `#ffffff` | `#1a1c20` |
| `contentColorActive` | `#2c2c2c` | `#fafafa` |
| `contentColorDefault` | `#4d4d4d` | `#b5b5b5` |
| `contentColorMuted` | `#6b6b6b` | `#909090` |
| `borderColor` | `#8f8f8f` | `#717275` |
| `linkColor` / `focusColor` | `#0264d7` | `#3993FF` |
| `borderRadius` | `4px` | `4px` |
| `fontSize` | `0.875rem` | `0.875rem` |

Font stacks: `'Splunk Platform Sans', 'Splunk Data Sans', Roboto, Droid, 'Helvetica Neue', Helvetica, Arial, sans-serif`
and `'Splunk Platform Mono', 'Roboto Mono', Consolas, 'Droid Sans Mono', Monaco, 'Courier New', Courier, monospace`.

## Install into a kit

```bash
pip install furo
```

Copy `page.html` into `docs/_templates/` and `splunk-theme.css` into a static
dir, then in `docs/conf.py`:

```python
html_theme = "furo"
templates_path = ["_templates"]
html_static_path = ["CSS", "_static_splunk"]   # keep existing + add new
html_css_files = ["splunk-theme.css"]

html_theme_options = {
    "sidebar_hide_name": True,
    # Must be non-empty: Furo gates its announcement region on
    # `if theme_announcement`. The real markup comes from page.html.
    "announcement": " ",
}

html_context = {
    "splunk_versions": [
        ("latest", "3.0.1 (latest)"),
        ("2.1.0", "2.1.0"),
    ],
    "splunk_version_current": "latest",
    "splunk_docs_base": "https://splunk.github.io/splunk-sdk-python",
}
```

### Required conf.py cleanup

The current `splunk-sdk-python` `conf.py` is coupled to Sphinx's classic
theme. Three things must change or the build breaks or renders wrong:

1. `html_sidebars` references `globaltoc.html`, which Furo rejects outright
   with a visible error message in the sidebar. Set `html_sidebars = {}`.
2. `_templates/layout.html` does `{% extends '!layout.html' %}`, appends to
   `css_files` (a deprecated Sphinx idiom), and sets `reldelim2`, a
   classic-theme-only variable. Remove it; `page.html` replaces it.
3. `html_theme = "default"` → `"furo"`.

### Build

```bash
make docs     # or: sphinx-build -b html docs docs/_build/html
```

Two unrelated build notes for CI:

- `splunklib.ai` requires Python ≥3.13 (`requires-python = ">=3.13"`). On
  older interpreters autodoc skips it and **`sphinx-build` still exits 0** —
  the AI surface silently vanishes from the reference. Pin 3.13+ and add `-W`
  or an explicit warning gate.
- `docs/munge_links.sh` rewrites every external link to `target="_blank"`.
  That was an iframe-era workaround for docs.splunk.com; on a standalone site
  it is unnecessary. Drop it from the build.

## Design decisions

**Furo as the base, not a from-scratch theme.** Furo exposes 104 color custom
properties plus font and layout variables, ships responsive layout, keyboard
navigation, and a built-in client-side search index. Everything here is a
variable remap — no Furo selectors are overridden except the deliberate
`announcement` wrapper reset — so Furo upgrades stay low-risk.

**Search comes free.** The build emits `searchindex.js`. No backend
dependency and nothing to configure, which decouples the launch from the
Fusion indexing conversation entirely.

**The masthead goes in the `announcement` slot** rather than wrapping Furo's
`body` block, so it renders *after* the "Skip to content" link and preserves
focus order. Furo styles that wrapper as a fixed-height centered single-line
bar, so `splunk-theme.css` neutralizes it under "announcement slot reset".

**The brand gradient is a 3px hairline, not a slab.** At full-bar scale the
orange-to-pink gradient dominates a dense reference page and fights the code
blocks for attention. As a hairline it reads unmistakably Splunk without
competing with content.

**`borderColor` is applied as a tint for structural borders.** The literal
token (`#8f8f8f` light) is a divider color; on large surfaces it reads heavy.
Structural borders use `#e3e3e3` / `#2e3034`; the literal value is kept in
`--color-foreground-border` for hairlines.

### The one intentional deviation from dev.splunk.com

Body text is **`0.9375rem` (15px)** rather than the portal's `0.875rem` (14px).
14px is tuned for application chrome; API reference is long-form reading dense
with signatures, where 15px measurably reduces strain while still looking
correct beside the portal. **To take exact parity instead, set
`--font-size--normal: 0.875rem`** in `splunk-theme.css` — it is a one-line
change and the rest of the theme is unaffected. Chrome (sidebar, search,
masthead) already sits at the portal's 14px.

## Open questions

**Fonts.** dev.splunk.com serves Splunk Data Sans from `/fonts/*.woff` on its
own origin. This theme only declares the font *stack*, so GitHub Pages will
fall back to Roboto/Helvetica/Arial. Getting the real typeface means vendoring
the woff files into each repo — which is a brand-font licensing question for
whoever owns Splunk's typeface licensing, not a technical one. Worth resolving
early: it is the most visible remaining gap against the portal.

**Logo asset.** The masthead currently renders a text wordmark (`splunk>`)
with the brand gradient as a `background-clip: text` fill. Swap in the
licensed SVG logo when available — see the `TODO` in `page.html`.

**Code block treatment.** Pygments styling is currently inherited from Furo's
defaults rather than matched to Splunk's palette. I could not compare against
dev.splunk.com's actual rendered code blocks (the portal is a static export
and I only had source access), so this is the one area where "match the
baseline" is unverified. Pick an explicit Pygments style once you can see a
real portal code sample side by side.

**Version list is static.** `html_context["splunk_versions"]` is hand-
maintained here. For real use, generate it in CI from published tags, or adopt
`sphinx-multiversion`. Furo also ships a `sidebar/rtd-versions.html` partial
if you would rather put the switcher in the sidebar.

## Portability to the other five kits

The CSS is generator-agnostic — it is a palette, type scale, and masthead.
The JSDoc kits (`splunk-javascript-logging`, `splunk-bunyan-logger`,
`splunk-sdk-javascript`) will need their own template hook for the masthead
but can reuse the token block directly.

JavaDoc is the hard one. `splunk-sdk-java` and `splunk-library-javalogging`
currently pass **no** `-doctitle`, `-windowtitle`, `-stylesheetfile` or
`-link` configuration at all, so all styling there is greenfield, and JavaDoc
is markedly less themable than Sphinx. Run a JavaDoc styling spike before
promising cross-kit visual consistency to stakeholders.
