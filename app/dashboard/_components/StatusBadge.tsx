const statusStyles: Record<string, string> = {
  draft: "bg-[#f3f6f0] text-[#314239]",
  submitted: "bg-[#eef6ed] text-[#214d35]",
  needs_review: "bg-[#fff1ed] text-[#8a2c16]",
  listed: "bg-[#eef6ed] text-[#214d35]",
  paused: "bg-[#f3f6f0] text-[#314239]",
  archived: "bg-[#f3f6f0] text-[#6a756d]",
  seller_review: "bg-[#eef6ed] text-[#214d35]",
  more_info_requested: "bg-[#fff1ed] text-[#8a2c16]",
  qualified: "bg-[#eef6ed] text-[#214d35]",
  closed: "bg-[#f3f6f0] text-[#6a756d]",
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
