/**
 * Preserves the Splunk SDK's custom `@endpoint` tag, which records the Splunk
 * REST endpoint a method calls. JSDoc ignores unknown tags; dox's bespoke
 * doc_builder rendered them (hence `class="endpoint"` in ref_template.mustache).
 * Defining it here keeps that reference information through the migration.
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
