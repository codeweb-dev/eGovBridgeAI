import assert from "node:assert/strict";
import {
  buildGovernmentServicesQuery,
  getGovernmentServiceRecommendations,
  parseGovernmentServices,
} from "./government-services.ts";

const query = buildGovernmentServicesQuery({
  south: 14.5,
  west: 120.9,
  north: 14.7,
  east: 121.1,
});
assert.match(query, /post_office/);
assert.match(query, /Philippine Statistics Authority/);
assert.match(query, /BIR/);
assert.match(query, /14\.50000,120\.90000,14\.70000,121\.10000/);

const services = parseGovernmentServices([
    {
      type: "node",
      id: 1,
      lat: 14.6,
      lon: 121,
      tags: {
        amenity: "police",
        name: "Central Police Station",
        "addr:city": "Manila",
      },
    },
    {
      type: "way",
      id: 2,
      center: { lat: 14.61, lon: 121.01 },
      tags: { amenity: "post_office", operator: "PHLPost" },
    },
    {
      type: "node",
      id: 3,
      lat: 14.62,
      lon: 121.02,
      tags: {
        office: "government",
        name: "Philippine Statistics Authority",
      },
    },
    {
      type: "node",
      id: 4,
      lat: 14.63,
      lon: 121.03,
      tags: { office: "government", name: "Land Transportation Office" },
    },
  ]);

assert.deepEqual(
  services,
  [
    {
      id: "node-1",
      type: "police",
      name: "Central Police Station",
      latitude: 14.6,
      longitude: 121,
      operator: "",
      address: "Manila",
      openingHours: "",
    },
    {
      id: "way-2",
      type: "post_office",
      name: "PHLPost",
      latitude: 14.61,
      longitude: 121.01,
      operator: "PHLPost",
      address: "",
      openingHours: "",
    },
    {
      id: "node-3",
      type: "psa",
      name: "Philippine Statistics Authority",
      latitude: 14.62,
      longitude: 121.02,
      operator: "",
      address: "",
      openingHours: "",
    },
    {
      id: "node-4",
      type: "lto",
      name: "Land Transportation Office",
      latitude: 14.63,
      longitude: 121.03,
      operator: "",
      address: "",
      openingHours: "",
    },
  ],
);

const recommendations = getGovernmentServiceRecommendations(
  services,
  [14.6, 121],
  "Nadukutan ako at nawala ang wallet at IDs ko",
);
assert.equal(recommendations[0].service.type, "police");
assert.deepEqual(
  recommendations.map(({ service }) => service.type),
  ["police", "post_office", "psa", "lto"],
);
assert.deepEqual(
  getGovernmentServiceRecommendations(
    services,
    [14.6, 121],
    "May sirang ilaw sa kalye",
  ),
  [],
);

console.log("government-services.test.ts passed");
