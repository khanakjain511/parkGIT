export const crops = {
  Tomato: { min: 10, max: 13, life: 240 },
  Banana: { min: 12, max: 14, life: 336 },
  "Leafy greens": { min: 0, max: 4, life: 120 },
} as const;
export type Crop = keyof typeof crops;
export type Scenario = "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
export const scenarios: Record<
  Scenario,
  { name: string; party: string; description: string }
> = {
  S1: {
    name: "Compliant transit",
    party: "No fault detected",
    description:
      "Cooling is operating and cargo remains within its crop-specific temperature band.",
  },
  S2: {
    name: "Origin hot loading",
    party: "Origin / shipper",
    description:
      "Warm pulp at loading with strong cooling demand. Driver protected; origin pre-cool gate fails.",
  },
  S3: {
    name: "Cooling switched off",
    party: "Carrier review required",
    description:
      "Previously pre-cooled cargo, no compressor current and no evaporator differential. Carrier liability requires review.",
  },
  S4: {
    name: "Blocked airflow",
    party: "Loading / stowage review",
    description:
      "Cold supply and return air with warm pulp and short cycling suggest obstructed circulation.",
  },
  S5: {
    name: "Door-open icing risk",
    party: "Custody review required",
    description:
      "Door open for more than 15 minutes while the compressor is operating. Close the door and inspect.",
  },
  S6: {
    name: "Mechanical breakdown",
    party: "Insurance review required",
    description:
      "Cooling command is active but compressor current is absent or a locked-rotor spike is detected.",
  },
};
export type Readings = {
  pulp: number;
  supply: number;
  returnAir: number;
  current: number;
  originPulp: number;
  doorMinutes: number;
  coolingCommand: boolean;
  shortCycling: boolean;
  lockedRotor: boolean;
};
export function classify(r: Readings, crop: Crop): Scenario | null {
  if (
    Object.values(r).some((v) => typeof v === "number" && !Number.isFinite(v))
  )
    throw new Error("Invalid sensor reading");
  const band = crops[crop];
  const delta = r.returnAir - r.supply;
  if (r.doorMinutes > 15 && r.current > 5) return "S5";
  if (r.coolingCommand && (r.current === 0 || r.lockedRotor)) return "S6";
  if (r.originPulp > 22 && r.supply <= 10 && delta > 8 && r.current >= 20)
    return "S2";
  if (
    r.pulp > 18 &&
    r.supply <= band.max &&
    r.returnAir <= band.max &&
    r.shortCycling
  )
    return "S4";
  if (r.originPulp <= band.max && Math.abs(delta) < 0.5 && r.current === 0)
    return "S3";
  if (
    r.pulp >= band.min &&
    r.pulp <= band.max &&
    delta >= 1.5 &&
    delta <= 4 &&
    r.current > 5
  )
    return "S1";
  return null;
}
export function degradation(crop: Crop, temperature: number, hours: number) {
  if (!Number.isFinite(temperature) || !Number.isFinite(hours) || hours < 0)
    throw new Error("Invalid thermal exposure");
  const band = crops[crop];
  const baseline = (hours / band.life) * 100;
  const estimate = (q: number) =>
    Math.min(100, baseline * q ** ((temperature - band.max) / 10));
  const low = estimate(1.5),
    high = estimate(3);
  return {
    low: Math.min(low, high),
    high: Math.max(low, high),
    breach: Math.max(0, (low + high) / 2 - baseline),
    chilling: temperature < band.min,
  };
}
export function settlement(
  invoice: number,
  freight: number,
  breach: number,
  scenario: Scenario,
  trust = 0.98,
  extremeHeatHours = 0,
) {
  if (
    ![invoice, freight, breach, trust, extremeHeatHours].every(
      Number.isFinite,
    ) ||
    invoice < 0 ||
    freight < 0 ||
    breach < 0 ||
    breach > 100 ||
    trust < 0 ||
    trust > 1 ||
    extremeHeatHours < 0
  )
    throw new Error("Invalid settlement inputs");
  const tier = extremeHeatHours > 8 ? 3 : breach < 5 ? 1 : breach < 25 ? 2 : 3;
  const rebate =
    tier === 1
      ? 0
      : tier === 3
        ? invoice
        : Math.round((invoice * breach) / 100);
  const carrierContribution = scenario === "S3" ? Math.min(freight, rebate) : 0;
  const insuranceRequested = scenario === "S6" ? rebate : 0;
  return {
    tier,
    farmer: invoice,
    freight: freight - carrierContribution,
    rebate,
    carrierContribution,
    insuranceRequested,
    unfunded: rebate - carrierContribution - insuranceRequested,
    held: trust < 0.7,
    totalSources: invoice + freight + rebate - carrierContribution,
    totalUses: invoice + freight - carrierContribution + rebate,
  };
}
export type Shipment = {
  id: string;
  crop: Crop;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  temperature: number;
  status:
    | "In transit"
    | "Attention"
    | "Delivered"
    | "At origin"
    | "Awaiting unloading";
  scenario: Scenario | null;
  trust: number;
  value: number;
  arrivedAt?: string;
  handoverAt?: string;
};
export const initialShipments: Shipment[] = [
  {
    id: "PB-0941",
    crop: "Tomato",
    origin: "Sonipat",
    destination: "Azadpur Mandi",
    driver: "Rajesh Kumar",
    vehicle: "HR 69 E 4821",
    temperature: 12.4,
    status: "In transit",
    scenario: "S1",
    trust: 0.98,
    value: 150000,
  },
  {
    id: "PB-0942",
    crop: "Banana",
    origin: "Jalgaon",
    destination: "Mumbai DC",
    driver: "Suresh Patil",
    vehicle: "MH 19 CY 7204",
    temperature: 18.6,
    status: "Attention",
    scenario: "S3",
    trust: 0.96,
    value: 185000,
  },
  {
    id: "PB-0943",
    crop: "Leafy greens",
    origin: "Karnal",
    destination: "Delhi DC",
    driver: "Aman Singh",
    vehicle: "HR 45 D 1190",
    temperature: 2.8,
    status: "In transit",
    scenario: "S1",
    trust: 0.99,
    value: 92000,
  },
  {
    id: "PB-0944",
    crop: "Tomato",
    origin: "Nashik",
    destination: "Pune Market",
    driver: "Vijay Deshmukh",
    vehicle: "MH 15 FV 3142",
    temperature: 11.8,
    status: "Delivered",
    scenario: "S1",
    trust: 0.99,
    value: 128000,
  },
  {
    id: "PB-0945",
    crop: "Tomato",
    origin: "Panipat",
    destination: "Azadpur Mandi",
    driver: "Harpreet Gill",
    vehicle: "HR 67 C 8201",
    temperature: 24.1,
    status: "At origin",
    scenario: "S2",
    trust: 0.97,
    value: 164000,
  },
];
export const rupees = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function assessTrust(
  readings: Readings,
  previousPulp: number | null = null,
  elapsedMinutes = 1,
) {
  const divergence =
    Math.abs(readings.pulp - readings.supply) > 15 &&
    readings.pulp < readings.supply;
  const impossibleCooling =
    previousPulp !== null &&
    elapsedMinutes > 0 &&
    (previousPulp - readings.pulp) / elapsedMinutes > 2;
  const reliability = 0.98;
  const consistency = divergence ? 0.1 : 0.98;
  const continuity = impossibleCooling ? 0 : 0.98;
  const score =
    Math.round(
      (0.3 * reliability + 0.4 * consistency + 0.3 * continuity) * 100,
    ) / 100;
  return {
    score,
    held: score < 0.7,
    reason: divergence || impossibleCooling ? "LOW_TRUST_TAMPER" : "NOMINAL",
  };
}
export function integrateExposure(
  crop: Crop,
  samples: { temperature: number; durationHours: number }[],
) {
  let totalLow = 0,
    totalHigh = 0,
    breachLow = 0,
    breachHigh = 0;
  let chilling = false;
  for (const sample of samples) {
    const result = degradation(crop, sample.temperature, sample.durationHours);
    const baseline = (sample.durationHours / crops[crop].life) * 100;
    totalLow += result.low;
    totalHigh += result.high;
    breachLow += Math.max(0, result.low - baseline);
    breachHigh += Math.max(0, result.high - baseline);
    chilling ||= result.chilling;
  }
  const total = Math.min(100, (totalLow + totalHigh) / 2);
  const breach = Math.min(total, (breachLow + breachHigh) / 2);
  return {
    low: Math.min(100, totalLow),
    high: Math.min(100, totalHigh),
    total,
    breach,
    compliant: total - breach,
    chilling,
  };
}

