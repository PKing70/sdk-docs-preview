---
title: SplunkStream
kind: class
longname: SplunkStream
description: A class that implements a raw writable stream.
---

# SplunkStream

**Implements:&#x20;**`{@link https://nodejs.org/api/stream.html#stream_class_stream_writable|Stream.Writable}`

<SourceLink href="/source/index-js/#L53" label="index.js:53" />

A class that implements a raw writable stream.

**Properties**

- `config` (object) — Configuration settings for this `SplunkStream` instance.
- `contextQueue` (Array.\<object>) — Queue of `context` objects to be sent to Splunk.
- `error` (function) — A callback function for errors: `function(err, context)`. Defaults to `console.log` both values;

---

## Constructor

<Signature code="new SplunkStream(config: object): SplunkStream" />

**Parameters**

- `config` (object) — Configuration settings for a new `SplunkLogger`.
  - `config.token` (string) — HTTP Event Collector token, required.
  - `config.name` (string, optional, default: "splunk-javascript-logging/0.11.1") — Name for this logger.
  - `config.host` (string, optional, default: "localhost") — Hostname or IP address of Splunk server.
  - `config.maxRetries` (string, optional, default: 0) — How many times to retry when HTTP POST to Splunk fails.
  - `config.path` (string, optional, default: "/services/collector/event/1.0") — URL path to send data to on the Splunk server.
  - `config.protocol` (string, optional, default: "https") — Protocol used to communicate with the Splunk server, `http` or `https`.
  - `config.port` (number, optional, default: 8088) — HTTP Event Collector port on the Splunk server.
  - `config.url` (string, optional) — URL string to pass to [url.parse](https://nodejs.org/api/url.html#url_url_parsing). This will try to set `host`, `path`, `protocol`, `port`, `url`. Any of these values will be overwritten if the corresponding property is set on `config`.
  - `config.level` (string, optional, default: "info") — Logging level to use, will show up as the `severity` field of an event, see `SplunkLogger.levels` for common levels.
  - `config.batchInterval` (number, optional, default: 0) — Automatically flush events after this many milliseconds. When set to a non-positive value, events will be sent one by one. This setting is ignored when non-positive.
  - `config.maxBatchSize` (number, optional, default: 0) — Automatically flush events after the size of queued events exceeds this many bytes. This setting is ignored when non-positive.
  - `config.maxBatchCount` (number, optional, default: 1) — Automatically flush events after this many events have been queued. Defaults to flush immediately on sending an event. This setting is ignored when non-positive.

---

## Instance Methods

<MemberHeading id="send" depth="3" name="send" sig="send()" />

<MemberMeta sourceHref="/source/index-js/#L80" sourceLabel="index.js:80" />

A callback function called after sending a request to Splunk: `function(err, response, body)`. Defaults to an empty function.

<MemberHeading id="config" depth="3" name="config" sig="config(): Object" />

<MemberMeta sourceHref="/source/index-js/#L91" sourceLabel="index.js:91" />

Returns the configuration for this logger. See [SplunkStream](/splunkstream).

**Returns**

- `Object` — Configuration for this logger.

<MemberHeading id="write" depth="3" name="write" sig="write(data: object)" />

<MemberMeta sourceHref="/source/index-js/#L104" sourceLabel="index.js:104" />

The `write()` function for `SplunkStream`.

Bunyan will call this function when a user logs a message. See [Bunyan raw streams](https://github.com/trentm/node-bunyan#stream-type-raw).

**Parameters**

- `data` (object) — The data object is provided by Bunyan.

## Instance Fields

<MemberHeading id="logger" depth="3" name="logger" sig="logger: SplunkLogger" />

<MemberMeta sourceHref="/source/index-js/#L55" sourceLabel="index.js:55" />
