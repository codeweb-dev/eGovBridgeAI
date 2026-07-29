import assert from "node:assert/strict";
import {
  normalizePhilippinePhone,
  parseEVerifyProfile,
} from "./everify.ts";

assert.equal(normalizePhilippinePhone("639090000000"), "+639090000000");
assert.equal(normalizePhilippinePhone("09090000000"), "+639090000000");
assert.equal(normalizePhilippinePhone("9090000000"), "+639090000000");
assert.equal(normalizePhilippinePhone("123"), null);

assert.deepEqual(
  parseEVerifyProfile({
    data: {
      full_name: "JUAN SANTOS DELA CRUZ",
      mobile_number: "639090000000",
      email: "N/A",
      gender: "Male",
    },
    meta: { result_grade: 1 },
  }),
  {
    phone: "+639090000000",
    fullName: "JUAN SANTOS DELA CRUZ",
    email: null,
    gender: "Male",
  },
);
assert.equal(parseEVerifyProfile({ data: {}, meta: { result_grade: 0 } }), null);

console.log("everify.test.ts passed");
