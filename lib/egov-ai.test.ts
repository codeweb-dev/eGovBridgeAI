import assert from "node:assert/strict";
import {
  buildAssistantPrompt,
  buildReportDraftPrompt,
  parseReportDraftResponse,
} from "./egov-ai.ts";

const prompt = buildAssistantPrompt("What information do you know about me?", {
  fullName: "Juan Dela Cruz",
  email: "juan@example.com",
  phone: "DEMO-USER-001",
  gender: "Male",
});

assert.match(prompt, /Juan Dela Cruz/);
assert.match(prompt, /juan@example\.com/);
assert.match(prompt, /DEMO-USER-001/);
assert.match(prompt, /What information do you know about me\?/);
assert.doesNotMatch(prompt, /password_hash/);

const draftPrompt = buildReportDraftPrompt({
  title: "Broken streetlight",
  category: "Public Safety",
  description: "streetlight broken for three days",
});

assert.match(draftPrompt, /streetlight broken for three days/);
assert.match(draftPrompt, /Do not invent or assume/);
assert.match(draftPrompt, /"title":"improved title"/);
assert.deepEqual(
  parseReportDraftResponse(
    '```json\n{"title":"Broken Streetlight","description":"The streetlight has been broken for three days."}\n```',
  ),
  {
    title: "Broken Streetlight",
    description: "The streetlight has been broken for three days.",
  },
);
assert.throws(() => parseReportDraftResponse("not json"), /invalid report draft/);

console.log("egov-ai.test.ts passed");
