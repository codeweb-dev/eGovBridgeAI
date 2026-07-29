import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const maleNames = [
  "Miguel", "Jose", "Carlo", "Paolo", "Gabriel",
  "Rafael", "Daniel", "Marco", "Luis", "Nathaniel",
  "Joshua", "Francis", "Angelo", "Christian", "Vincent",
  "Jerome", "Kenneth", "Adrian", "Patrick", "Dominic",
  "Renzo", "Enrique", "Noel", "Samuel", "Tristan",
];
const femaleNames = [
  "Maria", "Angela", "Sofia", "Isabella", "Camille",
  "Patricia", "Jasmine", "Bianca", "Andrea", "Danica",
  "Katrina", "Nicole", "Beatrice", "Alyssa", "Clarisse",
  "Joanna", "Mikaela", "Therese", "Regina", "Faith",
  "Rica", "Elaine", "Mariel", "Kristine", "Leah",
];
const surnames = [
  "Santos", "Reyes", "Cruz", "Garcia", "Mendoza",
  "Bautista", "Villanueva", "Ramos", "Flores", "Aquino",
  "Castillo", "Navarro", "Dela Cruz", "Fernandez", "Torres",
  "Gonzales", "Diaz", "Mercado", "Domingo", "Pascual",
  "Salazar", "Aguilar", "Soriano", "Valdez", "Rivera",
];
const cities = [
  ["Manila", 14.5995, 120.9842],
  ["Quezon City", 14.676, 121.0437],
  ["Cebu City", 10.3157, 123.8854],
  ["Davao City", 7.1907, 125.4553],
  ["Iloilo City", 10.7202, 122.5621],
  ["Baguio City", 16.4023, 120.596],
  ["Cagayan de Oro", 8.4542, 124.6319],
  ["Zamboanga City", 6.9214, 122.079],
  ["General Santos", 6.1164, 125.1716],
  ["Bacolod City", 10.6765, 122.9509],
];
const categories = [
  ["Road & Infrastructure", "Damaged road needs inspection"],
  ["Waste Management", "Uncollected waste in public area"],
  ["Public Safety", "Unsafe condition reported by resident"],
  ["Government Service", "Delayed public service request"],
  ["Public Health", "Community health concern"],
  ["Red Tape", "Government transaction taking too long"],
];
const statuses = ["Pending", "Pending", "Processing", "Processing", "Completed"];
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const jitter = (value) => Number((value + (Math.random() - 0.5) * 0.06).toFixed(6));

const users = [...maleNames, ...femaleNames].map((firstName, index) => ({
  phone: `DEMO-USER-${String(index + 1).padStart(3, "0")}`,
  email: `demo.user${String(index + 1).padStart(3, "0")}@example.com`,
  full_name: `${firstName} ${surnames[index % surnames.length]}`,
  gender: index < maleNames.length ? "Male" : "Female",
  role: "user",
}));

const reportDrafts = users.flatMap((user, userIndex) =>
  Array.from({ length: 5 }, (_, reportIndex) => {
    const [city, latitude, longitude] = pick(cities);
    const [category, title] = pick(categories);
    return {
      user_phone: user.phone,
      report_api_id: `DEMO-${String(userIndex + 1).padStart(3, "0")}-${reportIndex + 1}`,
      category,
      title,
      description: `Demo report from ${city}. Created as sample data for the admin dashboard.`,
      status: pick(statuses),
      latitude: jitter(latitude),
      longitude: jitter(longitude),
      created_at: new Date(Date.now() - Math.random() * 180 * 86_400_000).toISOString(),
    };
  })
);

assert.equal(users.length, 50);
assert.equal(reportDrafts.length, 250);
for (const user of users) {
  assert.equal(reportDrafts.filter((report) => report.user_phone === user.phone).length, 5);
}
assert(reportDrafts.every(({ latitude, longitude }) =>
  latitude >= 4 && latitude <= 22 && longitude >= 116 && longitude <= 127
));

const { data: savedUsers, error: userError } = await supabase
  .from("users")
  .upsert(users, { onConflict: "phone" })
  .select("id, phone");
if (userError) throw userError;
if (savedUsers?.length !== 50) throw new Error(`Expected 50 demo users, got ${savedUsers?.length ?? 0}`);

const userIds = new Map(savedUsers.map((user) => [user.phone, user.id]));
const { data: existingReports, error: lookupError } = await supabase
  .from("reports")
  .select("report_api_id")
  .like("report_api_id", "DEMO-%");
if (lookupError) throw lookupError;

const existingIds = new Set(existingReports.map((report) => report.report_api_id));
const reports = reportDrafts
  .filter((report) => !existingIds.has(report.report_api_id))
  .map(({ user_phone, ...report }) => ({ ...report, user_id: userIds.get(user_phone) }));

for (let start = 0; start < reports.length; start += 100) {
  const { error } = await supabase.from("reports").insert(reports.slice(start, start + 100));
  if (error) throw error;
}

console.log(`Demo seed complete: 50 users, ${reports.length} new reports (${250 - reports.length} already existed).`);
