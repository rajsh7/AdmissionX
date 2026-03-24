import Image from "next/image";

export default function ReviewsTab() {
  const reviews = Array.from({ length: 6 }).map((_, i) => ({
     id: i,
     name: "Lara Smith",
     role: "Harvard Medical",
     text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout...",
     rating: 4,
     avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=60&w=150&h=150"
  }));

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-12 py-8 mt-2 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          {/* Overall Rating */}
           <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
             <h4 className="text-gray-900 font-extrabold text-sm mb-4">Overall Rating</h4>
             <div className="flex items-end gap-3 mb-4">
               <span className="text-4xl font-black text-gray-900">4.8</span>
               <div className="flex flex-col gap-1 pb-1">
                 <div className="flex text-yellow-400">
                    {'★★★★★'.split('').map((star, i) => <span key={i} className="text-lg">{star}</span>)}
                 </div>
                 <span className="text-[10px] text-gray-500 font-semibold tracking-wide">Out of 5.0 • Based on 5,249 reviews</span>
               </div>
             </div>
             
             {/* Rating Bars */}
             <div className="space-y-2.5">
               {[{star:5, pct:71, fill:'bg-[#4fd1c5]'}, {star:4, pct:20, fill:'bg-[#4fd1c5]'}, {star:3, pct:7, fill:'bg-[#4fd1c5]'}, {star:2, pct:1, fill:'bg-gray-200'}, {star:1, pct:1, fill:'bg-gray-200'}].map((rating, idx) => (
                 <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-semibold w-10">{rating.star} Stars</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className={`h-full ${rating.fill}`} style={{ width: `${rating.pct}%` }}/>
                    </div>
                    <span className="text-xs text-gray-500 font-semibold w-8 text-right">{rating.pct}%</span>
                 </div>
               ))}
             </div>
           </div>

           {/* Student Satisfaction */}
           <div>
             <h4 className="text-gray-900 font-extrabold text-sm mb-4 pl-1">Student Satisfaction</h4>
             <div className="flex gap-4">
                <div className="flex-1 bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
                   <div className="text-red-400 mb-2 flex justify-center text-3xl">👍</div>
                   <h5 className="font-extrabold text-xl text-gray-900 mb-1">94%</h5>
                   <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">Recommend to a<br/>friend</p>
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
                   <div className="text-green-500 mb-2 flex justify-center text-3xl">💼</div>
                   <h5 className="font-extrabold text-xl text-gray-900 mb-1">92%</h5>
                   <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">Employed within<br/>6 months</p>
                </div>
             </div>
           </div>
        </div>

        {/* Right Content */}
        <div className="md:col-span-8 lg:col-span-9">
           {/* Reviews Nav Filter */}
           <div className="flex flex-wrap gap-1 mb-8">
             {["All Reviews", "Student", "Alumni", "Campus Life", "Placements"].map((tag, idx) => (
               <button 
                 key={idx} 
                 className={`px-5 py-2.5 text-xs font-bold transition-colors ${
                   idx === 0 
                     ? 'bg-teal-50 text-teal-600 rounded-lg' 
                     : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg'
                 }`}
               >
                 {tag}
               </button>
             ))}
           </div>

           {/* Reviews Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative group hover:shadow-md transition">
                   <div className="absolute top-6 right-6 text-teal-200 text-4xl leading-none font-serif opacity-50">&rdquo;</div>
                   <div className="flex items-center gap-3 mb-4">
                     <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image src={rev.avatar} alt="User" fill className="object-cover" />
                     </div>
                     <div>
                       <h5 className="text-sm font-extrabold text-gray-900">{rev.name}</h5>
                       <span className="text-[10px] font-semibold text-gray-500">{rev.role}</span>
                     </div>
                   </div>
                   <p className="text-xs leading-relaxed text-gray-600 mb-5 relative z-10 pr-4">
                     {rev.text}
                   </p>
                   <div className="flex text-yellow-400 border-t border-gray-100 pt-4">
                     {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className={`text-sm ${i < rev.rating ? 'text-yellow-400' : 'text-gray-300'}`}>{star}</span>
                     ))}
                   </div>
                </div>
             ))}
           </div>

           {/* Pagination Placeholder */}
           <div className="mt-10 flex justify-center items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-teal-600">{'<'}</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#00bfa5] text-white font-bold text-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold text-sm border border-gray-200 shadow-sm bg-white">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold text-sm border border-gray-200 shadow-sm bg-white">3</button>
              <span className="text-gray-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold text-sm border border-gray-200 shadow-sm bg-white">9</button>
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-teal-600">{'>'}</button>
           </div>
        </div>

      </div>
    </div>
  );
}
