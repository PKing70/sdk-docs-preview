---
title: SplunkBunyanLogger
kind: namespace
longname: SplunkBunyanLogger
description: Splunk Bunyan Logger module, to be used with [Bunyan]{@link https://www.npmjs.com/package/bunyan}. See {@link https://github.com/splunk/splunk-bunyan-logger/tree/master/examples|examples} for usage.
---

# SplunkBunyanLogger

<SourceLink href="/source/index-js/#L154" label="index.js:154" />

Splunk Bunyan Logger module, to be used with [Bunyan](https://www.npmjs.com/package/bunyan).

See [examples](https://github.com/splunk/splunk-bunyan-logger/tree/master/examples) for usage.

---

## Static Methods

<MemberHeading id="severityfromlevel" depth="3" name="severityFromLevel" sig="severityFromLevel(level: number): string" />

<MemberMeta badges="static" sourceHref="/source/index-js/#L178" sourceLabel="index.js:178" />

Translates a Bunyan logging level number to the name of the level.

**Parameters**

- `level` (number) — A Bunyan logging level integer. See [SplunkBunyanLogger.levels](/splunkbunyanlogger#levels)

**Returns**

- `string`

<MemberHeading id="createstream" depth="3" name="createStream" sig="createStream(config: object): SplunkBunyanStream" />

<MemberMeta badges="static" sourceHref="/source/index-js/#L202" sourceLabel="index.js:202" />

Creates a Bunyan Stream object with the provided `config`.

**Parameters**

- `config` (object) — See [SplunkStream](/splunkstream).

**Returns**

- [`SplunkBunyanStream`](/splunkbunyanstream) — A Bunyan Stream object.

## Enums

<MemberHeading id="levels" depth="3" name="levels" sig="levels: string" />

<MemberMeta badges="static,readonly,enum" sourceHref="/source/index-js/#L163" sourceLabel="index.js:163" />

Bunyan's logging levels.

**Properties**

- `TRACE` (string, default: "trace")
- `DEBUG` (string, default: "debug")
- `INFO` (string, default: "info")
- `WARN` (string, default: "warn")
- `ERROR` (string, default: "error")
- `FATAL` (string, default: "fatal")

**Default:** `info`
