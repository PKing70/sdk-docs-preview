# Deploying this preview to GitHub Pages

A ready-to-push tree: six built, Splunk-styled SDK reference sites plus a
landing page. 301 HTML pages, 19 MB. No build step, no pipeline — just static
files, which is the point for a first preview.

Target: `https://pking70.github.io/sdk-docs-preview/`

---

## The two things that actually matter

**1. `.nojekyll` is mandatory, not optional.**

GitHub Pages runs Jekyll by default, and Jekyll **silently ignores any
directory whose name starts with an underscore**. Sphinx puts all of its CSS,
JS and fonts in `_static/` (and sources in `_sources/`). The Python kit makes
99 references to `_static/`, so without this file that site publishes
completely unstyled and the failure gives you no error — just a plain-text-
looking page.

An empty `.nojekyll` at the repo root disables Jekyll entirely. It is already
included here. It is also easy to lose: it is a dotfile, so `cp -r` and some
file managers skip it. Verify after any copy:

```bash
ls -la | grep nojekyll
```

The JavaDoc and JSDoc kits do not use underscore directories, so this only
breaks Python — which is exactly the kind of partial failure that is confusing
to debug.

**2. Everything else is already subpath-safe.**

I checked all six kits for absolute asset paths (`href="/…"`, `src="/…"`),
which would break when served from `/sdk-docs-preview/…` instead of the domain
root. **Zero across all six** — every generator emits relative paths. So the
same tree works unchanged at any depth: a personal-account subpath now, and
`splunk.github.io/<repo>/` later.

That is worth knowing because it means the production move is a copy, not a
rebuild.

---

## Deploy

The tree currently lives in the session outputs folder, which is temporary.
Copy it somewhere durable first:

```bash
cp -R "<outputs>/pages-preview" ~/sdk-docs-preview
cd ~/sdk-docs-preview
ls -la | grep nojekyll        # confirm the dotfile survived the copy
```

Then, with the GitHub CLI:

```bash
git init -b main
git add -A
git commit -m "Splunk SDK reference docs - preview build"
gh repo create PKing70/sdk-docs-preview --public --source=. --push
```

Or without `gh` — create the repo on github.com first, then:

```bash
git init -b main
git add -A
git commit -m "Splunk SDK reference docs - preview build"
git remote add origin https://github.com/PKing70/sdk-docs-preview.git
git push -u origin main
```

Enable Pages: repo **Settings → Pages → Build and deployment**, Source
*Deploy from a branch*, Branch `main`, folder `/ (root)`, Save.

First publish takes a minute or two. Pages URLs are lowercase regardless of
your username's capitalisation:

```
https://pking70.github.io/sdk-docs-preview/
```

### Note on public vs private

Pages on a **private** repo requires GitHub Pro or Enterprise. If you'd rather
not make it public, check your plan first — otherwise Pages silently won't
enable. For a preview with no proprietary content, public is simplest.

---

## What to check once it's live

In rough order of what's most likely to reveal a problem:

**Does the Python kit have styling?** This is the `.nojekyll` canary. Open
`/splunk-sdk-python/` — if it looks like unstyled HTML, Jekyll ate `_static/`.

**Does in-page search work?** Sphinx ships `searchindex.js`, JavaDoc ships
`search.html` plus an index, and both are client-side, so they should work with
no backend. Try `/splunk-sdk-python/search.html?q=Service` and the search box
on a JavaDoc page. This is the "see, there is search" half of the demo and it
needs no Fusion involvement at all.

**Do deep links resolve?** e.g.
`/splunk-sdk-java/com/splunk/Service.html` — confirms nested paths survive.

**Do the masthead and version selector render?** They should look identical
across all six kits.

---

## Known-broken in this preview, by design

The version-selector options and a couple of masthead links point at absolute
`https://splunk.github.io/<repo>/...` URLs, because that is where production
will live. On the preview they lead nowhere. That is expected and is called out
on the landing page.

If you'd rather they worked for the demo, each is one config value:

| Kit | Where |
|---|---|
| Python | `html_context["splunk_docs_base"]` in `docs/conf.py` |
| Java | the `-top` HTML string passed to javadoc |
| JSDoc kits | `conf.splunk.docsBase` in `jsdoc.json` |

Not worth changing unless someone will click them, since production is the
real target.

---

## One content bug worth fixing before anyone important sees it

`splunk-sdk-python`'s `searchcommands.html` documents three attributes —
`app_file`, `app_root` and `splunk_home` — whose values are **the build
machine's filesystem paths**. In this build they read
`/sessions/…/.local/bin/sphinx-build`.

Cause is in the SDK, not the theme or the build config.
`splunklib/searchcommands/environment.py:136`:

```python
app_file = getattr(sys.modules["__main__"], "__file__", sys.executable)
```

Sphinx autodoc imports the module to document it, so at import time `__main__`
is `sphinx-build` and that path gets captured as the documented default.
`app_root` and `splunk_home` derive from it.

This is **not** introduced by the migration — it affects any machine that
builds these docs, so the currently published docs almost certainly show a
Splunk build-agent path. I could not confirm that directly because
docs.splunk.com returns 403 for direct `DocumentationStatic` access.

Fix options, for the SDK devs rather than you: mark the three attributes
`:meta private:`, exclude them via `autodoc_default_options`, or give them
explicit documented values. Smallest change is adding to `docs/conf.py`:

```python
autodoc_default_options = {"exclude-members": "app_file,app_root,splunk_home"}
```

---

## Deliberately not here

No GitHub Actions workflow, and no connection to the real SDK repos. This is a
hand-built static snapshot, which is the right shape for answering "what does
publishing take?" Automating the build-and-publish step comes after the
preview has served its purpose.
