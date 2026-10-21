import { DEMO_THRESHOLDS, evaluateReadiness } from "./logic.js";

// Keeping element lookups together makes it easier to see which parts of the
// page are controlled by JavaScript and prevents repeated DOM searches.
const elements = {
  form: document.querySelector("#readiness-form"),
  vehicleId: document.querySelector("#vehicle-id"),
  targetModule: document.querySelector("#target-module"),
  voltage: document.querySelector("#voltage"),
  stateOfCharge: document.querySelector("#state-of-charge"),
  storage: document.querySelector("#storage"),
  networkQuality: document.querySelector("#network-quality"),
  vehicleParked: document.querySelector("#vehicle-parked"),
  ignitionOff: document.querySelector("#ignition-off"),
  noBlockingDtcs: document.querySelector("#no-blocking-dtcs"),
  voltageOutput: document.querySelector("#voltage-output"),
  socOutput: document.querySelector("#soc-output"),
  storageOutput: document.querySelector("#storage-output"),
  runEvaluation: document.querySelector("#run-evaluation"),
  loadReady: document.querySelector("#load-ready"),
  loadBlocked: document.querySelector("#load-blocked"),
  resetForm: document.querySelector("#reset-form"),
  checkList: document.querySelector("#check-list"),
  statusRing: document.querySelector("#status-ring"),
  statusIcon: document.querySelector("#status-icon"),
  overallStatus: document.querySelector("#overall-status"),
  overallMessage: document.querySelector("#overall-message"),
  scoreValue: document.querySelector("#score-value"),
  evaluationTime: document.querySelector("#evaluation-time"),
  nextAction: document.querySelector("#next-action"),
  downloadReport: document.querySelector("#download-report"),
};

let latestEvaluation = null;

// Slider values are repeated beside their controls so the interface is easy to
// understand without requiring the user to estimate a thumb position.
function updateDisplayedValues() {
  elements.voltageOutput.value = Number(elements.voltage.value).toFixed(1);
  elements.socOutput.value = elements.stateOfCharge.value;
  elements.storageOutput.value = Number(elements.storage.value).toFixed(1);
}

function readVehicleState() {
  return {
    vehicleId: elements.vehicleId.value.trim() || "Unidentified vehicle",
    targetModule: elements.targetModule.value,
    voltage: Number(elements.voltage.value),
    stateOfCharge: Number(elements.stateOfCharge.value),
    storage: Number(elements.storage.value),
    networkQuality: elements.networkQuality.value,
    vehicleParked: elements.vehicleParked.checked,
    ignitionOff: elements.ignitionOff.checked,
    noBlockingDtcs: elements.noBlockingDtcs.checked,
  };
}

