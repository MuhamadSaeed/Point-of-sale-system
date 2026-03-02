"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import InfoItem from "@/components/invoices/InfoItem";
import Loader from "@/components/ui/Loader";

export default function InvoiceDetailsPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetching
  useEffect(() => {
    if (!token) return;

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.message || "فشل تحميل الفاتوره");
          return;
        }

        setInvoice(data?.data);
      } catch {
        toast.error("حدث خطا اثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [token, invoiceId]);

  if (loading) {
    return (
      <Loader />
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">لا يوجد فاتوره</div>
    );
  }

  const shortInvoiceNumber = invoice.invoice_number.slice(0, 8);

  const formattedDate = new Date(invoice.created_at).toLocaleDateString("ar-EG");
  const formattedTime = new Date(invoice.created_at).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat("ar-EG").format(Number(value)) + " جنيه";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10" dir="rtl">

      {/* haeder */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          تفاصيل الفاتوره #{shortInvoiceNumber}
        </h1>

        <button
          onClick={() => router.back()}
          className="bg-gray-100 hover:bg-gray-200 cursor-pointer px-5 py-2 rounded-xl transition"
        >
          رجوع
        </button>
      </div>

      {/* summary card */}
      <div className="bg-linear-to-l from-indigo-50 to-white p-8 rounded-3xl shadow-lg space-y-6">

        <div className="grid md:grid-cols-3 gap-6">

          <InfoItem
            label="الحاله"
            value={
              <span className={
                invoice.status === "paid"
                  ? "text-green-600 font-bold"
                  : "text-orange-600 font-bold"
              }>
                {invoice.status}
              </span>
            }
          />

          <InfoItem
            label="طريقة الدفع"
            value={invoice.payment_method || "-"}
          />

          <InfoItem
            label="التاريخ"
            value={`${formattedDate} - ${formattedTime}`}
          />

          <InfoItem
            label="الإجمالي الفرعي"
            value={formatCurrency(invoice.subtotal)}
          />

          <InfoItem
            label="الخصم"
            value={formatCurrency(invoice.discount)}
          />

          <InfoItem
            label="الصافي"
            value={formatCurrency(invoice.total)}
          />

          <InfoItem
            label="الربح"
            value={
              <span className="text-green-600 font-bold">
                {formatCurrency(invoice.profit)}
              </span>
            }
          />

        </div>
      </div>

      {/* customer info */}
      <div className="bg-white p-8 rounded-3xl shadow-md space-y-4">
        <h2 className="font-bold text-xl">بيانات العميل</h2>

        {invoice.customer ? (
          <div className="grid md:grid-cols-3 gap-6">
            <InfoItem label="الاسم" value={invoice.customer.name} />
            <InfoItem label="الموبايل" value={invoice.customer.phone || "-"} />
            <InfoItem label="الايميل" value={invoice.customer.email || "-"} />
          </div>
        ) : (
          <div className="text-gray-500">لا يوجد عميل مرتبط</div>
        )}
      </div>

      {/* items of the invoice */}
      <div className="bg-white p-8 rounded-3xl shadow-md space-y-6">
        <h2 className="font-bold text-xl">المنتجات</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-4">#</th>
                <th className="p-4">المنتج</th>
                <th className="p-4">السعر</th>
                <th className="p-4">الكميه</th>
                <th className="p-4">الإجمالي</th>
                <th className="p-4">الربح</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4 font-medium">
                    {item.product?.name}
                  </td>
                  <td className="p-4">{formatCurrency(item.price)}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">{formatCurrency(item.total)}</td>
                  <td className="p-4 text-green-600 font-semibold">{formatCurrency(item.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATED BY */}
      <div className="bg-white p-8 rounded-3xl shadow-md space-y-4">
        <h2 className="font-bold text-xl">تم انشاء الفاتوره بواسطة</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <InfoItem label="الاسم" value={invoice.user?.name} />
          <InfoItem label="الدور" value={invoice.user?.role} />
          <InfoItem label="الإيميل" value={invoice.user?.email} />
        </div>
      </div>

    </div>
  );
}