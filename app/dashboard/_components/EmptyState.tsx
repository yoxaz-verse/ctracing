export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#cbd5c5] p-6">
      <p className="font-semibold text-[#17201b]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#5b6a61]">{detail}</p>
    </div>
  );
}