function runEvaluation() {
  const vehicle = readVehicleState();
  const result = evaluateReadiness(vehicle);
  const evaluatedAt = new Date();
  latestEvaluation = { vehicle, result, evaluatedAt };

  elements.checkList.replaceChildren(...result.checks.map(createCheckRow));
  elements.scoreValue.textContent = `${result.passedCount} / ${result.totalCount}`;
  elements.evaluationTime.textContent = evaluatedAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  elements.downloadReport.disabled = false;

  elements.statusRing.classList.remove("status-neutral", "status-ready", "status-blocked");
  if (result.ready) {
    elements.statusRing.classList.add("status-ready");
    elements.statusIcon.textContent = "✓";
    elements.overallStatus.textContent = "Ready for update";
    elements.overallMessage.textContent = "All demonstration prerequisites passed.";
    elements.nextAction.textContent = "Next action: proceed to package authentication and integrity verification.";
  } else {
    elements.statusRing.classList.add("status-blocked");
    elements.statusIcon.textContent = "!";
    elements.overallStatus.textContent = "Update blocked";
    elements.overallMessage.textContent = `${result.failedChecks.length} condition${result.failedChecks.length === 1 ? "" : "s"} must be corrected.`;
    elements.nextAction.textContent = `Next action: correct ${result.failedChecks.map((check) => check.label.toLowerCase()).join(", ")}, then evaluate again.`;
  }

  // This brief motion draws attention to the final decision without becoming a
  // distracting loop or hiding any information from assistive technology.
  elements.statusRing.animate(
    [{ transform: "scale(.92)", opacity: .55 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 340, easing: "cubic-bezier(.2,.8,.2,1)" },
  );
}

function createCheckRow(check) {
  const row = document.createElement("article");
  row.className = `check-row ${check.passed ? "check-pass" : "check-fail"}`;

  const icon = document.createElement("span");
  icon.className = "check-icon";
  icon.textContent = check.passed ? "✓" : "×";

  const copy = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = check.label;
  const detail = document.createElement("small");
  detail.textContent = check.detail;
  copy.append(title, detail);

  const badge = document.createElement("span");
  badge.className = "check-badge";
  badge.textContent = check.passed ? "PASS" : "BLOCK";

  row.append(icon, copy, badge);
  return row;
}

function loadScenario(kind) {
  const ready = kind === "ready";
  elements.vehicleId.value = ready ? "EV-DEMO-042" : "EV-DEMO-117";
  elements.targetModule.value = ready ? "Gateway Module (GWM)" : "Telematics Control Unit (TCU)";
  elements.voltage.value = ready ? "12.7" : "11.6";
  elements.stateOfCharge.value = ready ? "82" : "54";
  elements.storage.value = ready ? "8" : "2.5";
  elements.networkQuality.value = ready ? "stable" : "degraded";
  elements.vehicleParked.checked = true;
  elements.ignitionOff.checked = ready;
  elements.noBlockingDtcs.checked = ready;
  updateDisplayedValues();
  runEvaluation();
}

function resetEvaluation() {
  elements.form.reset();
  updateDisplayedValues();
  latestEvaluation = null;
  elements.checkList.replaceChildren();
  elements.statusRing.className = "status-ring status-neutral";
  elements.statusIcon.textContent = "—";
  elements.overallStatus.textContent = "Awaiting evaluation";
  elements.overallMessage.textContent = "Enter the vehicle conditions and run the readiness gate.";
  elements.scoreValue.textContent = "0 / 7";
  elements.evaluationTime.textContent = "Not evaluated";
  elements.nextAction.textContent = "Run the evaluation to generate a recommended next action.";
  elements.downloadReport.disabled = true;
}

function downloadReport() {
  if (!latestEvaluation) return;

  const { vehicle, result, evaluatedAt } = latestEvaluation;
  const lines = [
    "FOTA DEPLOYMENT READINESS REPORT",
    "================================",
    `Vehicle: ${vehicle.vehicleId}`,
    `Target module: ${vehicle.targetModule}`,
    `Evaluated: ${evaluatedAt.toISOString()}`,
    `Decision: ${result.ready ? "READY FOR UPDATE" : "UPDATE BLOCKED"}`,
    `Score: ${result.passedCount}/${result.totalCount}`,
    "",
    ...result.checks.map((check) => `${check.passed ? "PASS" : "BLOCK"} | ${check.label} | ${check.detail}`),
    "",
    `Demonstration thresholds: voltage ${DEMO_THRESHOLDS.minimumVoltage.toFixed(1)}–${DEMO_THRESHOLDS.maximumVoltage.toFixed(1)} V; charge ${DEMO_THRESHOLDS.minimumStateOfCharge}% minimum; storage ${DEMO_THRESHOLDS.minimumStorageGb} GB minimum.`,
    "Educational demonstration only; not an OEM service specification.",
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${vehicle.vehicleId.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-fota-readiness.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

elements.runEvaluation.addEventListener("click", runEvaluation);
elements.loadReady.addEventListener("click", () => loadScenario("ready"));
elements.loadBlocked.addEventListener("click", () => loadScenario("blocked"));
elements.resetForm.addEventListener("click", resetEvaluation);
elements.downloadReport.addEventListener("click", downloadReport);
[elements.voltage, elements.stateOfCharge, elements.storage].forEach((input) => input.addEventListener("input", updateDisplayedValues));

updateDisplayedValues();
