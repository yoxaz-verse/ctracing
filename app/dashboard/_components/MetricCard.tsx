export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#dfe5dc]">
      <p className="text-sm font-medium text-[#6a756d]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#214d35]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#6a756d]">{detail}</p>
    </article>
  );
}
