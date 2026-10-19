import test from "node:test";
import assert from "node:assert/strict";
import {
  classify,
  degradation,
  settlement,
  assessTrust,
  integrateExposure,
  originGate,
  arrivalLiability,
  insuranceRoute,
} from "../src/lib/auditor.ts";

const compliant = {
  pulp: 12,
  supply: 9,
  returnAir: 12,
  current: 7.4,
  originPulp: 12,
  doorMinutes: 0,
  coolingCommand: true,
  shortCycling: false,
  lockedRotor: false,
};

test("PRD S1–S6 physical vectors attribute distinct fault scenarios", () => {
  assert.equal(classify(compliant, "Tomato"), "S1");
  assert.equal(
    classify(
      {
        ...compliant,
        pulp: 26,
        originPulp: 26,
        supply: 8,
        returnAir: 20,
        current: 28,
      },
      "Tomato",
    ),
    "S2",
  );
  assert.equal(
    classify(
      {
        ...compliant,
        pulp: 20,
        supply: 20,
        returnAir: 20,
        current: 0,
        coolingCommand: false,
      },
      "Tomato",
    ),
    "S3",
  );
  assert.equal(
    classify(
      { ...compliant, pulp: 21, supply: 8, returnAir: 10, shortCycling: true },
      "Tomato",
    ),
    "S4",
  );
  assert.equal(classify({ ...compliant, doorMinutes: 16 }, "Tomato"), "S5");
  assert.equal(
    classify({ ...compliant, current: 0, coolingCommand: true }, "Tomato"),
    "S6",
  );
});
test("chilling and ambiguous telemetry are never called compliant", () => {
  assert.equal(classify({ ...compliant, pulp: 5 }, "Tomato"), null);
  assert.equal(classify({ ...compliant, current: 1 }, "Tomato"), null);
  assert.throws(() => classify({ ...compliant, pulp: NaN }, "Tomato"));
});
test("crop-specific lower bands flag banana chilling", () => {
  assert.equal(degradation("Banana", 8, 6).chilling, true);
  assert.equal(degradation("Leafy greens", 3, 6).chilling, false);
});
test("Q10 benchmark: 24 hours at tomato reference consumes 10 percent of 240-hour life", () => {
  const r = degradation("Tomato", 13, 24);
  assert.equal(r.low, 10);
  assert.equal(r.high, 10);
  assert.equal(r.breach, 0);
});
test("Q10 benchmark: ten-degree excess increases consumed fraction by 1.5 to 3", () => {
  const r = degradation("Tomato", 23, 24);
  assert.equal(r.low, 15);
  assert.equal(r.high, 30);
  assert.throws(() => degradation("Tomato", 23, -1));
});
test("integrated shelf life conserves compliant plus breach degradation", () => {
  const r = integrateExposure("Tomato", [
    { temperature: 13, durationHours: 24 },
    { temperature: 23, durationHours: 24 },
  ]);
  assert.equal(r.total, 32.5);
  assert.equal(r.breach, 12.5);
  assert.equal(r.compliant + r.breach, r.total);
});
test("ice-pack cooling spoof is held for arbitration", () => {
  const r = assessTrust(
    { ...compliant, pulp: 2, supply: 20, returnAir: 21 },
    24,
    1,
  );
  assert.equal(r.reason, "LOW_TRUST_TAMPER");
  assert.equal(r.held, true);
  assert.ok(r.score < 0.7);
  assert.equal(assessTrust(compliant).held, false);
});
test("settlement applies exact tier boundaries and preserves full farmer payment", () => {
  assert.equal(settlement(150000, 18000, 4.99, "S1").tier, 1);
  assert.equal(settlement(150000, 18000, 5, "S3").tier, 2);
  assert.equal(settlement(150000, 18000, 25, "S6").tier, 3);
  const r = settlement(150000, 18000, 12, "S3");
  assert.equal(r.farmer, 150000);
  assert.equal(r.rebate, 18000);
  assert.equal(r.freight, 0);
  assert.equal(r.totalSources, r.totalUses);
});
test("hot loading protects driver freight; insurance recovery is never assumed funded", () => {
  assert.equal(settlement(150000, 18000, 12, "S2").freight, 18000);
  const r = settlement(150000, 18000, 12, "S6");
  assert.equal(r.insuranceRequested, 18000);
  assert.equal(r.totalSources, r.totalUses);
  assert.equal(settlement(150000, 18000, 12, "S3", 0.32).held, true);
  assert.throws(() => settlement(-1, 18000, 12, "S1"));
});

test("rejection tier requests the full invoice and prolonged extreme heat overrides a low breach estimate", () => {
  const r = settlement(150000, 18000, 25, "S6");
  assert.equal(r.rebate, 150000);
  assert.equal(r.totalSources, r.totalUses);
  assert.equal(settlement(150000, 18000, 1, "S6", 0.98, 9).tier, 3);
  assert.equal(settlement(150000, 18000, 1, "S6", 0.98, 8).tier, 1);
});

test("origin gate needs 15 minutes of continuous, crop-compliant closed-door samples", () => {
  const samples = Array.from({ length: 16 }, (_, i) => ({
    timestamp: new Date(Date.UTC(2026, 9, 19, 6, i)).toISOString(),
    pulp: 12,
    doorOpen: false,
  }));
  assert.equal(originGate("Tomato", samples).ready, true);
  assert.equal(originGate("Tomato", samples.slice(0, 15)).ready, false);
  assert.equal(
    originGate(
      "Tomato",
      samples.map((s) => ({ ...s, pulp: 24 })),
    ).ready,
    false,
  );
  assert.equal(originGate("Tomato", [samples[0], samples[15]]).ready, false);
});
test("receiver liability review starts strictly after two hours of destination waiting", () => {
  assert.equal(
    arrivalLiability("2026-10-19T06:00:00Z", "2026-10-19T08:00:00Z", false)
      .receiverReview,
    false,
  );
  assert.equal(
    arrivalLiability("2026-10-19T06:00:00Z", "2026-10-19T08:01:00Z", false)
      .receiverReview,
    true,
  );
  assert.equal(
    arrivalLiability("2026-10-19T06:00:00Z", "2026-10-19T10:00:00Z", true)
      .receiverReview,
    false,
  );
});
test("claim routing holds hot-loaded origins and excludes the 12-to-24-hour coverage gap", () => {
  assert.equal(insuranceRoute(6, "S6", false).path, "BLOCKED");
  assert.equal(insuranceRoute(6, "S6", true).path, "PARAMETRIC");
  assert.equal(insuranceRoute(25, "S6", true).path, "INDEMNITY");
  assert.equal(insuranceRoute(18, "S6", true).path, "REVIEW");
  assert.equal(insuranceRoute(6, "S3", true).path, "REVIEW");
});
