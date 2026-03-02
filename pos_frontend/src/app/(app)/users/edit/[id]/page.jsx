"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { token, isAdmin, loading, isAuthenticated, user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cashier");
  const [branchId, setBranchId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (!isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // fetching user data
  useEffect(() => {
    if (!token || !id || !isAuthenticated) return;

    const fetchUser = async () => {
      const loadingToast = toast.loading("جارى تحميل بيانات المستخدم...");

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
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
          toast.error(data?.message || "فشل تحميل بيانات المستخدم");
          return;
        }

        const userData = data?.data;

        setName(userData?.name || "");
        setEmail(userData?.email || "");
        setRole(userData?.role || "cashier");
        setBranchId(userData?.branch_id || "");

      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("حصل خطا اثناء تحميل البيانات");
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [token, id, isAuthenticated]);

  // update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || submitting) return;

    setSubmitting(true);

    const loadingToast = toast.loading("جارى حفظ التعديلات...");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password: password || undefined,
            role,
            branch_id: branchId ? Number(branchId) : null,
          }),
        }
      );

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok) {
        toast.error(data?.message || "فشل فى تعديل المستخدم");
        return;
      }

      toast.success("تم تعديل المستخدم بنجاح");

      setTimeout(() => {
        router.replace("/users");
      }, 1000);

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("تعذر الاتصال بالسيرفر، حاول مره اخرى");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetching) {
    return (
      <Loader />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--light-bg)">
      <div className="w-full max-w-lg">

        <h1 className="text-2xl font-bold text-(--primary-dark) mb-6 text-center">
          تعديل المستخدم
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-8 rounded-2xl shadow-lg"
        >

          <div>
            <label className="block text-sm mb-2">الاسم</label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">البريد الالكترونى</label>
            <input
              type="email"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              كلمة المرور (اتركها فارغة اذا لا تريد تغييرها)
            </label>
            <input
              type="password"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">الدور</label>
            <select
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={user?.id == id} // لا تعدل دور نفسك
            >
              <option value="admin">مدير</option>
              <option value="cashier">كاشير</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">رقم الفرع (اختيارى)</label>
            <input
              type="number"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-(--primary) text-right"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
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