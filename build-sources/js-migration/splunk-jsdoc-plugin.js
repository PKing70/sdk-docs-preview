/**
 * JSDoc plugin for the Splunk SDK for JavaScript.
 *
 * Two jobs:
 *
 * 1. Preserve the SDK's custom `@endpoint` tag (73 uses across the five
 *    documented files), which records the Splunk REST endpoint a method calls.
 *    JSDoc silently ignores unknown tags; dox's bespoke doc_builder rendered
 *    them, hence `class="endpoint"` in ref_template.mustache. Without this the
 *    information is dropped by the migration.
 *
 * 2. Suppress the spurious `<Class>.init` symbols. The SDK uses a
 *    `Class.extend({ init: function () {…} })` idiom where `init` IS the
 *    constructor. Once `@method <Owner>` is rewritten to `@memberof <Owner>`,
 *    JSDoc resolves each of those as a separate member named `init`, producing
 *    36 junk entries in the class list and 36 junk pages. Marking them
 *    `ignore` folds them away; their `@param` documentation is still reachable
 *    from the class page because JSDoc hoists the constructor's params onto
 *    the class when `@class`/`@constructor` is present on the owner.
 *
 * Wire up via jsdoc.json:
 *     { "plugins": ["jsdoc-plugins/splunk-jsdoc-plugin.js"] }
 */

exports.defineTags = function (dictionary) {
  dictionary.defineTag('endpoint', {
    mustHaveValue: true,
    canHaveType: false,
    canHaveName: false,
    onTagged: function (doclet, tag) {
      doclet.endpoint = tag.value;
    }
  });
};

exports.handlers = {
  newDoclet: function (e) {
    var doclet = e.doclet;

    // Fold away `<Class>.init` constructor artifacts.
    if (doclet && doclet.name === 'init' && doclet.memberof) {
      doclet.ignore = true;
    }
  }
};
