export default function InfoItem({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="font-semibold text-gray-800">{value}</div>
    </div>
  );
}