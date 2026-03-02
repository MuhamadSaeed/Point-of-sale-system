"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

import Loader from "@/components/ui/Loader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ManageButton from "@/components/dashboard/ManageButton";
import SalesLineChart from "@/components/dashboard/SalesLineChart";
import ProfitBarChart from "@/components/dashboard/ProfitBarChart";

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, loading } = useAuth();

  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);

  const [dailyLoading, setDailyLoading] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const [dailyDate, setDailyDate] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  //admin only
  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.replace("/pos");
    }
  }, [loading, user, router]);

  // daily
  const fetchDaily = useCallback(async () => {
    if (!token) return;

    setDailyLoading(true);

    const url = dailyDate
      ? `${process.env.NEXT_PUBLIC_API_URL}/reports/daily?date=${dailyDate}`
      : `${process.env.NEXT_PUBLIC_API_URL}/reports/daily`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "فشل تحميل التقرير اليومي");
        return;
      }

      setDailyReport(data);
    } catch {
      toast.error("حدث خطا أثناء تحميل التقرير اليومي");
    } finally {
      setDailyLoading(false);
    }
  }, [token, dailyDate]);

  // monthly
  const fetchMonthly = useCallback(async () => {
    if (!token) return;

    setMonthlyLoading(true);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/reports/monthly?year=${year}&month=${month}`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "فشل تحميل التقرير الشهري");
        return;
      }

      setMonthlyReport(data);
    } catch {
      toast.error("حدث خطا أثناء تحميل التقرير الشهري");
    } finally {
      setMonthlyLoading(false);
    }
  }, [token, year, month]);


  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchDaily();
      fetchMonthly();
    }
  }, [token, user, fetchDaily, fetchMonthly]);

  // chart data
  const chartData = useMemo(() => {
    if (!monthlyReport?.daily_breakdown) return [];

    return monthlyReport.daily_breakdown.map((item) => ({
      date: new Date(item.date).getDate(), //get number of todays day
      sales: Number(item.sales),
      profit: Number(item.profit),
    }));
  }, [monthlyReport]);

  // loading
  if (loading || !user) {
    return <Loader />;
  }

  if (user.role !== "admin") return null;

  return (
    <div className="space-y-10" dir="rtl">

      {/* daily report */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">التقرير اليومي</h2>

          <div className="flex gap-2">
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <button
              onClick={fetchDaily}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              بحث
            </button>
          </div>
        </div>

        {dailyLoading ? (
          <Loader />
        ) : (
          <StatsGrid report={dailyReport} />
        )}
      </div>

      {/* monthly report */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">التقرير الشهري</h2>

          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border rounded-lg px-3 py-2"
            >
              {/* make an array of 12 elements for the 12 months */}
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  شهر {i + 1}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-24"
            />

            <button
              onClick={fetchMonthly}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg"
            >
              بحث
            </button>
          </div>
        </div>

        {monthlyLoading ? (
          <Loader />
        ) : (
          <StatsGrid report={monthlyReport} />
        )}
      </div>

      {/* chasrts */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <SalesLineChart data={chartData} />
          <ProfitBarChart data={chartData} />
        </div>
      )}

      {/* mangment buttons */}
      <div className="grid md:grid-cols-4 gap-6">
        <ManageButton title="إدارة المستخدمين" link="/users" />
        <ManageButton title="إدارة العملاء" link="/customers" />
        <ManageButton title="إدارة المنتجات" link="/products" />
        <ManageButton title="عرض الفواتير" link="/invoices" />
      </div>
    </div>
  );
}