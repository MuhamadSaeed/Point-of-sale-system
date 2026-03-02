"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import ProductsTable from "@/components/products/ProductsTable";
import Link from "next/link";
import toast from "react-hot-toast";
import PaginationButton from "@/components/ui/PaginationButton";
import Loader from "@/components/ui/Loader";
export default function ProductsPage() {
  const { token, isAdmin, loading, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  // it is a loading for the table
  const [pageLoading, setPageLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState("");

  // use custom hook debounce 
  const debouncedSearch = useDebounce(search, 500);

  // on search, go to the first page
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // fetching
  const fetchProducts = useCallback(async (page = 1, searchTerm = "") => {
      if (!token) return;

      setPageLoading(true);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?page=${page}&search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        if (!response.ok) return;

        const paginated = data?.data;

        setProducts(paginated?.data || []);
        setCurrentPage(paginated?.current_page || 1);
        setLastPage(paginated?.last_page || 1);

      } catch (error) {
        console.error(error);
        toast.error(error)
      } finally {
        setPageLoading(false);
      }
    }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts(currentPage, debouncedSearch);
    }
  }, [fetchProducts, currentPage, debouncedSearch, isAuthenticated]);

  // loading  
  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="space-y-6">

      {/* haeder */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-(--primary-dark)">اداره المنتجات</h1>

        {isAdmin && (
          <Link
            href="/products/add"
            className="bg-(--primary) text-white px-5 py-2 rounded-xl hover:opacity-90 transition"
          >
           اضافه منتج
          </Link>
        )}
      </div>

      {/* search */}
      <div>
        <input
          type="text"
          placeholder="بحث باسم المنتج..."
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
          <ProductsTable
            products={products}
            refreshProducts={() =>
              fetchProducts(currentPage, debouncedSearch)
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