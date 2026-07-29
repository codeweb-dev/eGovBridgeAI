import assert from "node:assert/strict";
import {
  recordMatchesSearch,
  reportMatchesSearch,
} from "./report-search.ts";

const report = {
  report_api_id: "PFM-072926-1246",
  title: "Lost government IDs",
  description: "Wallet was taken near the terminal",
  category: "Public safety",
  status: "Processing",
  reporter: "Reymart Romano",
  searchText: "reymartromano@gmail.com +639123456789",
  latitude: 14.3035,
  created_at: "2026-07-29T11:44:12.000Z",
};

assert(reportMatchesSearch(report, "PFM-072926-1246"));
assert(reportMatchesSearch(report, "Reymart processing"));
assert(reportMatchesSearch(report, "terminal"));
assert(reportMatchesSearch(report, "reymartromano@gmail.com"));
assert(reportMatchesSearch(report, "14.3035"));
assert(reportMatchesSearch(report, "2026"));
assert(!reportMatchesSearch(report, "completed"));
assert(
  recordMatchesSearch(
    {
      full_name: "Ana Santos",
      email: "ana@example.com",
      phone: "+639123456789",
      gender: "Female",
      role: "admin",
      created_at: "2026-07-29T11:44:12.000Z",
    },
    "ana admin female",
  ),
);

console.log("report-search.test.ts passed");
