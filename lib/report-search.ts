export function reportMatchesSearch(
  report: object & { created_at?: unknown },
  query: string,
) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;

  const values = Object.values(report)
    .filter((value) => value !== null && value !== undefined)
    .map(String);
  if (typeof report.created_at === "string") {
    const submitted = new Date(report.created_at);
    if (!Number.isNaN(submitted.getTime())) {
      values.push(
        submitted.toLocaleDateString(),
        submitted.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      );
    }
  }

  const searchable = values.join(" ").toLowerCase();
  return terms.every((term) => searchable.includes(term));
}
