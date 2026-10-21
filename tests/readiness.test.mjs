import test from "node:test";
import assert from "node:assert/strict";
import { evaluateReadiness } from "../dist/logic.js";

const readyVehicle = {
  voltage: 12.7,
  stateOfCharge: 82,
  storage: 8,
  networkQuality: "stable",
  vehicleParked: true,
  ignitionOff: true,
  noBlockingDtcs: true,
};

test("a vehicle that passes every prerequisite is ready", () => {
  const result = evaluateReadiness(readyVehicle);
  assert.equal(result.ready, true);
  assert.equal(result.passedCount, 7);
  assert.equal(result.failedChecks.length, 0);
});

test("minimum voltage boundary passes", () => {
  const result = evaluateReadiness({ ...readyVehicle, voltage: 12.2 });
  assert.equal(result.checks.find((check) => check.id === "voltage").passed, true);
});

test("voltage below the boundary blocks the update", () => {
  const result = evaluateReadiness({ ...readyVehicle, voltage: 12.1 });
  assert.equal(result.ready, false);
  assert.equal(result.checks.find((check) => check.id === "voltage").passed, false);
});

test("minimum charge boundary passes", () => {
  const result = evaluateReadiness({ ...readyVehicle, stateOfCharge: 70 });
  assert.equal(result.checks.find((check) => check.id === "charge").passed, true);
});

test("a degraded network blocks the update", () => {
  const result = evaluateReadiness({ ...readyVehicle, networkQuality: "degraded" });
  assert.equal(result.ready, false);
  assert.equal(result.failedChecks[0].id, "network");
});

test("multiple unsafe conditions are all reported", () => {
  const result = evaluateReadiness({
    ...readyVehicle,
    vehicleParked: false,
    ignitionOff: false,
    noBlockingDtcs: false,
  });
  assert.equal(result.ready, false);
  assert.deepEqual(result.failedChecks.map((check) => check.id), ["parked", "ignition", "diagnostics"]);
});
