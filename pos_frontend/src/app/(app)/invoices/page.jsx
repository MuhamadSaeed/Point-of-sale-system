"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import PaginationButton from "@/components/ui/PaginationButton";
import Loader from "@/components/ui/Loader";
export default function InvoicesPage() {
  const { token, isAuthenticated, loading } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [date, setDate] = useState("");

  // fetching
  const fetchInvoices = useCallback(async (page = 1, searchTerm = "", dateFilter = "") => {
      if (!token) return;

      setPageLoading(true);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices?page=${page}&search=${searchTerm}&date=${dateFilter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();
        if (!res.ok) return;

        const paginated = data?.data;

        setInvoices(paginated?.data || []);
        setCurrentPage(paginated?.current_page || 1);
        setLastPage(paginated?.last_page || 1);

      } catch (err) {
        toast.error("حدث خطا أثناء تحميل الفواتير، حاول مره اخرى");
      } finally {
        setPageLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvoices(currentPage, debouncedSearch, date);
    }
  }, [fetchInvoices, currentPage, debouncedSearch, date, isAuthenticated]);


  const handleTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setDate("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8" dir="rtl">

      <h1 className="text-3xl font-bold text-(--primary-dark)">ادارة الفواتير</h1>

      {/* filters*/}
      <div className="bg-white p-5 rounded-2xl shadow flex flex-wrap gap-4 items-center">

        <input
          type="text"
          placeholder="بحث باسم العميل..."
          className="border p-3 rounded-xl text-right flex-1 min-w-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="border p-3 rounded-xl"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setCurrentPage(1);
          }}
        />

        <button
          onClick={handleTodayFilter}
          className="bg-blue-600 text-white px-4 py-3 rounded-xl"
        >
          فواتير اليوم
        </button>

        {date && (
          <button
            onClick={clearDateFilter}
            className="bg-gray-300 px-4 py-3 rounded-xl"
          >
            مسح الفلتر
          </button>
        )}
      </div>

      {/* content */}
      {pageLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
          لا توجد فواتير
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>

          {/* pagination */}
          <div className="flex justify-center items-center gap-3 mt-6">

            <PaginationButton
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              السابق
            </PaginationButton>

            <span className="px-4 py-2 bg-blue-50 text-gray-700 rounded-lg font-semibold">
              صفحة {currentPage} من {lastPage}
            </span>

            <PaginationButton
              disabled={currentPage === lastPage}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              التالي
            </PaginationButton>

          </div>
        </>
      )}
    </div>
  );
}