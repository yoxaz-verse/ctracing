import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateArrEstimate,
  calculateMangroveEstimate,
  calculatePlasticEstimate,
} from "../lib/estimator/engines";

const common = {
  country: "India",
  state: "Karnataka",
  location: "Test site",
  registryPathway: "Verra" as const,
  projectDurationYears: 20,
  currency: "USD" as const,
  creditPriceAssumption: 10,
};

test("PET plastic bottle count estimate matches required example", () => {
  const result = calculatePlasticEstimate({
    ...common,
    projectType: "Plastic Waste Recycling",
    plasticType: "PET",
    inputMethod: "Bottle count",
    bottleCount: 50000,
    averageBottleWeightGrams: 20,
    weightKg: 0,
    weightMt: 0,
    baselineRecyclingKg: 0,
    contaminationPercent: 0,
    plasticCreditPricePerMt: 80,
    co2eSavingFactorKgPerKg: 1.7,
    processingFrequency: "One-time batch",
    operatingDaysPerYear: 300,
    evidence: {},
  });

  assert.equal(result.estimatedPlasticCredits, 1);
  assert.equal(result.estimatedCo2eBenefitKg, 1700);
  assert.equal(result.estimatedCarbonEquivalentTco2e, 1.7);
});

test("ARR estimate matches required example", () => {
  const result = calculateArrEstimate({
    ...common,
    projectType: "Afforestation",
    landAreaHa: 100,
    currentLandCondition: "Degraded land",
    projectActivity: "New tree planting",
    treeSpeciesList: "Native mixed species",
    numberOfSpecies: 5,
    plantingDensityPerHa: 1000,
    totalTreesPlanted: 100000,
    survivalRatePercent: 80,
    plantationAgeYears: 0,
    monitoringFrequency: "Annual",
    baselineFactor: 1,
    annualSequestrationFactor: 6,
    sequestrationScenario: "Moderate",
    leakagePercent: 10,
    uncertaintyPercent: 5,
    bufferPercent: 20,
    evidence: {},
  });

  assert.equal(result.grossImpactTco2e, 12000);
  assert.equal(result.baselineDeductionTco2e, 2000);
  assert.equal(result.leakageDeductionTco2e, 1000);
  assert.equal(result.uncertaintyDeductionTco2e, 500);
  assert.equal(result.bufferDeductionTco2e, 2000);
  assert.equal(result.netEstimatedCredits, 6500);
});

test("Mangrove estimate matches required example", () => {
  const result = calculateMangroveEstimate({
    ...common,
    projectType: "Mangrove Restoration",
    areaHa: 50,
    activityType: "Mangrove restoration",
    baselineCondition: "Degraded mangrove",
    abovegroundFactor: 0,
    belowgroundFactor: 0,
    soilOrganicCarbonFactor: 0,
    totalBlueCarbonFactor: 10,
    baselineFactor: 2,
    projectEmissionsTco2e: 100,
    leakagePercent: 5,
    uncertaintyPercent: 10,
    bufferPercent: 20,
    sequestrationScenario: "Moderate",
    evidence: {},
  });

  assert.equal(result.grossImpactTco2e, 10000);
  assert.equal(result.baselineDeductionTco2e, 2000);
  assert.equal(result.projectEmissionsTco2e, 100);
  assert.equal(
    result.leakageDeductionTco2e +
      result.uncertaintyDeductionTco2e +
      result.bufferDeductionTco2e,
    2800,
  );
  assert.equal(result.netEstimatedCredits, 5100);
});

test("engine validation rejects invalid numeric inputs", () => {
  assert.throws(
    () =>
      calculateArrEstimate({
        ...common,
        projectType: "Reforestation",
        landAreaHa: -1,
        currentLandCondition: "Barren land",
        projectActivity: "New tree planting",
        treeSpeciesList: "",
        numberOfSpecies: 1,
        plantingDensityPerHa: 1000,
        totalTreesPlanted: 1000,
        survivalRatePercent: 80,
        plantationAgeYears: 0,
        monitoringFrequency: "Annual",
        baselineFactor: 0,
        annualSequestrationFactor: 6,
        sequestrationScenario: "Custom",
        leakagePercent: 10,
        uncertaintyPercent: 5,
        bufferPercent: 20,
        evidence: {},
      }),
    /Land area must be greater than zero/,
  );

  assert.throws(
    () =>
      calculatePlasticEstimate({
        ...common,
        projectType: "Plastic Waste Recycling",
        plasticType: "PET",
        inputMethod: "Bottle count",
        bottleCount: 100,
        averageBottleWeightGrams: 0,
        weightKg: 0,
        weightMt: 0,
        baselineRecyclingKg: 0,
        contaminationPercent: 0,
        plasticCreditPricePerMt: 80,
        co2eSavingFactorKgPerKg: 1.7,
        processingFrequency: "One-time batch",
        operatingDaysPerYear: 300,
        evidence: {},
      }),
    /Bottle weight must be greater than zero/,
  );

  assert.throws(
    () =>
      calculateMangroveEstimate({
        ...common,
        projectType: "Mangrove Restoration",
        areaHa: 10,
        activityType: "Mangrove restoration",
        baselineCondition: "Mudflat",
        abovegroundFactor: 0,
        belowgroundFactor: 0,
        soilOrganicCarbonFactor: 0,
        totalBlueCarbonFactor: 10,
        baselineFactor: 0,
        projectEmissionsTco2e: 0,
        leakagePercent: 101,
        uncertaintyPercent: 5,
        bufferPercent: 20,
        sequestrationScenario: "Custom",
        evidence: {},
      }),
    /Leakage must be between 0 and 100/,
  );
});

test("default assumption flags appear when scenarios are used", () => {
  const result = calculateArrEstimate({
    ...common,
    projectType: "Agroforestry",
    landAreaHa: 10,
    currentLandCondition: "Agricultural land",
    projectActivity: "Agroforestry",
    treeSpeciesList: "Mango",
    numberOfSpecies: 1,
    plantingDensityPerHa: 100,
    totalTreesPlanted: 1000,
    survivalRatePercent: 75,
    plantationAgeYears: 0,
    monitoringFrequency: "Annual",
    baselineFactor: 0,
    annualSequestrationFactor: 6,
    sequestrationScenario: "Moderate",
    leakagePercent: 10,
    uncertaintyPercent: 5,
    bufferPercent: 20,
    evidence: {},
  });

  assert.equal(
    result.assumptions.some((assumption) => assumption.defaultUsed),
    true,
  );
});
