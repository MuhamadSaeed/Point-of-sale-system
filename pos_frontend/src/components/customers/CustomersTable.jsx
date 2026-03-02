"use client";

import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CustomersTable({customers = [], refreshCustomers,}) {
  const { isAdmin, token } = useAuthContext();

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmDelete = window.confirm("هل متاكد انك عايز تحذف العميل؟");
    if (!confirmDelete) return;

    const loadingToast = toast.loading("جارى حذف العميل...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`,
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
        if (data?.message?.includes("invoices")) {
          toast.error("لا يمكن حذف العميل لانه مرتبط بفواتير سابقه");
        } else {
          toast.error(data?.message || "فشل فى حذف العميل");
        }
        return;
      }

      toast.success("تم حذف العميل بنجاح");

      if (refreshCustomers) refreshCustomers();

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
              <th className="p-3">الموبايل</th>
              <th className="p-3">الايميل</th>
              {isAdmin && <th className="p-3 rounded-l-xl">اجراءات</th>}
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl"
                >
                  لا يوجد عملاء حاليا
                </td>
              </tr>
            ) : (
              customers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className="bg-white shadow-sm hover:shadow-md transition rounded-xl"
                >
                  <td className="p-3 font-semibold text-gray-600">{index + 1}</td>

                  <td className="p-3 font-medium text-gray-800">{customer.name || "-"}</td>

                  <td className="p-3 text-gray-600">{customer.phone || "-"}</td>

                  <td className="p-3 text-gray-600">{customer.email || "-"}</td>

                  {isAdmin && (
                    <td className="p-3 space-x-4">
                      <Link
                        href={`/customers/edit/${customer.id}`}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        تعديل
                      </Link>

                      <button
                        onClick={() => handleDelete(customer.id)}
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