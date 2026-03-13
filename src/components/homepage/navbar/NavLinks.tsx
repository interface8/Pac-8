import Link from "next/link";

export default function NavLinks() {
  return (
    <nav className="flex items-center gap-6 ">
      <Link
        href="/testimonials"
      >
       <h1 className="hover:text-orange-500 text-lg font-light text-gray-700 transition">Testimonials</h1>
      </Link>
    </nav>
  );
}