export type UserRole = "buyer" | "seller" | "admin";
export type CompanyVerificationStatus = "pending" | "verified" | "needs_update";
export type ProjectLifecycleStatus =
  | "draft"
  | "submitted"
  | "needs_review"
  | "listed"
  | "paused"
  | "archived";
export type InterestLifecycleStatus =
  | "submitted"
  | "seller_review"
  | "more_info_requested"
  | "qualified"
  | "closed";

export type Profile = {
  id: string;
  email: string;
  role: UserRole;
  company_name: string | null;
  contact_name?: string | null;
  website?: string | null;
  country?: string | null;
  company_location?: string | null;
  incorporated_on?: string | null;
  gstin?: string | null;
  gst_details?: string | null;
  registration_type?: string | null;
  registration_number?: string | null;
  annual_credit_demand?: number | null;
  preferred_project_types?: string | null;
  carbon_purchase_goal?: string | null;
  annual_credit_supply?: number | null;
  project_methodologies?: string | null;
  registry_experience?: string | null;
  company_verification_status?: CompanyVerificationStatus | null;
  company_verified_at?: string | null;
  company_verified_by?: string | null;
  company_verification_note?: string | null;
  email_verified_at: string | null;
  onboarding_completed_at?: string | null;
};

export type CarbonProject = {
  id: string;
  seller_id: string;
  project_name: string;
  location: string;
  methodology: string;
  available_credits: number;
  price_per_credit: number;
  verification_status: string;
  lifecycle_status?: ProjectLifecycleStatus;
  project_description?: string | null;
  estimated_annual_credits?: number | null;
  vintage_year?: number | null;
  registry_name?: string | null;
  documentation_score?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type BuyerInterest = {
  id: string;
  buyer_id: string;
  project_id: string;
  requested_credits: number;
  status: string;
  buyer_note?: string | null;
  seller_response_note?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectDocument = {
  id: string;
  project_id: string;
  uploaded_by: string;
  document_name: string;
  document_category: string;
  document_url: string | null;
  review_status: string;
  created_at?: string;
  updated_at?: string;
};

export type ProjectReview = {
  id: string;
  project_id: string;
  reviewer_id: string;
  decision_status: string;
  review_note: string | null;
  created_at?: string;
};

export type SavedProject = {
  id: string;
  buyer_id: string;
  project_id: string;
  created_at?: string;
};

export type MarketplaceMessage = {
  id: string;
  interest_id: string;
  sender_id: string;
  message_body: string;
  created_at?: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at?: string;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at?: string;
};
