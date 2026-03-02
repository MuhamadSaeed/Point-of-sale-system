"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md w-full text-center space-y-4">

        <h2 className="text-xl font-bold text-red-600">
          حصل مشكله غير متوقعه
        </h2>

        <p className="text-gray-600 text-sm">
          حصل مشكله اثناء تحميل الصفحه. حاول تاني.
        </p>

        <button
          onClick={() => reset()}
          className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
        >
          اعاده المحاوله
        </button>

      </div>
    </div>
  );
}