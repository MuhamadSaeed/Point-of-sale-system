"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/pos");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("بيانات الدخول غير صحيحه");
        setSubmitting(false);
        return;
      }

      const token = data?.data?.token;
      const userData = data?.data?.user;

      if (!token || !userData) {
        toast.error("حدث مشكله اثناء تسجيل الدخوال");
        setSubmitting(false);
        return;
      }

      login(token, userData);

      toast.success("تم تسجيل الدخول بنجاح");

      if (userData.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/pos");
      }

    } catch {
      toast.error("حدث خطا اثناء تسجيل الدخوال");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--light-bg)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">جارى التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--light-bg) relative overflow-hidden">
      
      <div className="absolute w-125 h-125 bg-(--primary) opacity-20 rounded-full -top-40 -left-40 blur-3xl"></div>
      <div className="absolute w-100 h-100 bg-(--soft) opacity-30 rounded-full -bottom-40 -right-40 blur-3xl"></div>

      <div className="relative w-full max-w-md p-8">
        
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-white/40">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-r from-(--primary) to-(--primary-dark) rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              POS
            </div>

            <h1 className="text-3xl font-bold text-(--primary-dark)">نظام الكاشير</h1>
            <p className="text-gray-500 mt-2 text-sm">سجل الدخول للمتابعه</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <div>
              <label className="text-sm font-medium text-(--primary-dark)">البريد الالكترونى</label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full mt-2 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-(--primary-dark)">كلمة المرور</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-(--primary) transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-sm text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "اخفاء" : "اظهار"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-(--primary) cursor-pointer text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-70"
            >
              {submitting ? "جارى تسجيل الدخوال..." : "تسجيل الدخوال"}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-gray-400">2026 POS System</div>
        </div>
      </div>
    </div>
  );
}