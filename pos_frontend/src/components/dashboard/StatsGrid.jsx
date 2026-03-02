import StatCard from "./StatCard";

export default function StatsGrid({ report }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="عدد الفواتير" value={report?.total_invoices} />
      <StatCard title="اجمالي المبيعات" value={report?.total_sales} />
      <StatCard title="صافي الربح" value={report?.total_profit} />
    </div>
  );
}