import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="text-center mt-16 py-16 px-4  w-3/4  bg-linear-to-br from-orange-400 to-amber-300 rounded-2xl">
      <h2 className="text-3xl md:text-5xl font-medium text-white mb-14">
        Ready to Join Them?
      </h2>
      <p className="text-2xl text-white mb-14 mx-auto">
        Start your solar journey today and become our next success story
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/calculator"
          className="bg-white text-orange-500 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-xl font-medium"
        >
          Calculate Your Needs
        </Link>
        <Link
          href="/products"
          className="border-2 border-white text-white px-8 py-3 rounded-lg hover:text-black transition-colors text-xl font-medium"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}