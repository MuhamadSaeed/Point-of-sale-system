"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import PaginationButton from "@/components/ui/PaginationButton";
export default function AddItemsPage() {
  const { token } = useAuth();
  const params = useParams();
  const invoiceId = params.invoiceId;

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // fetch products
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

        if (!response.ok) {
          toast.error("فشل تحميل المنتجات");
          return;
        }

        const paginated = data?.data;

        setProducts(paginated?.data || []);
        setCurrentPage(paginated?.current_page || 1);
        setLastPage(paginated?.last_page || 1);

      } catch {
        toast.error("حدث خطا اثناء تحميل المنتجات");
      } finally {
        setPageLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchProducts(currentPage, debouncedSearch);
  }, [fetchProducts, currentPage, debouncedSearch]);

  // add item
  const handleAddItem = async () => {
    if (!selectedProduct || quantity < 1) {
      toast.error("اختر المنتج واكتب كميه صحيحه");
      return;
    }

    setLoading(true);

    const product = products.find((p) => p.id == selectedProduct);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/items`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                product_id: product.id,
                price: product.sale_price,
                quantity: Number(quantity),
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        toast.error("فشل اضافه المنتج");
        return;
      }

      toast.success("تم اضافه المنتج بنجاح");
      setQuantity(1);

    } catch {
      toast.error("حدث خطا اثناء الاضافه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      <div className="w-full max-w-md sm:max-w-lg">

        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
          إضافة منتجات للفاتوره #{invoiceId}
        </h1>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow space-y-4">

          {/* saerch */}
          <input
            type="text"
            placeholder="ابحث باسم المنتج..."
            className="w-full border p-3 rounded-lg text-right focus:ring-2 focus:ring-gray-400 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* products select */}
          {pageLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <select
              className="w-full border p-3 rounded-lg"
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
            >
              <option value="">اختر المنتج...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.sale_price} جنيه
                </option>
              ))}
            </select>
          )}

          {/* pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">

            <PaginationButton
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              السابق
            </PaginationButton>

            <span className="px-4 py-2 bg-gray-100 rounded-lg">
              صفحه {currentPage} من {lastPage}
            </span>

            <PaginationButton
              disabled={currentPage === lastPage}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              التالي
            </PaginationButton>

          </div>

          {/* quanntity */}
          <input
            type="number"
            min="1"
            placeholder="quantity"
            className="w-full border p-3 rounded-lg"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
          />

          <button
            onClick={handleAddItem}
            disabled={loading}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-60"
          >
            {loading ? "جارى الاضافه..." : "اضافة المنتج"}
          </button>

        </div>

        <a
          href={`/pos/${invoiceId}`}
          className="block text-center bg-gray-300 mt-6 py-3 rounded-lg hover:opacity-80"
        >
          الرجوع للفواتير
        </a>
      </div>
    </div>
  );
}