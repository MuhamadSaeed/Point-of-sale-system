"use client";

import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UsersTable({ users = [], refreshUsers }) {
  const { isAdmin, token } = useAuthContext();

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmDelete = window.confirm("هل انت متاكد انك عايز تحذف المستخدم؟");
    if (!confirmDelete) return;

    const loadingToast = toast.loading("جارى حذف المستخدم...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok) {
        toast.error(data?.message || "فشل فى حذف المستخدم");
        return;
      }

      toast.success("تم حذف المستخدم بنجاح");

      if (refreshUsers) refreshUsers();

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("تعذر الاتصال بالسيرفر، حاول مره اخرى");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right border-separate border-spacing-y-2">

          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 rounded-r-xl">#</th>
              <th className="p-3">الاسم</th>
              <th className="p-3">الايميل</th>
              <th className="p-3">الدور</th>
              {isAdmin && <th className="p-3 rounded-l-xl">اجراءات</th>}
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl"
                >
                  لا يوجد مستخدمين حاليا
                </td>
              </tr>
            ) : (
              users.map((u, index) => (
                <tr
                  key={u.id}
                  className="bg-white shadow-sm hover:shadow-md transition rounded-xl"
                >
                  <td className="p-3 font-semibold text-gray-600">{index + 1}</td>

                  <td className="p-3 font-medium text-gray-800">{u.name}</td>

                  <td className="p-3 text-gray-600">{u.email}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {u.role === "admin" ? "مدير" : "كاشير"}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="p-3 space-x-4">
                      <Link
                        href={`/users/edit/${u.id}`}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        تعديل
                      </Link>

                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-800 cursor-pointer transition"
                      >
                        حذف
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}