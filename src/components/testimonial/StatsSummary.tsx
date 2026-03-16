export default function StatsSummary() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 ">
    
      <div className="text-center py-14 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-[#F05700]/10 bg-white"
           >
        <div className="text-3xl sm:text-4xl font-bold mb-6 lg:text-5xl tracking-widest text-orange-600">5,000+</div>
        <div className="text-sm sm:text-base text-gray-500 font-normal lg:text-xl pt-6">Happy Customers</div>
      </div>

      
      <div className="text-center py-14 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-[#F05700]/10 bg-white"
          >
        <div className="text-3xl sm:text-4xl font-semibold mb-6  lg:text-5xl tracking-widest text-orange-600">7,500+</div>
        <div className="text-sm sm:text-base text-gray-500  font-normal lg:text-xl pt-6">Systems Installed</div>
      </div>

      
      <div className="text-center py-14 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-[#F05700]/10 bg-white"
          >
        <div className="text-3xl sm:text-4xl font-semibold mb-6 lg:text-5xl tracking-widest text-orange-600">₦2.8B+</div>
        <div className="text-sm sm:text-base text-gray-500 font-normal lg:text-xl pt-6">Total Savings</div>
      </div>

      
      <div className="text-center py-14 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-[#F05700]/10 bg-white"
          >
        <div className="text-4xl sm:text-4xl font-semibold mb-6  lg:text-5xl tracking-widest text-orange-600">98%</div>
        <div className="text-sm sm:text-base text-gray-500  font-normal lg:text-xl pt-6">Customer Satisfaction</div>
      </div>
    </div>
  );
}