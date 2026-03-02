"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { token, isAdmin, loading, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (!isAdmin) {
        router.replace("/products");
      }
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // fetching
  useEffect(() => {
    if (!token || !id || !isAuthenticated) return;

    const fetchProduct = async () => {
      const loadingToast = toast.loading("جارى تحميل بيانات المنتج...");

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        toast.dismiss(loadingToast);

        if (!response.ok) {
          toast.error(data?.message || "فشل تحميل بيانات المنتج");
          return;
        }

        const product = data?.data || data;

        setName(product?.name || "");
        setPurchasePrice(product?.purchase_price || "");
        setSalePrice(product?.sale_price || "");
        setStock(product?.stock || "");


      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("حصل خطا اثناء تحميل البيانات");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [token, id, isAuthenticated]);

  // update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || submitting) return;

    setSubmitting(true);

    const loadingToast = toast.loading("جارى حفظ التعديلات...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            purchase_price: Number(purchasePrice),
            sale_price: Number(salePrice),
            stock: Number(stock),
          }),
        }
      );

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok) {
        toast.error(data?.message || "فشل فى تعديل المنتج");
        return;
      }

      toast.success("تم تعديل المنتج بنجاح");

      setTimeout(() => {
        router.replace("/products");
      }, 1200);

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("تعذر الاتصال بالسيرفر، حاول مره اخرى");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--light-bg)">
      <div className="w-full max-w-lg">

        <h1 className="text-2xl font-bold text-(--primary-dark) mb-6 text-center">تعديل المنتج</h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-center">{error}</div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-8 rounded-2xl shadow-lg"
        >
          <div>
            <label className="block text-sm mb-2">اسم المنتج</label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">سعر الشراء</label>
            <input
              type="number"
              min="0"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">سعر البيع</label>
            <input
              type="number"
              min="0"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">المخزون</label>
            <input
              type="number"
              min="0"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-(--primary) cursor-pointer text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-70"
          >
            {submitting ? "جار الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}