export type UserRole = "buyer" | "seller" | "admin";

export type Profile = {
  id: string;
  email: string;
  role: UserRole;
  company_name: string | null;
  email_verified_at: string | null;
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
  created_at?: string;
  updated_at?: string;
};

export type BuyerInterest = {
  id: string;
  buyer_id: string;
  project_id: string;
  requested_credits: number;
  status: string;
  created_at?: string;
  updated_at?: string;
};
