"use client";

import { useMemo, useState } from "react";
import {
  additionalDisclaimers,
  defaultFactors,
  projectTypes,
  readinessWeights,
} from "@/lib/estimator/config";
import { calculateEstimate } from "@/lib/estimator/engines";
import type {
  ArrEstimatorInput,
  CurrencyCode,
  EstimatorInput,
  EstimatorResult,
  MangroveEstimatorInput,
  PlasticEstimatorInput,
  PlasticInputMethod,
  PlasticType,
  ProjectType,
  RegistryPathway,
} from "@/lib/estimator/types";

type EstimatorMode = "public" | "dashboard";
type UserRole = "buyer" | "seller" | "admin";

type CarbonEstimatorProps = {
  mode?: EstimatorMode;
  userRole?: UserRole;
  saveAction?: (formData: FormData) => void | Promise<void>;
  redirectTo?: string;
};

const registryPathways: RegistryPathway[] = [
  "Verra",
  "Gold Standard",
  "Internal estimate only",
  "Not sure",
];
const currencies: CurrencyCode[] = ["USD", "INR", "EUR", "GBP"];
const arrActivities = [
  "New tree planting",
  "Assisted natural regeneration",
  "Enrichment planting",
  "Mixed native vegetation restoration",
  "Agroforestry",
];
const landConditions = [
  "Degraded land",
  "Barren land",
  "Low tree-cover land",
  "Existing sparse vegetation",
  "Agricultural land",
  "Other",
];
const mangroveActivities = [
  "Mangrove restoration",
  "Tidal hydrology restoration",
  "Assisted natural regeneration",
  "Replanting",
  "Protection and restoration",
];
const mangroveConditions = [
  "Degraded mangrove",
  "Abandoned aquaculture pond",
  "Mudflat",
  "Eroded coastal land",
  "Other",
];
const plasticTypes: PlasticType[] = ["PET", "HDPE", "LDPE", "PP", "Mixed plastic", "Other"];
const plasticInputMethods: PlasticInputMethod[] = [
  "Bottle count",
  "Weight in kg",
  "Weight in MT",
];
const estimatorSteps = [
  {
    id: 1,
    label: "Project",
    detail: "Choose project type, location, registry, duration, and currency.",
  },
  {
    id: 2,
    label: "Inputs",
    detail: "Enter project-specific activity, area, trees, mangroves, or plastic data.",
  },
  {
    id: 3,
    label: "Assumptions",
    detail: "Review default factors, deductions, and credit price assumptions.",
  },
  {
    id: 4,
    label: "Results",
    detail: "See estimated credits, value, impact, deductions, and charts.",
  },
  {
    id: 5,
    label: "Evidence",
    detail: "Check missing documents and registry-readiness score.",
  },
  {
    id: 6,
    label: "Export",
    detail: "Review structured estimate data for future PDF or CSV export.",
  },
];

const inputClass =
  "mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--brand)]";
const labelClass = "text-sm font-medium text-[var(--text-label)]";

function asNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumber(value: number, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

function scenarioFactor(projectType: ProjectType, scenario: string) {
  if (projectType === "Mangrove Restoration") {
    return defaultFactors.mangroveSequestration[
      scenario as keyof typeof defaultFactors.mangroveSequestration
    ];
  }
  return defaultFactors.arrSequestration[
    scenario as keyof typeof defaultFactors.arrSequestration
  ];
}

function methodologyLabel(projectType: ProjectType, registryPathway: RegistryPathway) {
  if (registryPathway === "Gold Standard") {
    return "Gold Standard Nature-Based Solutions pathway placeholder";
  }
  if (projectType === "Plastic Waste Recycling") {
    return "Verra PWRM0002";
  }
  if (projectType === "Mangrove Restoration") {
    return "Verra VM0033";
  }
  return "Verra VM0047";
}

function readinessKeys(projectType: ProjectType) {
  if (projectType === "Plastic Waste Recycling") {
    return readinessWeights.plastic;
  }
  if (projectType === "Mangrove Restoration") {
    return readinessWeights.mangrove;
  }
  return readinessWeights.arr;
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  wide?: boolean;
}) {
  return (
    <Field label={label} wide={wide}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = "any",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(asNumber(event.target.value))}
        className={inputClass}
      />
    </Field>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <Field label={label} wide={wide}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </Field>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
      <div
        className="h-full rounded-full bg-[var(--brand)]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-heading)]">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{detail}</p> : null}
    </div>
  );
}

