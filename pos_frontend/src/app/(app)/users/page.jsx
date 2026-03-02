"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import UsersTable from "@/components/users/UsersTable";
import Link from "next/link";
import toast from "react-hot-toast";
import PaginationButton from "@/components/ui/PaginationButton";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

export default function UsersPage() {
  const router = useRouter();
  const { token, isAdmin, loading, isAuthenticated } = useAuth();

  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState("");

  // use debounce hook
  const debouncedSearch = useDebounce(search, 500);

  // reset page on new search
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // admin only
  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin) {
      router.replace("/pos");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // fetching
  const fetchUsers = useCallback(async (page = 1, searchTerm = "") => {
      if (!token) return;

      setPageLoading(true);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?page=${page}&search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data?.message || "فشل تحميل المستخدمين");
          return;
        }

        const paginated = data?.data;

        setUsers(paginated?.data || []);
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
    if (isAuthenticated && isAdmin) {
      fetchUsers(currentPage, debouncedSearch);
    }
  }, [fetchUsers, currentPage, debouncedSearch, isAuthenticated, isAdmin]);

  if (loading || !isAdmin) {
    return (
      <Loader />
    );
  }

  return (
    <div className="space-y-6" dir="rtl">

      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-(--primary-dark)">ادارة المستخدمين</h1>

        <Link
          href="/users/add"
          className="bg-(--primary) text-white px-5 py-2 rounded-xl hover:opacity-90 transition"
        >
          اضافة مستخدم
        </Link>
      </div>

      {/* search */}
      <div>
        <input
          type="text"
          placeholder="بحث بالاسم او الايميل..."
          className="w-full max-w-md border p-3 rounded-xl text-right"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* table */}
      {pageLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <UsersTable
            users={users}
            refreshUsers={() =>
              fetchUsers(currentPage, debouncedSearch)
            }
          />

          {/* pagination */}
          <div className="flex justify-center items-center gap-3 mt-6">

            <PaginationButton
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              السابق
            </PaginationButton>

            <span className="px-4 py-2 bg-blue-50 text-gray-700 rounded-lg font-semibold">
              صفحه {currentPage} من {lastPage}
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