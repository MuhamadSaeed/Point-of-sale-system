import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6" dir="rtl">
      <div className="bg-white shadow-md rounded-2xl p-10 max-w-md w-full text-center space-y-6">

        <h1 className="text-6xl font-bold text-gray-800">404</h1>

        <h2 className="text-xl font-semibold text-gray-700">الصفحه غير موجوده</h2>

        <p className="text-gray-500 text-sm">الرابط الذي ادخلته غير صحيح او تم حذفه.</p>

        <Link
          href="/pos"
          className="block w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
        >
          الرجوع لنظام البيع
        </Link>

      </div>
    </div>
  );
}