function ResultCharts({ result }: { result: EstimatorResult }) {
  const maxImpact = Math.max(result.grossImpactTco2e, result.netEstimatedCredits, 1);
  const totalDeductions = result.deductions.reduce((sum, row) => sum + row.value, 0) || 1;
  const annualRows = Array.from({ length: Math.min(10, Math.max(1, Math.round(result.netEstimatedCredits ? result.netEstimatedCredits / result.annualNetCredits : 1))) }).map(
    (_, index) => ({
      year: index + 1,
      value: result.annualNetCredits,
    }),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
        <h3 className="font-semibold text-[var(--text-heading)]">Gross vs net impact</h3>
        <div className="mt-4 space-y-4">
          {[
            ["Gross", result.grossImpactTco2e],
            ["Net", result.netEstimatedCredits],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]">
                <span>{label}</span>
                <span>{formatNumber(value as number)}</span>
              </div>
              <ProgressBar value={((value as number) / maxImpact) * 100} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
        <h3 className="font-semibold text-[var(--text-heading)]">Deductions breakdown</h3>
        <div className="mt-4 space-y-3">
          {result.deductions.map((row) => (
            <div key={row.label}>
              <div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]">
                <span>{row.label}</span>
                <span>{formatNumber(row.value)}</span>
              </div>
              <ProgressBar value={(row.value / totalDeductions) * 100} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
        <h3 className="font-semibold text-[var(--text-heading)]">Annual estimated generation</h3>
        <div className="mt-4 flex h-32 items-end gap-2">
          {annualRows.map((row) => (
            <div key={row.year} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-[var(--brand)]"
                style={{ height: `${Math.max(10, (row.value / Math.max(result.annualNetCredits, 1)) * 100)}%` }}
              />
              <span className="text-[10px] text-[var(--text-muted)]">{row.year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CarbonEstimator({
  mode = "public",
  userRole,
  saveAction,
  redirectTo = "/dashboard/estimator",
}: CarbonEstimatorProps) {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState<ProjectType>("Afforestation");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [location, setLocation] = useState("");
  const [registryPathway, setRegistryPathway] = useState<RegistryPathway>("Verra");
  const [duration, setDuration] = useState(20);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [creditPrice, setCreditPrice] = useState(defaultFactors.prices.carbonCreditUsd);
  const [scenario, setScenario] = useState("Moderate");
  const [evidence, setEvidence] = useState<Record<string, boolean>>({});

  const [arr, setArr] = useState({
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
    annualSequestrationFactor: defaultFactors.arrSequestration.Moderate,
    leakagePercent: defaultFactors.deductions.leakagePercent,
    bufferPercent: defaultFactors.deductions.bufferPercent,
    uncertaintyPercent: defaultFactors.deductions.uncertaintyPercent,
    cropType: "",
    treeCropSpacing: "",
    farmOwnershipModel: "Single landowner",
    numberOfFarmers: 1,
    averageLandPerFarmer: 1,
    existingCropRevenue: 0,
    agroforestryIncomeLayer: 0,
    treeHarvestPlanned: false,
    harvestCycleYears: 0,
  });
  const [mangrove, setMangrove] = useState({
    areaHa: 50,
    activityType: "Mangrove restoration",
    baselineCondition: "Degraded mangrove",
    abovegroundFactor: 0,
    belowgroundFactor: 0,
    soilOrganicCarbonFactor: 0,
    totalBlueCarbonFactor: defaultFactors.mangroveSequestration.Moderate,
    baselineFactor: 2,
    projectEmissionsTco2e: 100,
    leakagePercent: 5,
    bufferPercent: defaultFactors.deductions.bufferPercent,
    uncertaintyPercent: 10,
  });
  const [plastic, setPlastic] = useState({
    plasticType: "PET" as PlasticType,
    inputMethod: "Bottle count" as PlasticInputMethod,
    bottleCount: 50000,
    averageBottleWeightGrams: defaultFactors.plasticBottleWeightGrams.PET,
    weightKg: 1000,
    weightMt: 1,
    baselineRecyclingKg: 0,
    contaminationPercent: defaultFactors.deductions.contaminationPercent,
    plasticCreditPricePerMt: defaultFactors.prices.plasticCreditUsd,
    co2eSavingFactorKgPerKg: defaultFactors.plasticCo2eKgPerKg.PET,
    processingFrequency: "One-time batch",
    operatingDaysPerYear: 300,
  });

  const evidenceWeights = readinessKeys(projectType);
  const input: EstimatorInput = useMemo(() => {
    const common = {
      projectType,
      country,
      state,
      location,
      registryPathway,
      projectDurationYears: Math.max(1, duration),
      currency,
      creditPriceAssumption: Math.max(0, creditPrice),
    };

    if (projectType === "Plastic Waste Recycling") {
      return {
        ...common,
        ...plastic,
        projectType,
        processingFrequency: plastic.processingFrequency as PlasticEstimatorInput["processingFrequency"],
        evidence,
      };
    }
    if (projectType === "Mangrove Restoration") {
      return {
        ...common,
        ...mangrove,
        projectType,
        sequestrationScenario: scenario as MangroveEstimatorInput["sequestrationScenario"],
        evidence,
      };
    }
    return {
      ...common,
      ...arr,
      projectType,
      projectActivity: projectType === "Agroforestry" ? "Agroforestry" : arr.projectActivity,
      sequestrationScenario: scenario as ArrEstimatorInput["sequestrationScenario"],
      evidence,
    };
  }, [
    arr,
    country,
    creditPrice,
    currency,
    duration,
    evidence,
    location,
    mangrove,
    plastic,
    projectType,
    registryPathway,
    scenario,
    state,
  ]);

  const result = useMemo(() => calculateEstimate(input), [input]);
  const resultJson = JSON.stringify(result);
  const inputJson = JSON.stringify(input);
  const isPlastic = projectType === "Plastic Waste Recycling";
  const isMangrove = projectType === "Mangrove Restoration";
  const isAgroforestry = projectType === "Agroforestry";
  const currentStep = estimatorSteps.find((item) => item.id === step) ?? estimatorSteps[0];

  function updateScenario(value: string) {
    setScenario(value);
    if (value !== "Custom") {
      const factor = scenarioFactor(projectType, value);
      if (typeof factor === "number") {
        if (projectType === "Mangrove Restoration") {
          setMangrove((current) => ({ ...current, totalBlueCarbonFactor: factor }));
        } else if (projectType !== "Plastic Waste Recycling") {
          setArr((current) => ({ ...current, annualSequestrationFactor: factor }));
        }
      }
    }
  }

  function updateProjectType(value: string) {
    const nextType = value as ProjectType;
    setProjectType(nextType);
    setEvidence({});
    setScenario("Moderate");
    const nextFactor = scenarioFactor(nextType, "Moderate");
    if (nextType === "Mangrove Restoration" && typeof nextFactor === "number") {
      setMangrove((current) => ({ ...current, totalBlueCarbonFactor: nextFactor }));
    } else if (nextType !== "Plastic Waste Recycling" && typeof nextFactor === "number") {
      setArr((current) => ({ ...current, annualSequestrationFactor: nextFactor }));
    }
  }

  function updatePlasticType(value: string) {
    const nextType = value as PlasticType;
    setPlastic((current) => ({
      ...current,
      plasticType: nextType,
      co2eSavingFactorKgPerKg: defaultFactors.plasticCo2eKgPerKg[nextType],
      averageBottleWeightGrams:
        nextType === "PET"
          ? defaultFactors.plasticBottleWeightGrams.PET
          : current.averageBottleWeightGrams,
    }));
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border-muted)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-soft)]">
            Pre-feasibility estimator
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-heading)]">
            Estimate project impact before formal validation.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            Explore ARR, agroforestry, mangrove, and plastic recycling credit potential with methodology-aligned assumptions.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {estimatorSteps.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
              className={`min-h-14 rounded-2xl border px-3 py-2 text-left text-sm ${
                step === item.id
                  ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--surface)]"
                  : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-label)]"
              }`}
            >
              <span className="block text-xs font-semibold opacity-75">
                Step {item.id}
              </span>
              <span className="block font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
        <p className="text-sm font-semibold text-[var(--text-heading)]">
          Step {currentStep.id}: {currentStep.label}
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
          {currentStep.detail}
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.38fr]">
        <div className="space-y-6">
          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Project type" value={projectType} onChange={updateProjectType} options={projectTypes} />
              <SelectField label="Registry pathway" value={registryPathway} onChange={(value) => setRegistryPathway(value as RegistryPathway)} options={registryPathways} />
              <TextField label="Country" value={country} onChange={setCountry} />
              <TextField label="State / region" value={state} onChange={setState} placeholder="Karnataka" />
              <TextField label="Project area or facility location" value={location} onChange={setLocation} placeholder="District, coastal zone, or facility" wide />
              <NumberField label="Project duration in years" value={duration} onChange={setDuration} min={1} />
              <SelectField label="Currency" value={currency} onChange={(value) => setCurrency(value as CurrencyCode)} options={currencies} />
            </div>
          ) : null}

          {step === 2 && !isPlastic && !isMangrove ? (
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Land area in hectares" value={arr.landAreaHa} onChange={(value) => setArr((current) => ({ ...current, landAreaHa: value }))} min={0.01} />
              <SelectField label="Current land condition" value={arr.currentLandCondition} onChange={(value) => setArr((current) => ({ ...current, currentLandCondition: value }))} options={landConditions} />
              <SelectField label="Project activity" value={isAgroforestry ? "Agroforestry" : arr.projectActivity} onChange={(value) => setArr((current) => ({ ...current, projectActivity: value }))} options={arrActivities} />
              <TextField label="Tree species list" value={arr.treeSpeciesList} onChange={(value) => setArr((current) => ({ ...current, treeSpeciesList: value }))} />
              <NumberField label="Number of species" value={arr.numberOfSpecies} onChange={(value) => setArr((current) => ({ ...current, numberOfSpecies: value }))} min={1} />
              <NumberField label="Planting density per hectare" value={arr.plantingDensityPerHa} onChange={(value) => setArr((current) => ({ ...current, plantingDensityPerHa: value }))} min={0} />
              <NumberField label="Total trees planted" value={arr.totalTreesPlanted} onChange={(value) => setArr((current) => ({ ...current, totalTreesPlanted: value }))} min={0} />
              <NumberField label="Expected survival rate %" value={arr.survivalRatePercent} onChange={(value) => setArr((current) => ({ ...current, survivalRatePercent: value }))} min={0} max={100} />
              <NumberField label="Current age of plantation" value={arr.plantationAgeYears} onChange={(value) => setArr((current) => ({ ...current, plantationAgeYears: value }))} min={0} />
              <TextField label="Monitoring frequency" value={arr.monitoringFrequency} onChange={(value) => setArr((current) => ({ ...current, monitoringFrequency: value }))} />
              {isAgroforestry ? (
                <>
                  <TextField label="Crop type" value={arr.cropType} onChange={(value) => setArr((current) => ({ ...current, cropType: value }))} />
                  <TextField label="Tree-crop spacing" value={arr.treeCropSpacing} onChange={(value) => setArr((current) => ({ ...current, treeCropSpacing: value }))} />
                  <SelectField label="Farm ownership model" value={arr.farmOwnershipModel} onChange={(value) => setArr((current) => ({ ...current, farmOwnershipModel: value }))} options={["Single landowner", "Multiple farmers", "Farmer producer organization", "Company lease"]} />
                  <NumberField label="Number of farmers" value={arr.numberOfFarmers} onChange={(value) => setArr((current) => ({ ...current, numberOfFarmers: value }))} min={0} />
                  <NumberField label="Average land per farmer" value={arr.averageLandPerFarmer} onChange={(value) => setArr((current) => ({ ...current, averageLandPerFarmer: value }))} min={0} />
                  <NumberField label="Harvest cycle years" value={arr.harvestCycleYears} onChange={(value) => setArr((current) => ({ ...current, harvestCycleYears: value }))} min={0} />
                </>
              ) : null}
            </div>
          ) : null}

          {step === 2 && isMangrove ? (
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Project area in hectares" value={mangrove.areaHa} onChange={(value) => setMangrove((current) => ({ ...current, areaHa: value }))} min={0.01} />
              <SelectField label="Activity type" value={mangrove.activityType} onChange={(value) => setMangrove((current) => ({ ...current, activityType: value }))} options={mangroveActivities} />
              <SelectField label="Baseline condition" value={mangrove.baselineCondition} onChange={(value) => setMangrove((current) => ({ ...current, baselineCondition: value }))} options={mangroveConditions} />
              <NumberField label="Aboveground biomass factor" value={mangrove.abovegroundFactor} onChange={(value) => setMangrove((current) => ({ ...current, abovegroundFactor: value }))} min={0} />
              <NumberField label="Belowground/root factor" value={mangrove.belowgroundFactor} onChange={(value) => setMangrove((current) => ({ ...current, belowgroundFactor: value }))} min={0} />
              <NumberField label="Soil organic carbon benefit" value={mangrove.soilOrganicCarbonFactor} onChange={(value) => setMangrove((current) => ({ ...current, soilOrganicCarbonFactor: value }))} min={0} />
              <NumberField label="Baseline emissions/removals factor" value={mangrove.baselineFactor} onChange={(value) => setMangrove((current) => ({ ...current, baselineFactor: value }))} min={0} />
              <NumberField label="Methane/N2O project emissions" value={mangrove.projectEmissionsTco2e} onChange={(value) => setMangrove((current) => ({ ...current, projectEmissionsTco2e: value }))} min={0} />
            </div>
          ) : null}

          {step === 2 && isPlastic ? (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Plastic type" value={plastic.plasticType} onChange={updatePlasticType} options={plasticTypes} />
              <SelectField label="Input method" value={plastic.inputMethod} onChange={(value) => setPlastic((current) => ({ ...current, inputMethod: value as PlasticInputMethod }))} options={plasticInputMethods} />
              {plastic.inputMethod === "Bottle count" ? (
                <>
                  <NumberField label="Number of bottles" value={plastic.bottleCount} onChange={(value) => setPlastic((current) => ({ ...current, bottleCount: value }))} min={0} />
                  <NumberField label="Average bottle weight in grams" value={plastic.averageBottleWeightGrams} onChange={(value) => setPlastic((current) => ({ ...current, averageBottleWeightGrams: value }))} min={0.01} />
                </>
              ) : null}
              {plastic.inputMethod === "Weight in kg" ? (
                <NumberField label="Total plastic weight kg" value={plastic.weightKg} onChange={(value) => setPlastic((current) => ({ ...current, weightKg: value }))} min={0} />
              ) : null}
              {plastic.inputMethod === "Weight in MT" ? (
                <NumberField label="Total plastic weight MT" value={plastic.weightMt} onChange={(value) => setPlastic((current) => ({ ...current, weightMt: value }))} min={0} />
              ) : null}
              <NumberField label="Baseline recycling kg" value={plastic.baselineRecyclingKg} onChange={(value) => setPlastic((current) => ({ ...current, baselineRecyclingKg: value }))} min={0} />
              <NumberField label="Contamination/rejection %" value={plastic.contaminationPercent} onChange={(value) => setPlastic((current) => ({ ...current, contaminationPercent: value }))} min={0} max={100} />
              <SelectField label="Processing frequency" value={plastic.processingFrequency} onChange={(value) => setPlastic((current) => ({ ...current, processingFrequency: value }))} options={["One-time batch", "Daily", "Monthly", "Annual"]} />
              {plastic.processingFrequency === "Daily" ? (
                <NumberField label="Operating days per year" value={plastic.operatingDaysPerYear} onChange={(value) => setPlastic((current) => ({ ...current, operatingDaysPerYear: value }))} min={1} />
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {!isPlastic ? (
                <>
                  <SelectField label="Default scenario" value={scenario} onChange={updateScenario} options={["Conservative", "Moderate", "Optimistic", "Custom"]} />
                  {!isMangrove ? (
                    <>
                      <NumberField label="Baseline carbon stock tCO2e/ha/year" value={arr.baselineFactor} onChange={(value) => setArr((current) => ({ ...current, baselineFactor: value }))} min={0} />
                      <NumberField label="Expected annual sequestration tCO2e/ha/year" value={arr.annualSequestrationFactor} onChange={(value) => { setScenario("Custom"); setArr((current) => ({ ...current, annualSequestrationFactor: value })); }} min={0.01} />
                      <NumberField label="Leakage deduction %" value={arr.leakagePercent} onChange={(value) => setArr((current) => ({ ...current, leakagePercent: value }))} min={0} max={100} />
                      <NumberField label="Buffer/risk deduction %" value={arr.bufferPercent} onChange={(value) => setArr((current) => ({ ...current, bufferPercent: value }))} min={0} max={100} />
                      <NumberField label="Uncertainty deduction %" value={arr.uncertaintyPercent} onChange={(value) => setArr((current) => ({ ...current, uncertaintyPercent: value }))} min={0} max={100} />
                    </>
                  ) : (
                    <>
                      <NumberField label="Total blue carbon factor tCO2e/ha/year" value={mangrove.totalBlueCarbonFactor} onChange={(value) => { setScenario("Custom"); setMangrove((current) => ({ ...current, totalBlueCarbonFactor: value })); }} min={0.01} />
                      <NumberField label="Leakage deduction %" value={mangrove.leakagePercent} onChange={(value) => setMangrove((current) => ({ ...current, leakagePercent: value }))} min={0} max={100} />
                      <NumberField label="Buffer/risk deduction %" value={mangrove.bufferPercent} onChange={(value) => setMangrove((current) => ({ ...current, bufferPercent: value }))} min={0} max={100} />
                      <NumberField label="Uncertainty deduction %" value={mangrove.uncertaintyPercent} onChange={(value) => setMangrove((current) => ({ ...current, uncertaintyPercent: value }))} min={0} max={100} />
                    </>
                  )}
                  <NumberField label="Credit price assumption" value={creditPrice} onChange={setCreditPrice} min={0} />
                </>
              ) : (
                <>
                  <NumberField label="Plastic credit price per MT" value={plastic.plasticCreditPricePerMt} onChange={(value) => setPlastic((current) => ({ ...current, plasticCreditPricePerMt: value }))} min={0} />
                  <NumberField label="CO2e saving factor kgCO2e/kg plastic" value={plastic.co2eSavingFactorKgPerKg} onChange={(value) => setPlastic((current) => ({ ...current, co2eSavingFactorKgPerKg: value }))} min={0.01} />
                  <NumberField label="Carbon credit price assumption" value={creditPrice} onChange={setCreditPrice} min={0} />
                </>
              )}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label={isPlastic ? "Plastic credit potential" : "Estimated Credits"} value={formatNumber(isPlastic ? result.estimatedPlasticCredits : result.netEstimatedCredits)} detail={isPlastic ? "Waste Recycling Credits, not carbon credits." : "Estimated removals/reductions only."} />
                <MetricCard label="Estimated Value" value={`${currency} ${formatNumber(result.estimatedValue)}`} />
                <MetricCard label="Gross Impact" value={`${formatNumber(result.grossImpactTco2e)} tCO2e`} />
                <MetricCard label="Net Impact" value={`${formatNumber(result.netEstimatedCredits)} ${isPlastic ? "tCO2e indicative" : "credits"}`} />
                <MetricCard label="Readiness Score" value={`${result.readinessScore}/100`} />
                <MetricCard label="Confidence Level" value={result.confidenceLevel} />
                <MetricCard label="Registry Pathway" value={result.registryPathway} />
                <MetricCard label="Methodology Reference" value={result.methodologyReference} />
              </div>
              <ResultCharts result={result} />
              <div className="grid gap-3 md:grid-cols-2">
                {result.outputRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm">
                    <span className="text-[var(--text-muted)]">{row.label}</span>
                    <span className="font-semibold text-[var(--text-heading)]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-heading)]">Registry-readiness score</h3>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{result.confidenceLevel}; still not certified issuance.</p>
                  </div>
                  <span className="text-3xl font-semibold text-[var(--brand)]">{result.readinessScore}/100</span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={result.readinessScore} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(evidenceWeights).map(([key, [label, weight]]) => (
                  <label key={key} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <input
                      type="checkbox"
                      checked={Boolean(evidence[key])}
                      onChange={(event) => setEvidence((current) => ({ ...current, [key]: event.target.checked }))}
                      className="mt-1 size-4"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[var(--text-heading)]">{label}</span>
                      <span className="text-xs text-[var(--text-muted)]">{weight} readiness points</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
                <h3 className="font-semibold text-[var(--text-heading)]">Missing evidence checklist</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.missingEvidence.length ? (
                    result.missingEvidence.map((item) => (
                      <span key={item} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-muted)]">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[var(--text-muted)]">All checklist items are marked available.</span>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {step === 6 ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
                <h3 className="text-xl font-semibold text-[var(--text-heading)]">Export structure</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  PDF/CSV export is prepared as structured estimate data. A future export service can use the input, assumptions, result rows, methodology reference, and evidence checklist below.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <pre className="max-h-80 overflow-auto rounded-2xl bg-[var(--panel-dark)] p-4 text-xs text-white">
                  {JSON.stringify(input, null, 2)}
                </pre>
                <pre className="max-h-80 overflow-auto rounded-2xl bg-[var(--panel-dark)] p-4 text-xs text-white">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              {mode === "dashboard" && saveAction ? (
                <form action={saveAction} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <input type="hidden" name="inputDataJson" value={inputJson} />
                  <input type="hidden" name="resultDataJson" value={resultJson} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-[var(--surface)]" type="submit">
                    Save estimate
                  </button>
                  {userRole === "seller" ? (
                    <p className="mt-3 text-sm text-[var(--text-muted)]">
                      After saving, sellers can start a draft project listing with this estimate prefilled.
                    </p>
                  ) : null}
                </form>
              ) : (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <p className="text-sm text-[var(--text-muted)]">
                    Public estimates are interactive only. Create an account or log in to save an estimate.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-[var(--panel-dark)] p-5 text-white">
            <p className="text-sm text-white/60">Current estimate</p>
            <p className="mt-2 text-3xl font-semibold">
              {formatNumber(isPlastic ? result.estimatedPlasticCredits : result.netEstimatedCredits)}
            </p>
            <p className="mt-2 text-sm text-white/65">
              {isPlastic ? "estimated Waste Recycling Credits" : "net estimated credits"}
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/70">
              <p>{methodologyLabel(projectType, registryPathway)}</p>
              <p>{result.confidenceLevel}</p>
              <p>{result.readinessScore}/100 readiness</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
            <h3 className="font-semibold text-[var(--text-heading)]">Assumptions used</h3>
            <div className="mt-4 space-y-3">
              {result.assumptions.map((assumption) => (
                <div key={assumption.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--text-muted)]">{assumption.label}</span>
                    <span className="font-semibold text-[var(--text-heading)]">{assumption.value}</span>
                  </div>
                  {assumption.defaultUsed ? (
                    <p className="mt-2 text-xs font-semibold text-[var(--brand-soft)]">Default assumption used</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="font-semibold text-[var(--text-heading)]">Disclaimers</h3>
            <div className="mt-3 space-y-2 text-xs leading-5 text-[var(--text-muted)]">
              <p className="font-semibold text-[var(--danger-text)]">{result.disclaimerText}</p>
              {additionalDisclaimers.map((item) => (
                <p key={item}>{item}</p>
              ))}
              {result.warnings.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
