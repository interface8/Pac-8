import Link from "next/link";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function MobileMenu({ open, setOpen }: Props) {
  if (!open) return null;

  return (
    <div className="md:hidden border-t bg-white">
      <div className="flex flex-col gap-4 px-6 py-5">

        <Link
          href="/testimonials"
          onClick={() => setOpen(false)}
        >
          Testimonials
        </Link>

        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="border px-4 py-2 rounded-lg text-sm"
        >
          Login
        </Link>

        <Link
          href="/get-started"
          onClick={() => setOpen(false)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm text-center"
        >
          Get Started
        </Link>

      </div>
    </div>
  );
}