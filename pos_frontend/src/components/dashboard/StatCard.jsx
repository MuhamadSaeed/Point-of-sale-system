"use client";

import CountUp from "react-countup";

export default function StatCard({ title, value }) {
  return (
    <div className="bg-gray-100 p-4 rounded-xl text-center">
      <div className="text-sm text-gray-500">{title}</div>

      <div className="text-xl font-bold">
        <CountUp
          end={Number(value) || 0}
          duration={1.2}
          separator=","
        />
      </div>
    </div>
  );
}