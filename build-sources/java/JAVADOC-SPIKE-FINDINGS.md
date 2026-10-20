# JavaDoc styling spike — findings

**Date:** 2026-10-15
**Question:** can the Splunk style built for the Python SDK (Sphinx) be applied
or approximated closely enough on the Java SDK (JavaDoc) that the two read as
siblings?

**Answer: yes — conditional on one change, which is cheaper than it sounds.**

Built from the real `splunk-sdk-java` sources (166 source files → **187 HTML
pages** for the current version) using JDK 21's javadoc, with the Splunk
overlay applied. Output is in `javadoc-branded/`; `theme/splunk-javadoc.css`
is the overlay.

---

## The condition: the javadoc *tool* must be modern

This is the whole finding, so it goes first.

**JDK 21's javadoc builds its stylesheet on 34 CSS custom properties.** Its
own `:root` block declares `--body-text-color`, `--body-background-color`,
`--link-color`, `--navbar-background-color`, `--block-font-family`,
`--code-font-family`, `--selected-background-color`, `--border-color`, and so
on — each one commented and clearly intended as a theming surface. That makes
JavaDoc restylable by *exactly* the same technique used for Sphinx: remap the
generator's own tokens onto `@splunk/themes` values. Combined with
`--add-stylesheet` (JDK 10+), which layers additively and leaves JavaDoc's own
stylesheet intact, this is a low-risk overlay rather than a fork.

**But `splunk-sdk-java` does not currently generate docs with a modern JDK.**
`.github/workflows/release.yml` pins:

```yaml
- name: Set up JDK 1.8
  uses: actions/setup-java@v1
  with:
    java-version: 1.8
```

JDK 8's javadoc emits a **frameset**, a fixed stylesheet with no custom
properties, and far fewer semantic class names. It is not restylable this way;
you would be fighting it with brittle selector overrides.

Corroborating evidence that the currently-published docs really are the
frames-based JDK 8 output: dev.splunk.com's own content links into them using
the frameset query form, e.g.
`docs.splunk.com/DocumentationStatic/JavaSDK/1.9.1/index.html?com/splunk/User.html`.
That `index.html?path` shape only exists for frame-based javadoc.

### Why the condition is cheap

Documenting with a newer JDK does **not** force a compatibility change in the
library. The javadoc tool version is independent of the bytecode target — you
can run JDK 21's javadoc while still compiling for Java 8 via `--release 8`
(or `-source 8 -target 8`). So this is a CI change in the docs job, not a
support-matrix decision for the SDK. Worth stating plainly when you raise it,
because "upgrade the JDK" sounds like a breaking change and here it isn't.

Side benefit, unrelated to styling: modern javadoc also drops frames, which is
what made the current pages uncrawlable and unindexable in the first place.

---

## What came out matching, with no per-selector fighting

Driven entirely by the token remap, using the same values as the Sphinx
overlay (`@splunk/themes` v1.12, `family="prisma"`, `density="comfortable"`):

Typography (both generators now on the Splunk sans and mono stacks at a 15px
base), body and heading text colors, surface whites and greys, the `#0264d7`
link blue, the 4px border radius, table row banding, and the masthead — which
is byte-identical markup and identical class names across both generators,
so the two sites share one chrome definition.

The single largest divergence fixed by the remap: **JavaDoc defaults
`--block-font-family` to a serif** (`'DejaVu Serif', Georgia, "Times New
Roman"`). Doc comment prose therefore renders serif out of the box while
Sphinx renders sans. Unifying that one token is most of the "look like
siblings" win.

Second largest: JavaDoc's default navbar is a saturated slate blue
(`#4D7A97`) that is neither Splunk nor neutral. Flattened to the portal's
surface colors so the Splunk masthead is the only chrome carrying brand color.

**Search parity holds.** JDK 21 javadoc ships its own client-side search
(`search.html` plus a generated index), the same as Sphinx's `searchindex.js`.
So the "see, there is search" demo works on both kits with no backend
dependency.

---

## Residual divergences — honest list

These are things JavaDoc hardcodes outside its token surface, or that have no
JavaDoc equivalent. All are cosmetic and none blocks the approach.

**No dark scheme.** JavaDoc 21's tokens are single-scheme; there is no
built-in dark mode and no `prefers-color-scheme` handling. Furo gives the
Python site light *and* dark for free. So either the Java site ships
light-only (an asymmetry users may notice), or the overlay adds a dark block
plus a toggle by hand. Worth an explicit product decision rather than a
default.

