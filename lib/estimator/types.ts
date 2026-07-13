export type ProjectType =
  | "Afforestation"
  | "Reforestation"
  | "Revegetation"
  | "Agroforestry"
  | "Mangrove Restoration"
  | "Plastic Waste Recycling";

export type RegistryPathway =
  | "Verra"
  | "Gold Standard"
  | "Internal estimate only"
  | "Not sure";

export type CurrencyCode = "USD" | "INR" | "EUR" | "GBP";

export type ConfidenceLevel =
  | "Low confidence"
  | "Medium confidence"
  | "High pre-feasibility confidence";

export type EngineName =
  | "ARR_ENGINE"
  | "MANGROVE_ENGINE"
  | "PLASTIC_RECYCLING_ENGINE";

export type EvidenceAnswer = Record<string, boolean>;

export type CommonEstimatorInput = {
  projectType: ProjectType;
  country: string;
  state: string;
  location: string;
  registryPathway: RegistryPathway;
  projectDurationYears: number;
  currency: CurrencyCode;
  creditPriceAssumption: number;
};

export type ArrEstimatorInput = CommonEstimatorInput & {
  landAreaHa: number;
  currentLandCondition: string;
  projectActivity: string;
  treeSpeciesList: string;
  numberOfSpecies: number;
  plantingDensityPerHa: number;
  totalTreesPlanted: number;
  survivalRatePercent: number;
  plantationAgeYears: number;
  monitoringFrequency: string;
  baselineFactor: number;
  annualSequestrationFactor: number;
  sequestrationScenario: "Conservative" | "Moderate" | "Optimistic" | "Custom";
  leakagePercent: number;
  bufferPercent: number;
  uncertaintyPercent: number;
  cropType?: string;
  treeCropSpacing?: string;
  farmOwnershipModel?: string;
  numberOfFarmers?: number;
  averageLandPerFarmer?: number;
  existingCropRevenue?: number;
  agroforestryIncomeLayer?: number;
  treeHarvestPlanned?: boolean;
  harvestCycleYears?: number;
  evidence: EvidenceAnswer;
};

export type MangroveEstimatorInput = CommonEstimatorInput & {
  areaHa: number;
  activityType: string;
  baselineCondition: string;
  abovegroundFactor: number;
  belowgroundFactor: number;
  soilOrganicCarbonFactor: number;
  totalBlueCarbonFactor: number;
  baselineFactor: number;
  projectEmissionsTco2e: number;
  leakagePercent: number;
  bufferPercent: number;
  uncertaintyPercent: number;
  sequestrationScenario: "Conservative" | "Moderate" | "Optimistic" | "Custom";
  evidence: EvidenceAnswer;
};

export type PlasticFrequency = "One-time batch" | "Daily" | "Monthly" | "Annual";
export type PlasticInputMethod = "Bottle count" | "Weight in kg" | "Weight in MT";
export type PlasticType = "PET" | "HDPE" | "LDPE" | "PP" | "Mixed plastic" | "Other";

export type PlasticEstimatorInput = Omit<CommonEstimatorInput, "projectDurationYears"> & {
  projectDurationYears: number;
  plasticType: PlasticType;
  inputMethod: PlasticInputMethod;
  bottleCount: number;
  averageBottleWeightGrams: number;
  weightKg: number;
  weightMt: number;
  baselineRecyclingKg: number;
  contaminationPercent: number;
  plasticCreditPricePerMt: number;
  co2eSavingFactorKgPerKg: number;
  processingFrequency: PlasticFrequency;
  operatingDaysPerYear: number;
  evidence: EvidenceAnswer;
};

export type EstimatorInput =
  | ArrEstimatorInput
  | MangroveEstimatorInput
  | PlasticEstimatorInput;

export type EstimatorAssumption = {
  label: string;
  value: string | number;
  defaultUsed?: boolean;
};

export type EstimatorResult = {
  engine: EngineName;
  projectType: ProjectType;
  methodologyReference: string;
  registryPathway: RegistryPathway;
  grossImpactTco2e: number;
  baselineDeductionTco2e: number;
  leakageDeductionTco2e: number;
  uncertaintyDeductionTco2e: number;
  bufferDeductionTco2e: number;
  projectEmissionsTco2e: number;
  netEstimatedCredits: number;
  estimatedPlasticCredits: number;
  estimatedCo2eBenefitKg: number;
  estimatedCarbonEquivalentTco2e: number;
  estimatedValue: number;
  annualNetCredits: number;
  readinessScore: number;
  confidenceLevel: ConfidenceLevel;
  missingEvidence: string[];
  assumptions: EstimatorAssumption[];
  disclaimerText: string;
  warnings: string[];
  outputRows: { label: string; value: string }[];
  deductions: { label: string; value: number }[];
};
