const statusStyles: Record<string, string> = {
  draft: "bg-[#f3f6f0] text-[#314239]",
  published: "bg-[#eef6ed] text-[#214d35]",
  submitted: "bg-[#eef6ed] text-[#214d35]",
  needs_review: "bg-[#fff1ed] text-[#8a2c16]",
  listed: "bg-[#eef6ed] text-[#214d35]",
  paused: "bg-[#f3f6f0] text-[#314239]",
  archived: "bg-[#f3f6f0] text-[#6a756d]",
  seller_review: "bg-[#eef6ed] text-[#214d35]",
  more_info_requested: "bg-[#fff1ed] text-[#8a2c16]",
  qualified: "bg-[#eef6ed] text-[#214d35]",
  closed: "bg-[#f3f6f0] text-[#6a756d]",
  buyer: "bg-[#eef6ed] text-[#214d35]",
  seller: "bg-[#eef6ed] text-[#214d35]",
  facilitator: "bg-[#e8f0ff] text-[#24426f]",
  admin: "bg-[#17201b] text-white",
  pending: "bg-[#fff7df] text-[#795b12]",
  verified: "bg-[#eef6ed] text-[#214d35]",
  needs_update: "bg-[#fff1ed] text-[#8a2c16]",
  screening: "bg-[#fff7df] text-[#795b12]",
  buyer_contacted: "bg-[#e8f0ff] text-[#24426f]",
  seller_contacted: "bg-[#e8f0ff] text-[#24426f]",
  matched: "bg-[#eef6ed] text-[#214d35]",
  negotiation: "bg-[#fff7df] text-[#795b12]",
  closed_won: "bg-[#214d35] text-white",
  closed_lost: "bg-[#f3f6f0] text-[#6a756d]",
  high: "bg-[#fff1ed] text-[#8a2c16]",
  medium: "bg-[#fff7df] text-[#795b12]",
  low: "bg-[#f3f6f0] text-[#314239]",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const value = status || "unknown";
  const className = statusStyles[value] ?? "bg-[#f3f6f0] text-[#314239]";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