export function originGate(
  crop: Crop,
  samples: { timestamp: string; pulp: number; doorOpen: boolean }[],
) {
  if (samples.length < 2)
    return { ready: false, reason: "Insufficient origin history" };
  const times = samples.map((s) => Date.parse(s.timestamp));
  if (
    times.some(
      (t, i) =>
        !Number.isFinite(t) ||
        (i > 0 && (t <= times[i - 1] || t - times[i - 1] > 90000)),
    )
  )
    return { ready: false, reason: "Incomplete or unordered origin history" };
  if (times[times.length - 1] - times[0] < 15 * 60000)
    return { ready: false, reason: "Requires 15 minutes of stabilization" };
  const band = crops[crop];
  if (
    samples.some(
      (s) =>
        s.doorOpen ||
        !Number.isFinite(s.pulp) ||
        s.pulp < band.min ||
        s.pulp > band.max,
    )
  )
    return {
      ready: false,
      reason: "Crop band or closed-door requirement not met",
    };
  return { ready: true, reason: "Origin stabilization gate met" };
}
export function arrivalLiability(
  arrivedAt: string | undefined,
  now: string,
  unloaded: boolean,
) {
  if (!arrivedAt || unloaded)
    return { waitingMinutes: 0, receiverReview: false };
  const duration = Date.parse(now) - Date.parse(arrivedAt);
  if (!Number.isFinite(duration)) throw new Error("Invalid arrival timestamp");
  const waitingMinutes = Math.max(0, Math.floor(duration / 60000));
  return { waitingMinutes, receiverReview: waitingMinutes > 120 };
}
export function insuranceRoute(
  hours: number,
  scenario: Scenario,
  originReady: boolean,
) {
  if (!Number.isFinite(hours) || hours < 0)
    throw new Error("Invalid excursion duration");
  if (!originReady)
    return {
      path: "BLOCKED",
      reason: "Origin pre-cool proof required before policy binding",
    };
  if (scenario !== "S6")
    return {
      path: "REVIEW",
      reason: "Carrier or custody event; no mechanical-breakdown claim assumed",
    };
  if (hours >= 3 && hours <= 12)
    return {
      path: "PARAMETRIC",
      reason: "Path A: parametric micro-insurance review",
    };
  if (hours > 24)
    return {
      path: "INDEMNITY",
      reason: "Path B: traditional indemnity and surveyor dossier",
    };
  return {
    path: "REVIEW",
    reason: "Duration outside configured cover; manual policy review required",
  };
}
