export type AssistantToolIntent = "report" | "list" | "search" | "map";

const SHORTCUTS: Record<string, AssistantToolIntent> = {
  report: "report",
  complaint: "report",
  "new report": "report",
  "file report": "report",
  reports: "list",
  "my reports": "list",
  "all reports": "list",
  list: "list",
  search: "search",
  find: "search",
  track: "search",
  map: "map",
  maps: "map",
  pin: "map",
  pins: "map",
};

const RULES: [AssistantToolIntent, RegExp[]][] = [
  [
    "map",
    [
      /\b(map|pins?|locations?)\b.*\b(reports?|complaints?|cases?)\b/,
      /\b(reports?|complaints?|cases?)\b.*\b(map|pins?|locations?)\b/,
      /\bwhere\b.*\b(my )?(reports?|complaints?|cases?)\b/,
    ],
  ],
  [
    "search",
    [
      /\b(search|find|locate|look up|lookup|track)\b.*\b(reports?|complaints?|cases?|references?)\b/,
      /\b(reports?|complaints?|cases?|references?)\b.*\b(search|find|locate|look up|lookup|track)\b/,
    ],
  ],
  [
    "list",
    [
      /\b(list|show|view|see|display)\b.*\b(my |all )*(reports?|complaints?|cases?)\b/,
      /\bmy (reports?|complaints?|cases?)\b/,
      /\bwhat\b.*\b(reports?|complaints?|cases?)\b.*\b(i|my)\b/,
    ],
  ],
  [
    "report",
    [
      /\b(create|make|file|submit|send|start|write|lodge)\b.*\b(reports?|complaints?)\b/,
      /\b(reports?|complaints?)\b.*\b(create|make|file|submit|send|start|write|lodge)\b/,
      /\breport\b.*\b(issue|problem|incident|concern|violation|damage|broken)\b/,
    ],
  ],
];

export function detectAssistantToolIntent(
  question: string,
): AssistantToolIntent | null {
  const normalized = question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (SHORTCUTS[normalized]) return SHORTCUTS[normalized];
  for (const [intent, patterns] of RULES) {
    if (patterns.some((pattern) => pattern.test(normalized))) return intent;
  }
  return null;
}
