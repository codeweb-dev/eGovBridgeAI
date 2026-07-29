import assert from "node:assert/strict";
import { detectAssistantToolIntent } from "./assistant-intent.ts";

assert.equal(detectAssistantToolIntent("create me a report"), "report");
assert.equal(detectAssistantToolIntent("I need to submit a complaint"), "report");
assert.equal(detectAssistantToolIntent("report"), "report");
assert.equal(detectAssistantToolIntent("show all my cases"), "list");
assert.equal(detectAssistantToolIntent("reports"), "list");
assert.equal(detectAssistantToolIntent("find my report reference"), "search");
assert.equal(detectAssistantToolIntent("search"), "search");
assert.equal(detectAssistantToolIntent("put my reports on the map"), "map");
assert.equal(detectAssistantToolIntent("map"), "map");
assert.equal(detectAssistantToolIntent("pins"), "map");
assert.equal(detectAssistantToolIntent("How do I renew my passport?"), null);
assert.equal(detectAssistantToolIntent("What is a government report?"), null);

console.log("assistant-intent.test.ts passed");
