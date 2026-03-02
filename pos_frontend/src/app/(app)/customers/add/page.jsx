"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function AddCustomerPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || submitting) return;

    setSubmitting(true);

    const loadingToast = toast.loading("جارى اضافة العميل...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: name || null,
            phone: phone || null,
            email: email || null,
          }),
        }
      );

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok) {
        toast.error(data?.message || "فشل فى اضافة العميل");
        return;
      }

      toast.success("تم اضافة العميل بنجاح");

      setTimeout(() => {
        router.replace("/customers");
      }, 1000);

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("تعذر الاتصال بالسيرفر، حاول مره اخرى");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-(--light-bg)"
      dir="rtl"
    >
      <div className="w-full max-w-lg">

        <h1 className="text-2xl font-bold text-(--primary-dark) mb-6 text-center">اضافة عميل جديد</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-8 rounded-2xl shadow-lg"
        >
          <div>
            <label className="block text-sm mb-2">اسم العميل</label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">رقم الهاتف</label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">البريد الالكترونى</label>
            <input
              type="email"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-(--primary) text-white py-3 rounded-xl cursor-pointer hover:opacity-90 transition disabled:opacity-60"
          >
            {submitting ? "جارى الحفظ..." : "اضافة العميل"}
          </button>
        </form>
      </div>
    </div>
  );
}