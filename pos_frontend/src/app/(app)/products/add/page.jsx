"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";

export default function AddProductPage() {
  const router = useRouter();
  const { token, isAdmin, loading, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");

  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || submitting) return;

    setSubmitting(true);

    const loadingToast = toast.loading("جارى اضافة المنتج...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: "POST",
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
        toast.error(data?.message || "فشل فى اضافة المنتج");
        return;
      }

      toast.success("تم اضافة المنتج بنجاح");

      setTimeout(() => {
        router.replace("/products");
      }, 1200);

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("تعذر الاتصال بالسيرفر، حاول مره اخرى");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--light-bg)">
      <div className="w-full max-w-lg">

        <h1 className="text-2xl font-bold text-(--primary-dark) mb-6 text-center">
          اضافة منتج جديد
        </h1>

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
            className="w-full bg-(--primary) text-white py-3 rounded-xl cursor-pointer hover:opacity-90 transition disabled:opacity-70"
          >
            {submitting ? "جارٍ الحفظ..." : "اضافة المنتج"}
          </button>
        </form>
      </div>
    </div>
  );
}