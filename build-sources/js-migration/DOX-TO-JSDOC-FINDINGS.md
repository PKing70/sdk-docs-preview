# Moving splunk-sdk-javascript from dox to JSDoc — mock and findings

**Date:** 2026-10-15
**Question:** can the JS SDK drop its bespoke dox pipeline and use JSDoc like
`splunk-javascript-logging` and `splunk-bunyan-logger`, for modernization and
cross-kit consistency?

**Answer: yes, and the bulk of it is one mechanical transform.** Proven by
running JSDoc 4.0.5 against the real `splunk-sdk-javascript` sources. Working
output is in `jsdoc-mock/` (85 pages); the migration artifacts are in
`migration/`.

---

## What's being replaced

The current pipeline, from `bin/cli.js`:

| Layer | What it is |
|---|---|
| `contrib/dox/dox.js` | dox **0.1.2** — TJ Holowaychuk, 2011, MIT. Vendored. A *parser only*: comments → JSON, no HTML. |
| `contrib/dox/markdown.js` | **showdown.js** — 2007 JavaScript port of Markdown. Vendored. |
| `contrib/dox/doc_builder.js` | First-party Splunk code, ~11KB. |
| 3 × `*.mustache` | First-party templates — the actual HTML surface. |
| `bin/docs/assets/` | **Bootstrap 2.x** (3,990-line `bootstrap.css`), jQuery, glyphicons-halflings PNG sprites. |

It documents exactly five files: `lib/log.js`, `lib/http.js`, `lib/utils.js`,
`lib/context.js`, `lib/service.js` — 328 doc comment blocks.

Every upstream component is unmaintained: dox since ~2015, showdown's vendored
copy is from 2007, and Bootstrap 2 was superseded in 2013.

---

## The tag vocabulary is already almost entirely JSDoc-compatible

Counted across the five documented files:

| Tag | Uses | JSDoc? |
|---|---|---|
| `@param` | 366 | yes |
| `@method` | 247 | yes — **but with different semantics, see below** |
| `@return` | 144 | yes (synonym for `@returns`) |
| `@example` | 87 | yes |
| `@endpoint` | 73 | **no — custom to this SDK** |
| `@constructor` | 37 | yes |
| `@class` | 37 | yes |
| `@function` | 34 | yes |
| `@extends` | 28 | yes |
| `@see` | 11 | yes |
| `@protected` | 8 | yes |
| `@private` | 6 | yes |
| `@returns` | 2 | yes |
| `@module` | 2 | yes |

Thirteen of fourteen tags are standard. Only `@endpoint` — which records the
Splunk REST endpoint each method calls, and is genuinely valuable reference
information — is bespoke.

---

## The one real incompatibility: `@method` means something different

This is the whole finding.

The SDK writes comments like:

```js
/**
 * Creates a specialized version of the current `Service` instance …
 * @memberof splunkjs.Service        <-- actually written as @method splunkjs.Service
 */
specialize: function(owner, app) { … }
```

In **dox**, `@method <Owner>` was used to declare the class the comment belongs
*to* — dox never modelled code structure, it just listed comment blocks and let
the mustache templates group them.

In **JSDoc**, `@method <name>` names *the symbol itself*. So every one of those
247 comments tells JSDoc "this symbol is called `splunkjs.Service`", and
hundreds of doclets collide on a handful of names.

Measured, before any changes:

```
328 documented doclets  ->  50 distinct longnames,  38 colliding
    27 × splunkjs.Utils
    21 × splunkjs.Service
    20 × splunkjs.Service.Job
    17 × splunkjs.Service.Entity
    …
```

JSDoc still resolved 37 correctly-namespaced classes and 240 members of
`splunkjs.Service` in its doclet graph — but the template rendered only 7
content pages, because it cannot place symbols whose names conflict.

### The fix, and its measured effect

Rewriting `@method <Owner>` → `@memberof <Owner>` lets JSDoc infer each
method's own name from the code that follows it. One regex, 247 occurrences:

```
before:  328 doclets ->  50 distinct longnames, 38 colliding   (7 pages)
after:   328 doclets -> 296 distinct longnames,  3 colliding  (79 pages)
```

All 37 classes get their own pages, and `@endpoint` values attach to the right
symbols instead of piling onto the class:

