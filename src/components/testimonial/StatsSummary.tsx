import { useTestimonialStats } from "@/hooks/use-testimonials";

export default function StatsSummary() {
  const { stats, loading, error } = useTestimonialStats();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 ">
      {error && (
        <div className="col-span-full text-center text-red-500">
          Failed to load stats. Please try again later.
        </div>
      )}

      <div className="text-center py-8 rounded-xl shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-[#F05700]/10 bg-white max-w-100">
        <div className="text-3xl sm:text-4xl font-bold mb-6 lg:text-5xl tracking-widest text-orange-600">
          {loading ? "Loading..." : stats.totalTestimonials}
        </div>
        <div className="text-sm sm:text-base text-gray-500 font-normal lg:text-xl pt-6">
          Happy Customers
        </div>
      </div>

      <div className="text-center py-8 rounded-xl shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-[#F05700]/10 bg-white max-w-100">
        <div className="text-3xl sm:text-4xl font-semibold mb-6  lg:text-5xl tracking-widest text-orange-600">
          {loading ? "Loading..." : (stats.averageRating?.toFixed(1) ?? 0)}
        </div>
        <div className="text-sm sm:text-base text-gray-500  font-normal lg:text-xl pt-6">
          System installed
        </div>
      </div>

      <div className="text-center py-8 rounded-xl shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-[#F05700]/10 bg-white max-w-100">
        <div className="text-3xl sm:text-4xl font-semibold mb-6 lg:text-5xl  text-orange-600">
          ₦2.8B+
        </div>
        <div className="text-sm sm:text-base text-gray-500 font-normal lg:text-xl pt-6">
          Total Savings
        </div>
      </div>

      <div className="text-center py-8 rounded-xl shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-[#F05700]/10 bg-white max-w-100">
        <div className="text-4xl sm:text-4xl font-semibold mb-6  lg:text-5xl tracking-widest text-orange-600">
          98%
        </div>
        <div className="text-sm sm:text-base text-gray-500  font-normal lg:text-xl pt-6">
          Customer Satisfaction
        </div>
      </div>
    </div>
  );
}
