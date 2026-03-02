"use client";

import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProductsTable({ products = [], refreshProducts }) {
  const { isAdmin, token } = useAuthContext();

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmDelete = window.confirm("هل انت متاكد انك عايز تحذف المنتج؟");
    if (!confirmDelete) return;

    const loadingToast = toast.loading("جارى حذف المنتج...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
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
        // if it linked to invoices, cant delete it
        if (data?.message?.includes("linked to invoices")) {
          toast.error("لا يمكن حذف المنتج لانه مرتبط بفواتير سابقه");
        } else {
          toast.error(data?.message || "فشل فى حذف المنتج");
        }
        return;
      }

      toast.success("تم حذف المنتج بنجاح");

      if (refreshProducts) refreshProducts();

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
              <th className="p-3">سعر الشراء</th>
              <th className="p-3">سعر البيع</th>
              <th className="p-3">المخزون</th>
              {isAdmin && <th className="p-3 rounded-l-xl">اجراءات</th>}
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl">
                  لا يوجد منتجات حاليا
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id}
                  className="bg-white shadow-sm hover:shadow-md transition rounded-xl"
                >
                  <td className="p-3 font-semibold text-gray-600">{index + 1}</td>

                  <td className="p-3 font-medium text-gray-800">{product.name}</td>

                  <td className="p-3 text-gray-600">{product.purchase_price} جنيه</td>

                  <td className="p-3 text-blue-600 font-semibold">{product.sale_price} جنيه</td>

                  <td
                    className={`p-3 ${product.stock < 5 ? "text-red-600 font-bold" : "text-gray-700"}`}
                  >
                    {product.stock}
                  </td>

                  {isAdmin && (
                    <td className="p-3 space-x-4">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        تعديل
                      </Link>

                      <button onClick={() => handleDelete(product.id)}
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