**Summary-table captions** ("Field Summary", "Method Summary") still render
with a weight and slant that diverges from the Sphinx section headings. The
rule sits outside the token surface and needs a selector override — small, not
yet done.

**Selected-tab treatment.** `--selected-background-color` is currently mapped
to Splunk orange, which is on-brand but reads loud at the size JavaDoc uses it
(the "Fields" tab). Consider a subtler treatment — an underline or tinted
background instead of a solid fill.

**The search row** is full-bleed and sits awkwardly above the content column;
JavaDoc's `.nav-list-search` layout needs a small override to respect the
67.75rem measure.

**Brand font.** Same open question as the Python kit: the real Splunk Data
Sans is served from dev.splunk.com's own origin, so Pages falls back to
Helvetica/Arial until the woff files are vendored — a licensing question, not
a technical one.

---

## A constraint worth knowing: javadoc rejects inline JavaScript

Passing the masthead through `-top` fails if the markup contains any script:

```
error: option -top contains JavaScript.
```

The version selector's `onchange` handler trips this. It can be permitted with
`--allow-script-in-comments` (which is what this spike used), but that flag
also disables javadoc's XSS guard for *doc comments* generally — acceptable
for first-party source, but it is a conscious security tradeoff rather than a
free switch.

This constraint is what shapes the version-selector design below, and it
argues against inline handlers in the injected chrome.

---

## Implication for the version selector

The spike changes the right answer here.

As built for the Python POC, the selector is a plain `<select>` rendered by a
Jinja template at build time, with the version list hardcoded in `conf.py`'s
`html_context`. That is fine for a demo and wrong for production, for two
reasons.

**It goes stale permanently.** Each version's docs are built once and
published independently. The pages for 2.1.0 can never learn that 3.0.1
shipped afterwards, so the selector on every historical version is frozen at
whatever was current when it was built. Fixing that by rebuilding all live
versions on every release is expensive and assumes old tags still build.

**It would need three implementations.** Jinja for Sphinx, a `-top` string for
JavaDoc, something else again for JSDoc — three copies of one component,
drifting apart.

So the right shape is a **single self-contained component, injected
post-build**:

1. Publish a `versions.json` manifest at each site root, e.g.
   `splunk.github.io/splunk-sdk-python/versions.json`, rewritten on each release.
2. Ship one small JS file that fetches that manifest at runtime and populates
   the selector, plus the shared CSS (already generator-agnostic — it is just
   a palette, type scale, and masthead).
3. Inject the markup and `<script src>` into generated HTML with a small
   post-build step, run identically against Sphinx, JavaDoc and JSDoc output.

That gets you: historical builds that automatically show the current version
list without rebuilding, one component instead of three, and no inline
JavaScript — which sidesteps `--allow-script-in-comments` entirely. The same
post-processor is also the natural place to inject the `<meta
name="description">` tags and `rel=canonical` promised to the Fusion team, and
to generate `sitemap.xml`.

---

## Reproducing this spike

```bash
# JDK 21 (the javadoc tool is what matters; compile target can stay at 8)
curl -sL -o jdk21.tar.gz \
  "https://api.adoptium.net/v3/binary/latest/21/ga/linux/aarch64/jdk/hotspot/normal/eclipse"
mkdir -p jdk && tar xzf jdk21.tar.gz -C jdk --strip-components=1

# deps, so javadoc can resolve the SDK's imports
M=https://repo.maven.apache.org/maven2
curl -sL -o gson.jar        $M/com/google/code/gson/gson/2.8.9/gson-2.8.9.jar
curl -sL -o opencsv.jar     $M/net/sf/opencsv/opencsv/2.3/opencsv-2.3.jar
curl -sL -o commons-cli.jar $M/commons-cli/commons-cli/1.2/commons-cli-1.2.jar

./jdk/bin/javadoc -quiet -Xdoclint:none -d out \
  -classpath "gson.jar:opencsv.jar:commons-cli.jar" \
  -sourcepath splunk/src/main/java -subpackages com.splunk \
  -windowtitle "Splunk SDK for Java" \
  -doctitle "Splunk SDK for Java API Reference" \
  --add-stylesheet theme/splunk-javadoc.css \
  -top "$(cat top.html)" \
  --allow-script-in-comments -notimestamp
```

In the real build this becomes `maven-javadoc-plugin` configuration
(`<additionalOptions>` for `--add-stylesheet` and `-top`), and the poms
currently pass **none** of `-doctitle`, `-windowtitle`, `-stylesheetfile` or
`-link` — so all of it is greenfield rather than a modification of existing
config.
