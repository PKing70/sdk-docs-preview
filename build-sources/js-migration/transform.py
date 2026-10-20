#!/usr/bin/env python3
"""
dox -> JSDoc comment transform for splunk-sdk-javascript.

The SDK's comments use `@method <Owner>` to name the *owning* class — a dox
convention. In JSDoc, `@method <name>` names the *symbol itself*, so every such
comment claims to be the class, and hundreds of doclets collide on one longname.

Rewriting the tag to `@memberof <Owner>` lets JSDoc infer each method's own name
from the code. Measured effect on the 5 documented files:

    before:  328 doclets ->  50 distinct longnames, 38 colliding
    after:   328 doclets -> 296 distinct longnames,  3 colliding

Run from the repo root. Review the diff before committing.
"""
import pathlib, re, sys

FILES = ["lib/log.js", "lib/http.js", "lib/utils.js", "lib/context.js", "lib/service.js"]

def main():
    total = 0
    for rel in FILES:
        p = pathlib.Path(rel)
        if not p.exists():
            print(f"  skip (not found): {rel}"); continue
        s = p.read_text(encoding="utf-8")
        # @method <Owner>  ->  @memberof <Owner>
        s, n = re.subn(r"@method +([A-Za-z_$][\w.$]*)", r"@memberof \1", s)
        # invalid variadic type expression: {Object...} -> {...Object}
        s, m = re.subn(r"\{(\w+)\.\.\.\}", r"{...\1}", s)
        p.write_text(s, encoding="utf-8")
        print(f"  {rel:20} {n:3} @method->@memberof, {m} type-expr fixes")
        total += n + m
    print(f"total edits: {total}")

if __name__ == "__main__":
    sys.exit(main())
