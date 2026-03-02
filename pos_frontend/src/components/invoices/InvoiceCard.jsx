"use client";

import Link from "next/link";

export default function InvoiceCard({ invoice }) {
  // if invoice paid make it green, if open make it yellow
  const statusColor = invoice.status === "paid"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  // convert the date to arabic
  const formattedDate = new Date(invoice.created_at).toLocaleDateString("ar-EG");

  // convert the time => hour and minutes and get two numbers of them
  const formattedTime = new Date(invoice.created_at).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // convert the english number to arabic number and add the جنيه next to it
  const formatCurrency = (value) =>
    new Intl.NumberFormat("ar-EG").format(Number(value)) + " جنيه";

  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition space-y-4">

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400 font-mono truncate">#{invoice.invoice_number.slice(0, 8)}</span>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
        >
          {invoice.status === "paid" ? "مدفوعة" : "مفتوحة"}
        </span>
      </div>

      <div>
        <div className="text-xs text-gray-400">العميل</div>
        <div className="font-semibold text-lg">{invoice.customer?.name || "بدون عميل"}</div>
      </div>

      <div className="flex justify-between">
        <div>
          <div className="text-xs text-gray-400">الإجمالي</div>
          <div className="font-bold text-lg">{formatCurrency(invoice.total)}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400">الربح</div>
          <div className="font-bold text-green-600">{formatCurrency(invoice.profit)}</div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        الموظف: {invoice.user?.name}
      </div>

      <div className="text-xs text-gray-400">
        {formattedDate} - {formattedTime}
      </div>

      <Link
        href={`/invoices/${invoice.id}`}
        className="block text-center bg-gray-900 text-white py-2 rounded-xl hover:opacity-90 transition"
      >
        عرض التفاصيل
      </Link>
    </div>
  );
}