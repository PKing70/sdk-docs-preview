# Python SDK agentic-docs proof of concept

This branch is an isolated workspace for exploring generated narrative docs alongside the existing SDK reference. The published site is built from static snapshots on main; this branch is not connected to the SDK source repository and is not a production publishing path.

## Pilot target

- SDK source: https://github.com/splunk/splunk-sdk-python
- Initial subject: the splunklib.ai package and its agentic_reporting_csc custom search-command example.
- Existing reference source: docs/ai.rst, built into the Python API reference.
- Context examples: splunklib/ai/README.md and examples/ai_custom_search_app/.

The proposed reader outcome is to help a Splunk app developer understand how an SDK agent can be used inside a custom search command, and whether that is a suitable pattern for their use case. This is a candidate content opportunity, not a claim that the example is ready to publish as a tutorial.

## Intended run

1. Collect a bounded evidence bundle from a selected Python SDK change or feature: the diff, linked issue or design note, relevant source, tests, examples, current API reference, and selected dev.splunk.com guides.
2. Ask a planner to recommend no change, an update, or a new tutorial, how-to guide, or explanation. The plan must name its audience and user goal, list source-backed claims, identify existing pages to link, and surface missing product intent as questions.
3. Stop for human answers when behavior, supported workflow, deployment requirements, or recommendations are unclear.
4. Draft only from the reviewed plan. Put drafts and provenance in this docs-agent area; do not edit generated reference pages or publish them.
5. Run the relevant documentation build and example checks before presenting a draft PR for review.

## Evidence rules

- SDK code, tests, and published contracts support technical behavior.
- Product decisions, feature issues, and developer scenarios support why and when a user should use a feature.
- Existing dev.splunk.com content is an editorial example and a source to check for overlap; it is not automatically proof that behavior is current.
- Every material technical claim in a draft should point to evidence. If the source set does not establish a recommendation, ask a person or omit the recommendation.

## Questions surfaced before drafting the candidate guide

The example at examples/ai_custom_search_app/bin/agentic_reporting_csc.py appears to use should_filter both as a Boolean option and as the intent text passed to the model. It also assigns the structured is_relevant result to a field named should_keep when highlight_topic is set. Confirm the intended semantics with the SDK owner before turning this example into step-by-step guidance.

The source README establishes Python 3.13+ for the AI module and mentions Splunk App deployment and model-provider credentials. Confirm the supported runtime and approved secret-storage guidance for the scenario before making those prerequisites prescriptive.

## Not implemented yet

This file records the first planning pass and intended guardrails. It does not call a model, run automatically, or create documentation drafts. The next implementation step is a manually triggered, two-stage runner that emits a source-linked plan, pauses for human answers, then creates a draft on this branch. Add API credentials only in a secret store when that runner is ready; never commit credentials here.
