---
title: SplunkBunyanStream
kind: typedef
longname: SplunkBunyanStream
---

# SplunkBunyanStream

<SourceLink href="/source/index-js/#L219" label="index.js:219" />

**Properties**

- `level` (string) — The logging level for Bunyan.
- `type` (string) — Always `raw`.
- `on` (function) — Takes an `event` string, and a callback function. The most useful event to listen for is `error`. See [Node.js events](https://nodejs.org/api/events.html#events_emitter_on_event_listener) documentation.
- `setEventFormatter` (function) — Overrides the eventFormatter for the underlying SplunkLogger. Takes a callback function parameter: `function(message, severity)`, where message is an object, and severity is a string.
- `on` (function) — Adds a listener to to the SplunkStream object, typically used for the error event.
- `flush` (function) — Manually sends all queued events to Splunk in a single HTTP request. Takes a callback function parameter: `function(err, response, body)`.
- `stream` ([SplunkStream](/splunkstream)) — See [SplunkStream](/splunkstream)