```
before:  splunkjs.Service -> apps/local        (and 20 others, all on one name)
after:   splunkjs.Service.apps           -> apps/local
         splunkjs.Service.configurations -> configs
         splunkjs.Service.indexes        -> data/indexes
         splunkjs.Service.savedSearches  -> saved/searches
```

`migration/transform.py` performs this, plus one invalid variadic type
expression (`{Object...}` → `{...Object}`, which JSDoc reports as an error).

---

## What's in `migration/`

| File | Purpose |
|---|---|
| `transform.py` | The `@method`→`@memberof` rewrite plus the type-expression fix. Run from repo root; review the diff. |
| `endpoint-tag.js` | 15-line JSDoc plugin preserving `@endpoint`. Verified: captures all 73. |
| `_namespace.jsdoc.js` | Doc-only file declaring `@namespace splunkjs` and `splunkjs.private`. The SDK attaches classes to a root JSDoc cannot infer from the closure idiom; without this the classes resolve but render no pages. Additive — no source change. |
| `jsdoc.json` | Minimal JSDoc config wiring the plugin and source path. |

---

## Remaining work, bounded and named

**35 comments need membership declared.** `utils.js` has 30 comment blocks and
zero `@method` tags, so nothing told dox *or* JSDoc what they belong to — they
all collapse onto `splunkjs.Utils` (27 collisions). Same for `splunkjs.Logger`
(6) and `splunkjs.Http` (2). These need `@memberof` added by hand, in three
files. The collision count is a precise regression metric: it should reach zero.

**36 spurious `.init` pages.** The SDK's `Class.extend`-style constructor is
`init: function()`, so `@memberof <Class>` makes JSDoc emit a
`<Class>.init` symbol and page for each. Fix by marking those blocks
`@constructor` (JSDoc then folds them into the class page) or excluding them in
a plugin. 36 occurrences, one line each, or one plugin rule.

**Styling is not solved by this.** JSDoc's default template has **zero** CSS
custom properties — 11 hardcoded colors and 9 `font-family` declarations across
a 358-line, 64-rule stylesheet — so the token-remap technique that worked for
Sphinx/Furo and JDK 21 JavaDoc does not apply. Branding JSDoc means either
selector-level overrides against those hardcoded values (bounded, since the
stylesheet is small, but brittle across JSDoc upgrades) or writing a custom
template via `jsdoc -t`. I checked the two common third-party templates as
alternatives: `docdash` also hardcodes its colors, and `clean-jsdoc-theme`
ships only compiled `dist/publish.js` with no inspectable CSS.

Note this styling problem is **shared with the two logging kits**, which
already use JSDoc. So solving it once covers three of the six kits — which is
itself an argument for making the JS SDK the third JSDoc consumer rather than
keeping it on dox.

---

## Verdict

The migration is mechanically viable and cheaper than it looks. The comment
*content* survives intact — 328 of 328 blocks parse, and 326 were already
producing valid doclets before any edits. There is no re-authoring of
documentation prose. What's needed is: one regex across five files, 35
hand-added `@memberof` tags, 36 constructor annotations, a 15-line plugin, and
a doc-only namespace file. Call it a day or two of SDK-dev work, fully
mechanical, with an objective pass/fail metric (zero colliding longnames).

Against that cost: three abandoned upstream dependencies retired, Bootstrap 2
and jQuery dropped, and all three JavaScript kits converged on one toolchain
and one template fix.

The thing to decide separately is the styling approach for JSDoc, since it
behaves differently from the other two generator families and affects three
kits at once.

---

## Reproducing

```bash
git clone --depth 1 https://github.com/splunk/splunk-sdk-javascript.git
cd splunk-sdk-javascript
npm install jsdoc@^4

cp /path/to/migration/transform.py .
python3 transform.py                      # review the diff

mkdir -p jsdoc-plugins
cp /path/to/migration/endpoint-tag.js jsdoc-plugins/
cp /path/to/migration/_namespace.jsdoc.js lib/
cp /path/to/migration/jsdoc.json .

npx jsdoc -c jsdoc.json -d out

# collision metric — should trend to zero
npx jsdoc -c jsdoc.json -X > doclets.json
python3 -c "
import json
from collections import Counter
d=[x for x in json.load(open('doclets.json')) if not x.get('undocumented') and x.get('longname')]
c=Counter(x['longname'] for x in d)
print(len(d),'doclets ->',len(c),'distinct,',sum(1 for v in c.values() if v>1),'colliding')"
```
