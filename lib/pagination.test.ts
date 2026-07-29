import assert from "node:assert/strict";
import { paginate } from "./pagination.ts";

const items = Array.from({ length: 25 }, (_, index) => index + 1);

assert.deepEqual(paginate(items, 0), {
  items: items.slice(0, 10),
  page: 0,
  pageCount: 3,
});
assert.deepEqual(paginate(items, 2), {
  items: items.slice(20),
  page: 2,
  pageCount: 3,
});
assert.equal(paginate(items, 99).page, 2);
assert.deepEqual(paginate([], 0), { items: [], page: 0, pageCount: 0 });

console.log("pagination.test.ts passed");
