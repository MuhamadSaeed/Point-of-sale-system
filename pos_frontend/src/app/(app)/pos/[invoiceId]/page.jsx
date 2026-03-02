"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function InvoiceDetailsPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const [discountValue, setDiscountValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [sendingEmail, setSendingEmail] = useState(false);

  // fetchi invoices
  const fetchInvoice = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message || "فشل تحميل الفاتوره");
        return;
      }

      setInvoice(data?.data || data);
    } catch {
      toast.error("حدث خطا اثناء تحميل الفاتوره");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchInvoice();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!invoice) return null;
  
  // is the invoices has items? cuz we will use it to shwo thw table and disbale the discount btn 
  const hasItems = invoice.items && invoice.items.length > 0;
  // also check if their is a customer cuz we will not be able to send an email if tehre is no customer 
  const hasCustomer = invoice.customer;
  // just for email
  const customerHasEmail = invoice.customer && invoice.customer.email;
  // check if the discount bigger than the total
  const discountTooBig = Number(discountValue) > Number(invoice.total);

  // discount
  const handleApplyDiscount = async () => {
    if (!discountValue || discountTooBig || !hasItems) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/discount`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            discount: Number(discountValue),
          }),
        }
      );

      if (!response.ok) {
        toast.error("فشل تطبيق الخصم");
        return;
      }

      toast.success("تم تطبيق الخصم بنجاح");
      setDiscountValue("");
      fetchInvoice();

    } catch {
      toast.error("حدث خطا اثناء تطبيق الخصم");
    }
  };

  // payment
  const handlePayment = async () => {
    if (!hasItems) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            payment_method: paymentMethod,
          }),
        }
      );

      if (!response.ok) {
        toast.error("فشل اتمام الدفع");
        return;
      }

      toast.success("تم الدفع بنجاح");
      fetchInvoice();

    } catch {
      toast.error("حدث خطا اثناء اتمام الدفع");
    }
  };

  //print
  const handlePrint = async () => {
    if (!hasItems) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/print`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/html",
          },
        }
      );

      if (!response.ok) {
        toast.error("فشل الطباعة");
        return;
      }

      const html = await response.text();
      // open a new tab
      const printWindow = window.open("", "_blank");
      // write the html in this new tab
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();

    } catch {
      toast.error("حدث خطا اثناء الطباعة");
    }
  };

  // pdf
  const handleDownloadPdf = async () => {
    if (!hasItems) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("فشل تحميل الملف");
        return;
      }

      // we use the blob cuz it is a binary file
      const blob = await response.blob();
      // make a url for this
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

    } catch {
      toast.error("حدث خطا اثناء تحميل الملف");
    }
  };

  // ================= SEND EMAIL =================
  const handleSendEmail = async () => {
    if (!hasItems || !hasCustomer || !customerHasEmail) return;

    setSendingEmail(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/send-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        toast.error("فشل ارسال الايميل");
        return;
      }

      toast.success("تم ارسال الفاتوره بالايميل");

    } catch {
      toast.error("حدث خطا اثناء ارسال الايميل");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">تفاصيل الفاتوره #{invoice.id}</h1>

        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">

          <div>
            <strong>الحاله:</strong>{" "}
            <span className={invoice.status === "paid" ? "text-green-600 font-bold" : "text-orange-600 font-bold"}>
              {invoice.status}
            </span>
          </div>

          <div>
            <strong>الاجمالي:</strong> {invoice.subtotal} جنيه
          </div>

          <div>
            <strong>الخصم:</strong> {invoice.discount || 0} جنيه
          </div>

          <div className="text-lg font-bold">
            <strong>الصافي:</strong> {invoice.total} جنيه
          </div>

          {invoice.status !== "paid" && (
            <a
              href={`/pos/${invoice.id}/items`}
              className="block text-center bg-gray-800 text-white py-3 rounded-lg"
            >
              اضافة منتجات
            </a>
          )}

        </div>


        {/* table of items */}
        {hasItems && (
          <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
            <h3 className="font-bold text-lg mb-4">المنتجات</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border">#</th>
                    <th className="p-3 border">المنتج</th>
                    <th className="p-3 border">السعر</th>
                    <th className="p-3 border">الكمية</th>
                    <th className="p-3 border">الإجمالي</th>
                    <th className="p-3 border">الربح</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 border text-center">{index + 1}</td>

                      <td className="p-3 border font-medium">{item.product?.name || "-"}</td>

                      <td className="p-3 border">{item.price} جنيه</td>

                      <td className="p-3 border text-center">{item.quantity}</td>

                      <td className="p-3 border font-semibold">{item.total} جنيه</td>

                      <td className="p-3 border text-green-600 font-semibold">{item.profit} جنيه</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* discount */}
        {invoice.status !== "paid" && (
          <div className="bg-white p-6 rounded-xl shadow-sm mt-6 space-y-3">

            <input
              type="number"
              placeholder="قيمة الخصم"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full border p-3 rounded-lg"
              disabled={!hasItems}
            />

            <button
              onClick={handleApplyDiscount}
              disabled={!hasItems || discountTooBig}
              className="w-full bg-gray-800 text-white py-3 rounded-lg disabled:opacity-50"
            >
              تطبيق الخصم
            </button>

          </div>
        )}

        {/* payment */}
        {invoice.status !== "paid" && (
          <div className="bg-white p-6 rounded-xl shadow-sm mt-6 space-y-3">

            <h3 className="font-bold text-lg">اتمام الدفع</h3>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border p-3 rounded-lg"
              disabled={!hasItems}
            >
              <option value="cash">كاش</option>
              <option value="card">بطاقه</option>
              <option value="wallet">محفظه</option>
            </select>

            <button
              onClick={handlePayment}
              disabled={!hasItems}
              className="w-full bg-gray-800 text-white py-3 rounded-lg disabled:opacity-50"
            >
              اتمام الدفع
            </button>

          </div>
        )}

        {/* actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm mt-6 space-y-3">

          <button
            onClick={handlePrint}
            disabled={!hasItems}
            className="w-full bg-gray-800 text-white py-3 rounded-lg disabled:opacity-50"
          >
            طباعة الفاتوره
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={!hasItems}
            className="w-full bg-gray-800 text-white py-3 rounded-lg disabled:opacity-50"
          >
            تحميل PDF
          </button>

          <button
            onClick={handleSendEmail}
            disabled={
              !hasItems || !hasCustomer || !customerHasEmail
            }
            className="w-full bg-gray-800 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {sendingEmail
              ? "جارى الارسال..."
              : "ارسال بالايميل"}
          </button>

        </div>

      </div>
    </div>
  );
}