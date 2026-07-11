import DashboardLoading from "@/app/dashboard/loading";

export default function AdminLoading() {
  return (
    <DashboardLoading
      title="Loading admin workspace..."
      subtitle="Preparing platform metrics, review queues, users, and audit events."
    />
  );
}
