import Link from "next/link";

export default function ManageButton({ title, link }) {
  return (
    <Link
      href={link}
      className="bg-gray-900 text-white p-6 rounded-2xl text-center hover:opacity-90 transition font-semibold"
    >
      {title}
    </Link>
  );
}