"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import CustomersTable from "@/components/customers/CustomersTable";
import Link from "next/link";
import toast from "react-hot-toast";
import PaginationButton from "@/components/ui/PaginationButton";
import Loader from "@/components/ui/Loader";
export default function CustomersPage() {
  const { token, loading, isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  // go to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // fetching
  const fetchCustomers = useCallback(async (page = 1, searchTerm = "") => {
      if (!token) return;

      setPageLoading(true);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers?page=${page}&search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data?.message || "فشل تحميل العملاء");
          return;
        }

        const paginated = data?.data;

        setCustomers(paginated?.data || []);
        setCurrentPage(paginated?.current_page || 1);
        setLastPage(paginated?.last_page || 1);

      } catch (error) {
        console.error(error);
        toast.error("حدث خطا اثناء جلب البيانات");
      } finally {
        setPageLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomers(currentPage, debouncedSearch);
    }
  }, [fetchCustomers, currentPage, debouncedSearch, isAuthenticated]);

  // auth loading
  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-(--primary-dark)">اداره العملاء</h1>

        <Link href="/customers/add" className="bg-(--primary) text-white px-5 py-2 rounded-xl hover:opacity-90 transition">
          اضافه عميل
        </Link>
      </div>

      {/* search */}
      <div>
        <input
          type="text"
          placeholder="بحث بالاسم او الموبايل او الايميل..."
          className="w-full max-w-md border p-3 rounded-xl text-right"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* table */}
      {pageLoading ? (
        <Loader />
      ) : (
        <>
          <CustomersTable
            customers={customers}
            refreshCustomers={() =>
              fetchCustomers(currentPage, debouncedSearch)
            }
          />

          {/* pagination */}
          <div className="flex justify-center items-center gap-3 mt-6">

            <PaginationButton disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
              السابق
            </PaginationButton>

            <span className="px-4 py-2 bg-blue-50 text-gray-700 rounded-lg font-semibold">
              صفحه {currentPage} من {lastPage}
            </span>

            <PaginationButton disabled={currentPage === lastPage} onClick={() => setCurrentPage((prev) => prev + 1)}>
              التالي
            </PaginationButton>

          </div>
        </>
      )}
    </div>
  );
}