import type { BuyerInterest, CarbonProject } from "./types";

export const sampleProjects: CarbonProject[] = [
  {
    id: "sample-western-ghats",
    seller_id: "sample-seller",
    project_name: "Western Ghats Afforestation Corridor",
    location: "Karnataka, India",
    methodology: "ARR - Afforestation, reforestation, revegetation",
    available_credits: 24000,
    price_per_credit: 18,
    verification_status: "Documentation review",
  },
  {
    id: "sample-mangrove",
    seller_id: "sample-seller",
    project_name: "Community Mangrove Restoration",
    location: "Odisha, India",
    methodology: "Blue carbon restoration",
    available_credits: 11200,
    price_per_credit: 22,
    verification_status: "Verified supply",
  },
  {
    id: "sample-agroforestry",
    seller_id: "sample-seller",
    project_name: "Agroforestry Transition Cluster",
    location: "Tamil Nadu, India",
    methodology: "Nature-based removals",
    available_credits: 16500,
    price_per_credit: 15,
    verification_status: "Registry pending",
  },
];

export const sampleInterests: BuyerInterest[] = [
  {
    id: "interest-one",
    buyer_id: "sample-buyer",
    project_id: "sample-western-ghats",
    requested_credits: 3200,
    status: "Reviewing project documentation",
  },
  {
    id: "interest-two",
    buyer_id: "sample-buyer",
    project_id: "sample-mangrove",
    requested_credits: 1800,
    status: "Awaiting seller response",
  },
];
