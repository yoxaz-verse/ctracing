import {
  ESTIMATE_DISCLAIMER,
  defaultFactors,
  readinessWeights,
} from "./config";
import type {
  ArrEstimatorInput,
  ConfidenceLevel,
  EstimatorAssumption,
  EstimatorResult,
  MangroveEstimatorInput,
  PlasticEstimatorInput,
  ProjectType,
  RegistryPathway,
} from "./types";

function assertPositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }
}

function assertNonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} cannot be negative.`);
  }
}

function assertPercent(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${label} must be between 0 and 100.`);
  }
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function confidenceLevel(score: number): ConfidenceLevel {
  if (score <= 40) {
    return "Low confidence";
  }
  if (score <= 70) {
    return "Medium confidence";
  }
  return "High pre-feasibility confidence";
}

function formatNumber(value: number, suffix = "") {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(round(value))}${suffix}`;
}

function methodologyFor(projectType: ProjectType, registryPathway: RegistryPathway) {
  if (registryPathway === "Gold Standard") {
    return "Gold Standard Nature-Based Solutions pathway placeholder";
  }
  if (projectType === "Mangrove Restoration") {
    return "Verra VM0033";
  }
  if (projectType === "Plastic Waste Recycling") {
    return "Verra PWRM0002";
  }
  return "Verra VM0047";
}

function scoreEvidence(
  weights: Record<string, readonly [string, number]>,
  evidence: Record<string, boolean>,
) {
  let score = 0;
  const missing: string[] = [];

  Object.entries(weights).forEach(([key, [label, weight]]) => {
    if (evidence[key]) {
      score += weight;
    } else {
      missing.push(label);
    }
  });

  return { score, missing };
}

function deductionRows(
  baselineDeductionTco2e: number,
  leakageDeductionTco2e: number,
  uncertaintyDeductionTco2e: number,
  bufferDeductionTco2e: number,
  projectEmissionsTco2e = 0,
) {
  return [
    { label: "Baseline", value: baselineDeductionTco2e },
    { label: "Leakage", value: leakageDeductionTco2e },
    { label: "Uncertainty", value: uncertaintyDeductionTco2e },
    { label: "Risk buffer", value: bufferDeductionTco2e },
    ...(projectEmissionsTco2e > 0
      ? [{ label: "Project emissions", value: projectEmissionsTco2e }]
      : []),
  ];
}

export function calculateArrEstimate(input: ArrEstimatorInput): EstimatorResult {
  assertPositive(input.landAreaHa, "Land area");
  assertPositive(input.projectDurationYears, "Project duration");
  assertNonNegative(input.baselineFactor, "Baseline carbon stock factor");
  assertPositive(input.annualSequestrationFactor, "Annual sequestration factor");
  assertPercent(input.leakagePercent, "Leakage");
  assertPercent(input.uncertaintyPercent, "Uncertainty");
  assertPercent(input.bufferPercent, "Buffer/risk");
  assertPercent(input.survivalRatePercent, "Expected survival rate");

  const grossImpactTco2e =
    input.landAreaHa *
    input.annualSequestrationFactor *
    input.projectDurationYears;
  const baselineDeductionTco2e =
    input.landAreaHa * input.baselineFactor * input.projectDurationYears;
  const additionalRemovals = Math.max(grossImpactTco2e - baselineDeductionTco2e, 0);
  const leakageDeductionTco2e = additionalRemovals * (input.leakagePercent / 100);
  const uncertaintyDeductionTco2e =
    additionalRemovals * (input.uncertaintyPercent / 100);
  const bufferDeductionTco2e = additionalRemovals * (input.bufferPercent / 100);
  const netEstimatedCredits = Math.max(
    additionalRemovals -
      leakageDeductionTco2e -
      uncertaintyDeductionTco2e -
      bufferDeductionTco2e,
    0,
  );
  const estimatedValue = netEstimatedCredits * input.creditPriceAssumption;
  const estimatedSurvivingTrees =
    input.totalTreesPlanted * (input.survivalRatePercent / 100);
  const { score, missing } = scoreEvidence(readinessWeights.arr, input.evidence);
  const methodologyReference = methodologyFor(input.projectType, input.registryPathway);
  const assumptions: EstimatorAssumption[] = [
    {
      label: "Annual sequestration factor",
      value: `${input.annualSequestrationFactor} tCO2e/ha/year`,
      defaultUsed: input.sequestrationScenario !== "Custom",
    },
    { label: "Baseline factor", value: `${input.baselineFactor} tCO2e/ha/year` },
    { label: "Leakage", value: `${input.leakagePercent}%` },
    { label: "Uncertainty", value: `${input.uncertaintyPercent}%` },
    { label: "Risk buffer", value: `${input.bufferPercent}%` },
  ];

  return {
    engine: "ARR_ENGINE",
    projectType: input.projectType,
    methodologyReference,
    registryPathway: input.registryPathway,
    grossImpactTco2e: round(grossImpactTco2e),
    baselineDeductionTco2e: round(baselineDeductionTco2e),
    leakageDeductionTco2e: round(leakageDeductionTco2e),
    uncertaintyDeductionTco2e: round(uncertaintyDeductionTco2e),
    bufferDeductionTco2e: round(bufferDeductionTco2e),
    projectEmissionsTco2e: 0,
    netEstimatedCredits: round(netEstimatedCredits),
    estimatedPlasticCredits: 0,
    estimatedCo2eBenefitKg: 0,
    estimatedCarbonEquivalentTco2e: 0,
    estimatedValue: round(estimatedValue),
    annualNetCredits: round(netEstimatedCredits / input.projectDurationYears),
    readinessScore: score,
    confidenceLevel: confidenceLevel(score),
    missingEvidence: missing,
    assumptions,
    disclaimerText: ESTIMATE_DISCLAIMER,
    warnings: [
      "ARR crediting requires project boundary, baseline, additionality, leakage assessment, permanence/risk buffer, monitoring, validation and verification.",
      ...(input.projectType === "Agroforestry"
        ? [
            "Agroforestry projects require farmer agreements, parcel mapping, long-term monitoring, harvest tracking, and leakage assessment if crop production shifts elsewhere.",
          ]
        : []),
    ],
    outputRows: [
      { label: "Total trees planted", value: formatNumber(input.totalTreesPlanted) },
      { label: "Estimated surviving trees", value: formatNumber(estimatedSurvivingTrees) },
      { label: "Gross estimated removals", value: formatNumber(grossImpactTco2e, " tCO2e") },
      { label: "Baseline deduction", value: formatNumber(baselineDeductionTco2e, " tCO2e") },
      { label: "Leakage deduction", value: formatNumber(leakageDeductionTco2e, " tCO2e") },
      { label: "Buffer deduction", value: formatNumber(bufferDeductionTco2e, " tCO2e") },
      { label: "Net estimated credits", value: formatNumber(netEstimatedCredits) },
      { label: "Estimated project value", value: formatNumber(estimatedValue) },
    ],
    deductions: deductionRows(
      baselineDeductionTco2e,
      leakageDeductionTco2e,
      uncertaintyDeductionTco2e,
      bufferDeductionTco2e,
    ),
  };
}

export function calculateMangroveEstimate(
  input: MangroveEstimatorInput,
): EstimatorResult {
  assertPositive(input.areaHa, "Project area");
  assertPositive(input.projectDurationYears, "Project duration");
  assertPositive(input.totalBlueCarbonFactor, "Total blue carbon factor");
  assertNonNegative(input.baselineFactor, "Baseline factor");
  assertNonNegative(input.projectEmissionsTco2e, "Project emissions");
  assertPercent(input.leakagePercent, "Leakage");
  assertPercent(input.uncertaintyPercent, "Uncertainty");
  assertPercent(input.bufferPercent, "Buffer/risk");

  const grossImpactTco2e =
    input.areaHa * input.totalBlueCarbonFactor * input.projectDurationYears;
  const baselineDeductionTco2e =
    input.areaHa * input.baselineFactor * input.projectDurationYears;
  const additionalImpact = Math.max(grossImpactTco2e - baselineDeductionTco2e, 0);
  const leakageDeductionTco2e = additionalImpact * (input.leakagePercent / 100);
  const uncertaintyDeductionTco2e = additionalImpact * (input.uncertaintyPercent / 100);
  const bufferDeductionTco2e = additionalImpact * (input.bufferPercent / 100);
  const netEstimatedCredits = Math.max(
    additionalImpact -
      input.projectEmissionsTco2e -
      leakageDeductionTco2e -
      uncertaintyDeductionTco2e -
      bufferDeductionTco2e,
    0,
  );
  const estimatedValue = netEstimatedCredits * input.creditPriceAssumption;
  const { score, missing } = scoreEvidence(readinessWeights.mangrove, input.evidence);

  return {
    engine: "MANGROVE_ENGINE",
    projectType: input.projectType,
    methodologyReference: methodologyFor(input.projectType, input.registryPathway),
    registryPathway: input.registryPathway,
    grossImpactTco2e: round(grossImpactTco2e),
    baselineDeductionTco2e: round(baselineDeductionTco2e),
    leakageDeductionTco2e: round(leakageDeductionTco2e),
    uncertaintyDeductionTco2e: round(uncertaintyDeductionTco2e),
    bufferDeductionTco2e: round(bufferDeductionTco2e),
    projectEmissionsTco2e: round(input.projectEmissionsTco2e),
    netEstimatedCredits: round(netEstimatedCredits),
    estimatedPlasticCredits: 0,
    estimatedCo2eBenefitKg: 0,
    estimatedCarbonEquivalentTco2e: 0,
    estimatedValue: round(estimatedValue),
    annualNetCredits: round(netEstimatedCredits / input.projectDurationYears),
    readinessScore: score,
    confidenceLevel: confidenceLevel(score),
    missingEvidence: missing,
    assumptions: [
      {
        label: "Total blue carbon factor",
        value: `${input.totalBlueCarbonFactor} tCO2e/ha/year`,
        defaultUsed: input.sequestrationScenario !== "Custom",
      },
      { label: "Baseline factor", value: `${input.baselineFactor} tCO2e/ha/year` },
      { label: "Project emissions", value: `${input.projectEmissionsTco2e} tCO2e` },
      { label: "Leakage", value: `${input.leakagePercent}%` },
      { label: "Uncertainty", value: `${input.uncertaintyPercent}%` },
      { label: "Risk buffer", value: `${input.bufferPercent}%` },
    ],
    disclaimerText: ESTIMATE_DISCLAIMER,
    warnings: [
      "Mangrove/blue carbon projects require hydrological, ecological, soil carbon, boundary, tenure, and permanence assessment before crediting.",
    ],
    outputRows: [
      { label: "Estimated blue carbon removals", value: formatNumber(grossImpactTco2e, " tCO2e") },
      { label: "Baseline deduction", value: formatNumber(baselineDeductionTco2e, " tCO2e") },
      { label: "Project emissions deduction", value: formatNumber(input.projectEmissionsTco2e, " tCO2e") },
      { label: "Leakage deduction", value: formatNumber(leakageDeductionTco2e, " tCO2e") },
      { label: "Buffer deduction", value: formatNumber(bufferDeductionTco2e, " tCO2e") },
      { label: "Net estimated credits", value: formatNumber(netEstimatedCredits) },
      { label: "Estimated value", value: formatNumber(estimatedValue) },
    ],
    deductions: deductionRows(
      baselineDeductionTco2e,
      leakageDeductionTco2e,
      uncertaintyDeductionTco2e,
      bufferDeductionTco2e,
      input.projectEmissionsTco2e,
    ),
  };
}

function plasticInputKg(input: PlasticEstimatorInput) {
  if (input.inputMethod === "Bottle count") {
    assertNonNegative(input.bottleCount, "Bottle count");
    assertPositive(input.averageBottleWeightGrams, "Bottle weight");
    return (input.bottleCount * input.averageBottleWeightGrams) / 1000;
  }
  if (input.inputMethod === "Weight in MT") {
    assertNonNegative(input.weightMt, "Weight in MT");
    return input.weightMt * 1000;
  }
  assertNonNegative(input.weightKg, "Weight in kg");
  return input.weightKg;
}

function annualizePlasticKg(input: PlasticEstimatorInput, kg: number) {
  if (input.processingFrequency === "Daily") {
    assertPositive(input.operatingDaysPerYear, "Operating days per year");
    return kg * input.operatingDaysPerYear;
  }
  if (input.processingFrequency === "Monthly") {
    return kg * 12;
  }
  return kg;
}

export function calculatePlasticEstimate(
  input: PlasticEstimatorInput,
): EstimatorResult {
  assertPositive(input.projectDurationYears, "Project duration");
  assertNonNegative(input.baselineRecyclingKg, "Baseline recycling");
  assertPercent(input.contaminationPercent, "Contamination/rejection");
  assertPositive(input.co2eSavingFactorKgPerKg, "CO2e saving factor");
  assertNonNegative(input.plasticCreditPricePerMt, "Plastic credit price");

  const batchInputKg = plasticInputKg(input);
  const totalPlasticKg = annualizePlasticKg(input, batchInputKg);
  const netAfterContaminationKg =
    totalPlasticKg * (1 - input.contaminationPercent / 100);
  const additionalRecycledKg = Math.max(
    netAfterContaminationKg - input.baselineRecyclingKg,
    0,
  );
  const estimatedPlasticCredits = additionalRecycledKg / 1000;
  const estimatedCo2eBenefitKg =
    additionalRecycledKg * input.co2eSavingFactorKgPerKg;
  const estimatedCarbonEquivalentTco2e = estimatedCo2eBenefitKg / 1000;
  const estimatedValue = estimatedPlasticCredits * input.plasticCreditPricePerMt;
  const optionalCarbonEquivalentValue =
    estimatedCarbonEquivalentTco2e * input.creditPriceAssumption;
  const { score, missing } = scoreEvidence(readinessWeights.plastic, input.evidence);

  return {
    engine: "PLASTIC_RECYCLING_ENGINE",
    projectType: input.projectType,
    methodologyReference: methodologyFor(input.projectType, input.registryPathway),
    registryPathway: input.registryPathway,
    grossImpactTco2e: round(estimatedCarbonEquivalentTco2e),
    baselineDeductionTco2e: round(input.baselineRecyclingKg / 1000),
    leakageDeductionTco2e: 0,
    uncertaintyDeductionTco2e: 0,
    bufferDeductionTco2e: round((totalPlasticKg - netAfterContaminationKg) / 1000),
    projectEmissionsTco2e: 0,
    netEstimatedCredits: round(estimatedCarbonEquivalentTco2e),
    estimatedPlasticCredits: round(estimatedPlasticCredits),
    estimatedCo2eBenefitKg: round(estimatedCo2eBenefitKg),
    estimatedCarbonEquivalentTco2e: round(estimatedCarbonEquivalentTco2e),
    estimatedValue: round(estimatedValue),
    annualNetCredits: round(estimatedPlasticCredits),
    readinessScore: score,
    confidenceLevel: confidenceLevel(score),
    missingEvidence: missing,
    assumptions: [
      { label: "Plastic input", value: `${round(totalPlasticKg)} kg` },
      {
        label: "Contamination/rejection",
        value: `${input.contaminationPercent}%`,
        defaultUsed: input.contaminationPercent === defaultFactors.deductions.contaminationPercent,
      },
      { label: "Baseline recycling", value: `${input.baselineRecyclingKg} kg` },
      {
        label: "CO2e saving factor",
        value: `${input.co2eSavingFactorKgPerKg} kgCO2e/kg`,
        defaultUsed: input.plasticType !== "Other",
      },
      { label: "Plastic credit price", value: input.plasticCreditPricePerMt },
    ],
    disclaimerText: ESTIMATE_DISCLAIMER,
    warnings: [
      "Plastic Credits are not the same as carbon credits. Carbon-equivalent is an indicative environmental impact estimate only.",
    ],
    outputRows: [
      { label: "Total plastic input", value: formatNumber(totalPlasticKg, " kg") },
      { label: "Net eligible plastic after contamination", value: formatNumber(netAfterContaminationKg, " kg") },
      { label: "Additional eligible recycled plastic", value: formatNumber(additionalRecycledKg, " kg") },
      { label: "Estimated Verra Waste Recycling Credits", value: formatNumber(estimatedPlasticCredits) },
      { label: "Estimated plastic credit value", value: formatNumber(estimatedValue) },
      { label: "Estimated CO2e benefit", value: formatNumber(estimatedCo2eBenefitKg, " kgCO2e") },
      { label: "Estimated carbon-equivalent", value: formatNumber(estimatedCarbonEquivalentTco2e, " tCO2e") },
      { label: "Optional carbon-equivalent value", value: formatNumber(optionalCarbonEquivalentValue) },
    ],
    deductions: [
      { label: "Baseline recycling", value: input.baselineRecyclingKg / 1000 },
      { label: "Contamination", value: (totalPlasticKg - netAfterContaminationKg) / 1000 },
    ],
  };
}

export function calculateEstimate(input: ArrEstimatorInput | MangroveEstimatorInput | PlasticEstimatorInput) {
  if (input.projectType === "Plastic Waste Recycling") {
    return calculatePlasticEstimate(input as PlasticEstimatorInput);
  }
  if (input.projectType === "Mangrove Restoration") {
    return calculateMangroveEstimate(input as MangroveEstimatorInput);
  }
  return calculateArrEstimate(input as ArrEstimatorInput);
}
