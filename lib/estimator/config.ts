import type { ProjectType } from "./types";

export const ESTIMATE_DISCLAIMER =
  "Estimate only — final issuance depends on approved methodology, baseline, additionality, monitoring, validation, verification, and registry approval.";

export const additionalDisclaimers = [
  "This is a pre-feasibility estimate and not a certified carbon credit issuance.",
  "Final credits depend on methodology eligibility, additionality, baseline, leakage, monitoring, validation, verification, and registry approval.",
  "Plastic credits are not the same as carbon credits. CO2e benefit shown for plastic is only an indicative environmental impact estimate.",
  "Nature-based project estimates vary by species, geography, survival, soil, climate, permanence risk, and monitoring data.",
];

export const projectTypes: ProjectType[] = [
  "Afforestation",
  "Reforestation",
  "Revegetation",
  "Agroforestry",
  "Mangrove Restoration",
  "Plastic Waste Recycling",
];

export const methodologyReferences = [
  {
    registry: "Verra",
    methodologyCode: "VM0047",
    methodologyName: "Afforestation, Reforestation and Revegetation",
    version: "v1.1",
    projectTypes: ["Afforestation", "Reforestation", "Revegetation", "Agroforestry"],
    sourceUrl: "https://verra.org/methodologies/vm0047/",
    summary:
      "ARR activities that establish, increase, or restore vegetative cover and quantify carbon removals.",
    activeStatus: "active",
  },
  {
    registry: "Verra",
    methodologyCode: "VM0033",
    methodologyName: "Methodology for Tidal Wetland and Seagrass Restoration",
    version: "v2.1",
    projectTypes: ["Mangrove Restoration"],
    sourceUrl: "https://verra.org/methodologies/vm0033/",
    summary:
      "Blue-carbon pathway for tidal wetland, seagrass, and mangrove restoration pre-feasibility.",
    activeStatus: "active",
  },
  {
    registry: "Verra",
    methodologyCode: "PWRM0002",
    methodologyName: "Plastic Waste Recycling Methodology",
    version: "v1.1",
    projectTypes: ["Plastic Waste Recycling"],
    sourceUrl: "https://verra.org/programs/plastic-waste-reduction-standard/",
    summary:
      "Quantifies additional eligible plastic waste recycled; one Plastic Credit is one metric tonne subject to baseline and verification.",
    activeStatus: "active",
  },
  {
    registry: "Gold Standard",
    methodologyCode: "NBS-PATHWAY",
    methodologyName: "Nature-based solutions pathway placeholder",
    version: "estimate only",
    projectTypes: ["Afforestation", "Reforestation", "Revegetation", "Agroforestry"],
    sourceUrl: "https://www.goldstandard.org/",
    summary:
      "Alternative pathway placeholder; eligibility still requires methodology selection and validation.",
    activeStatus: "placeholder",
  },
];

export const defaultFactors = {
  arrSequestration: {
    Conservative: 3,
    Moderate: 6,
    Optimistic: 10,
  },
  mangroveSequestration: {
    Conservative: 5,
    Moderate: 10,
    Optimistic: 15,
  },
  plasticCo2eKgPerKg: {
    PET: 1.7,
    HDPE: 1.5,
    LDPE: 1.35,
    PP: 1.45,
    "Mixed plastic": 1.2,
    Other: 1,
  },
  plasticBottleWeightGrams: {
    PET: 20,
  },
  deductions: {
    leakagePercent: 10,
    uncertaintyPercent: 5,
    bufferPercent: 20,
    contaminationPercent: 0,
  },
  prices: {
    carbonCreditUsd: 12,
    plasticCreditUsd: 80,
  },
};

export const readinessWeights = {
  arr: {
    landOwnership: ["Land ownership/tenure proof", 15],
    gpsBoundary: ["GPS boundary/KML/shapefile", 15],
    baselineEvidence: ["Baseline land condition evidence", 15],
    speciesPlan: ["Species and planting plan", 10],
    monitoringPlan: ["Monitoring plan", 10],
    photos: ["Photo/video evidence", 5],
    agreements: ["Community/farmer agreements", 10],
    leakageRisk: ["Leakage/risk assessment", 10],
    registryPathway: ["Validation/verification pathway selected", 10],
  },
  mangrove: {
    tenureProof: ["Coastal/land tenure proof", 15],
    gpsBoundary: ["GPS boundary/KML/shapefile", 15],
    baselineEcology: ["Baseline ecological condition", 15],
    hydrologyAssessment: ["Hydrology assessment", 15],
    speciesPlan: ["Species/restoration plan", 10],
    communityAgreement: ["Community agreement", 10],
    monitoringPlan: ["Soil/biomass monitoring plan", 10],
    leakageRisk: ["Risk/leakage assessment", 10],
  },
  plastic: {
    facilityRegistration: ["Facility/recycler registration", 15],
    weighbridgeSlips: ["Weighbridge slips", 15],
    recyclerInvoice: ["Recycler invoice/batch records", 15],
    baselineData: ["Baseline recycling data", 15],
    segregationProof: ["Plastic type segregation proof", 10],
    photos: ["Photos/video evidence", 5],
    sensorData: ["Sensor/bottle count data", 10],
    contaminationTracking: ["Contamination/rejection tracking", 5],
    traceability: ["Buyer/processor traceability", 10],
  },
} as const;
