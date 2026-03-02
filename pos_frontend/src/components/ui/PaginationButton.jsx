"use client";

export default function PaginationButton({ children, disabled, onClick,}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="px-5 py-2 rounded-lg font-medium transition cursor-pointer
      bg-white border border-gray-300
      hover:bg-gray-600 hover:text-gray-900
      disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}