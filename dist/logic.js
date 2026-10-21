// These thresholds are intentionally easy to find and change. They represent
// demonstration rules, not requirements from a specific vehicle manufacturer.
export const DEMO_THRESHOLDS = Object.freeze({
  minimumVoltage: 12.2,
  maximumVoltage: 14.8,
  minimumStateOfCharge: 70,
  minimumStorageGb: 4,
});

// Each rule returns the same small data shape so the interface, report exporter,
// and automated tests can all consume one trustworthy evaluation result.
export function evaluateReadiness(vehicle, thresholds = DEMO_THRESHOLDS) {
  const checks = [
    {
      id: "voltage",
      label: "12 V power is within range",
      passed: vehicle.voltage >= thresholds.minimumVoltage && vehicle.voltage <= thresholds.maximumVoltage,
      detail: `${vehicle.voltage.toFixed(1)} V measured; ${thresholds.minimumVoltage.toFixed(1)}–${thresholds.maximumVoltage.toFixed(1)} V required.`,
    },
    {
      id: "charge",
      label: "Battery charge is sufficient",
      passed: vehicle.stateOfCharge >= thresholds.minimumStateOfCharge,
      detail: `${vehicle.stateOfCharge}% available; ${thresholds.minimumStateOfCharge}% required.`,
    },
    {
      id: "parked",
      label: "Vehicle is secured in Park",
      passed: vehicle.vehicleParked,
      detail: vehicle.vehicleParked ? "Park state confirmed." : "Place the vehicle in Park before continuing.",
    },
    {
      id: "ignition",
      label: "Ignition state is approved",
      passed: vehicle.ignitionOff,
      detail: vehicle.ignitionOff ? "Ignition-off state confirmed." : "Turn the ignition off before continuing.",
    },
    {
      id: "network",
      label: "Network connection is stable",
      passed: vehicle.networkQuality === "stable",
      detail: vehicle.networkQuality === "stable" ? "Stable connection reported." : `${capitalize(vehicle.networkQuality)} connection cannot support this update.`,
    },
    {
      id: "storage",
      label: "Storage capacity is available",
      passed: vehicle.storage >= thresholds.minimumStorageGb,
      detail: `${vehicle.storage.toFixed(1)} GB available; ${thresholds.minimumStorageGb} GB required.`,
    },
    {
      id: "diagnostics",
      label: "No blocking diagnostic faults",
      passed: vehicle.noBlockingDtcs,
      detail: vehicle.noBlockingDtcs ? "No blocking DTCs reported." : "Resolve critical diagnostic faults before continuing.",
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;
  const ready = passedCount === checks.length;

  return {
    ready,
    passedCount,
    totalCount: checks.length,
    checks,
    failedChecks: checks.filter((check) => !check.passed),
  };
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
