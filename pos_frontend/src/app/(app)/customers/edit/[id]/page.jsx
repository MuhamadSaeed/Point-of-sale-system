"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { token, isAdmin, loading, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  // protection login and admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (!isAdmin) {
        router.replace("/customers");
      }
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  //fetch customer 
  useEffect(() => {
    if (!token || !id || !isAuthenticated || !isAdmin) return;

    const fetchCustomer = async () => {
      const loadingToast = toast.loading("جارى تحميل بيانات العميل...");

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`,
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
          toast.error(data?.message || "فشل تحميل بيانات العميل");
          return;
        }

        // get the data of the customer and put it in states
        const customer = data?.data || data;

        setName(customer?.name || "");
        setPhone(customer?.phone || "");
        setEmail(customer?.email || "");

      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("تعذر تحميل البيانات");
      } finally {
        setFetching(false);
      }
    };

    fetchCustomer();
  }, [token, id, isAuthenticated, isAdmin]);

  //update customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || submitting) return;

    setSubmitting(true);

    const loadingToast = toast.loading("جارى حفظ التعديلات...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`,
        {
          method: "PUT",
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
        toast.error(data?.message || "فشل فى تعديل العميل");
        return;
      }

      toast.success("تم تعديل العميل بنجاح");

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

  // loading auth 
  if (loading || fetching) {
    return (
      <Loader />
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-(--light-bg)"
      dir="rtl"
    >
      <div className="w-full max-w-lg">

        <h1 className="text-2xl font-bold text-(--primary-dark) mb-6 text-center"> تعديل العميل </h1>

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
            className="w-full bg-(--primary) cursor-pointer text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-70"
          >
            {submitting ? "جارى الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}