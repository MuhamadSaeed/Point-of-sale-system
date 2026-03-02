"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedLayout from "@/components/ProtectedLayout";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function AppLayout({ children }) {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-100" dir="rtl">

        {/* Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-6
            flex flex-col justify-between
            transition-transform duration-300 z-50
            ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
            lg:translate-x-0
          `}
        >
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-8 text-center">
              نظام البيع
            </h2>

            <nav className="space-y-3 text-right">

              <Link
                href="/pos"
                className="block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
              >
                البيع (POS)
              </Link>

              {isAdmin && (
                <>
                  <Link href="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    لوحه التحكم
                  </Link>

                  <Link href="/products" className="block px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    المنتجات
                  </Link>

                  <Link href="/customers" className="block px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    العملا
                  </Link>

                  <Link href="/users" className="block px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    المستخدمين
                  </Link>

                  <Link href="/invoices" className="block px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    الفواتير
                  </Link>
                </>
              )}

              {isCashier && (
                <>
                  <Link href="/products" className="block px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    المنتجات
                  </Link>

                  <Link href="/customers" className="block px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    العملا
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="border-t pt-4 text-right">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-500 mb-2">
              {isAdmin ? "admin" : "cashier"}
            </p>
            <button
              onClick={logout}
              className="text-red-600 hover:underline cursor-pointer text-sm"
            >
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:mr-64 flex flex-col min-h-screen">

          {/* Top bar (mobile only) */}
          <div className="lg:hidden flex items-center justify-between bg-white shadow px-4 py-3">

            <button
              onClick={() => setSidebarOpen(true)}
              className="text-blue-700 text-2xl"
            >
              <Menu size={28} />
            </button>

            <h1 className="font-bold text-blue-700">نظام البيع</h1>

            <div />
          </div>

          <main className="flex-1 p-6 lg:p-10">
            {children}
          </main>

        </div>
      </div>
    </ProtectedLayout>
  );
}