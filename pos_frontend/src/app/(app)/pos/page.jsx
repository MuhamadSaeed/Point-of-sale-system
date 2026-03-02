"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import PaginationButton from "@/components/ui/PaginationButton";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";

export default function POSPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [creating, setCreating] = useState(false);

  const [mode, setMode] = useState("existing");
  // the customers taht comes from the api
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  // new custiomer info
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // fetch customers
  const fetchCustomers = useCallback(async (page = 1, searchTerm = "") => {
      if (!token) return;

      setCustomersLoading(true);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers?page=${page}&search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.message || "فشل تحميل العملاء");
          return;
        }

        const paginated = data?.data;

        setCustomers(paginated?.data || []);
        setCurrentPage(paginated?.current_page || 1);
        setLastPage(paginated?.last_page || 1);

      } catch {
        toast.error("حدث خطا اثناء تحميل العملاء");
      } finally {
        setCustomersLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (mode === "existing") {
      fetchCustomers(currentPage, debouncedSearch);
    }
  }, [mode, fetchCustomers, currentPage, debouncedSearch]);

  // create customer
  const createCustomer = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newCustomer),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "فشل انشاء العميل");
        return null;
      }

      toast.success("تم انشاء العميل");
      return data?.data;

    } catch {
      toast.error("حدث خطا اثناء انشاء العميل");
      return null;
    }
  };

  // craete invoice
  const handleCreateInvoice = async () => {
    if (!token) return;

    setCreating(true);

    try {
      let customerId = selectedCustomer;

      // if mode == new => he is craeteoing new customer
      if (mode === "new") {
        const createdCustomer = await createCustomer();
        if (!createdCustomer) {
          setCreating(false);
          return;
        }
        customerId = createdCustomer.id;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            customer_id: customerId || null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "فشل انشاء الفاتوره");
        return;
      }

      toast.success("تم انشاء الفاتوره");
      setInvoice(data?.data);

    } catch {
      toast.error("حدث خطا اثناء انشاء الفاتوره");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

return (
  <div className="min-h-screen bg-gray-100" dir="rtl">

    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-8 space-y-6">

        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">شاشة البيع</h1>

        {!invoice && (
          <>
            {/* mode switch */}
            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() => setMode("existing")}
                className={`py-2 rounded-lg font-medium text-sm sm:text-base cursor-pointer transition ${
                  mode === "existing" ? "bg-gray-900 text-white" : "bg-gray-200"
                }`}
              >
                عميل محفوظ
              </button>

              <button
                onClick={() => setMode("new")}
                className={`py-2 rounded-lg font-medium text-sm sm:text-base cursor-pointer transition ${
                  mode === "new" ? "bg-gray-900 text-white" : "bg-gray-200"
                }`}
              >
                عميل جديد
              </button>

            </div>

            {/* exisiting */}
            {mode === "existing" && (
              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="ابحث بالاسم او الهاتف..."
                  className="w-full border p-3 rounded-lg text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="border rounded-lg max-h-64 overflow-y-auto bg-white">

                  {customersLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="w-6 h-6 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">لا يوجد عملاء</div>
                  ) : (
                    customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCustomer(c.id)}
                        className={`p-3 cursor-pointer border-b text-sm ${
                          selectedCustomer == c.id ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium">{c.name || "بدون اسم"}</div>
                        <div className="text-gray-500 text-xs">{c.phone || "-"}</div>
                      </div>
                    ))
                  )}

                </div>

                {/* pagination */}
                <div className="flex justify-between items-center gap-2 pt-2">

                  <PaginationButton
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    السابق
                  </PaginationButton>

                  <span className="text-xs sm:text-sm font-medium">
                    صفحه {currentPage} من {lastPage}
                  </span>

                  <PaginationButton
                    disabled={currentPage === lastPage}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    التالي
                  </PaginationButton>

                </div>

              </div>
            )}

            {/* new */}
            {mode === "new" && (
              <div className="space-y-3">
                <input
                  placeholder="الاسم"
                  className="w-full border p-3 rounded-lg text-sm"
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
                <input
                  placeholder="الموبايل"
                  className="w-full border p-3 rounded-lg text-sm"
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
                <input
                  placeholder="الايميل"
                  className="w-full border p-3 rounded-lg text-sm"
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                />
              </div>
            )}

            <button
              onClick={handleCreateInvoice}
              disabled={creating}
              className="w-full bg-gray-900 text-white py-3 cursor-pointer rounded-lg font-semibold text-sm sm:text-base transition disabled:opacity-50"
            >
              {creating ? "جارى الانشاء..." : "انشاء الفاتوره"}
            </button>

          </>
        )}

        {invoice && (
          <div className="text-center space-y-4">
            <div className="text-base sm:text-lg font-semibold text-green-600">تم انشاء الفاتوره</div>

            <button
              onClick={() => router.push(`/pos/${invoice.id}`)}
              className="bg-gray-900 cursor-pointer text-white px-6 py-3 rounded-lg text-sm sm:text-base"
            >
              الدخول الى الفاتوره
            </button>
          </div>
        )}

      </div>
    </div>
  </div>
);
}