import Image from "next/image";

interface CourseRow {
  course_name: string;
  degree_name: string;
  fees: string | null;
  courseduration: string | null;
}

interface CoursesTabProps {
  courses: CourseRow[];
}

export default function CoursesTab({ courses }: CoursesTabProps) {
  // Hardcoded sub-tabs to match UI
  const subTabs = ["Undergraduate", "Postgraduate", "Phd", "Diploma", "Certificate Programs"];
  const instructors = [1, 2, 3, 4]; // Dummy array for matching 4 instructor cards

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-12 py-8 mt-2">
         {/* Sub Tabs Container */}
         <div className="flex flex-wrap gap-2 mb-6">
           {subTabs.map((tab, idx) => (
             <button 
               key={idx} 
               className={`px-6 py-2 text-sm font-bold border transition ${
                 idx === 0 
                   ? 'bg-[#8bc6ba] text-[#00473a] border-[#8bc6ba]' 
                   : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
               }`}
             >
               {tab}
             </button>
           ))}
         </div>

         {/* Courses List */}
         <div className="space-y-4 mb-8">
            {courses.length > 0 ? courses.slice(0, 5).map((course, idx) => (
              <div 
                key={idx} 
                className="rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden"
                style={{ backgroundColor: "#243447" }}
              >
                <div className="flex flex-col gap-1 z-10 text-white">
                  <h4 className="text-sm font-extrabold">{course.course_name}</h4>
                  <span className="text-xs text-gray-400">
                    {course.courseduration ? `${course.courseduration} ` : ''}{course.degree_name || 'Undergraduate'}
                  </span>
                  <span className="text-xs text-gray-400 mt-2">
                    Placement - {idx === 0 ? '85%' : '80%'}
                  </span>
                </div>
                
                <div className="flex flex-col md:items-end mt-4 md:mt-0 z-10 text-white">
                  <span className="text-sm font-extrabold mb-4">
                    Fees : {course.fees ? course.fees : 'On Request'} rs annual
                  </span>
                  <button className="px-6 py-2 rounded text-xs font-extrabold transition-opacity hover:opacity-90 mt-2 text-white" style={{ backgroundColor: "#00bfa5" }}>
                    Apply Now
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-gray-500 py-10 text-center text-sm">No courses currently listed.</div>
            )}

            {courses.length > 5 && (
               <button className="px-5 py-2 rounded text-xs font-extrabold text-white mt-4 transition" style={{ backgroundColor: "#00bfa5" }}>
                 View All
               </button>
            )}
         </div>

         {/* Instructors Section */}
         <div className="rounded-xl overflow-hidden shadow-sm p-6 sm:p-8" style={{ backgroundColor: "#6c7a89" }}>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
             <div>
               <div className="flex items-center gap-2 text-gray-200 text-xs font-bold uppercase tracking-widest mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                 TEACHER
               </div>
               <h3 className="text-2xl font-extrabold text-white">Meet Our Instructor</h3>
             </div>
             <button className="mt-4 md:mt-0 px-6 py-2 rounded text-sm font-extrabold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: "#00bfa5" }}>
               View All
             </button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {instructors.map((idx) => (
               <div key={idx} className="bg-white rounded-lg overflow-hidden flex flex-col group relative">
                 <div className="h-48 relative bg-gray-100 flex items-end justify-center pt-8">
                    {/* Abstract yellow graphic mimicking the design */}
                    <div className="absolute top-0 left-0 right-0 h-16" style={{ background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)" }} />
                    <svg className="absolute top-0 w-full h-16 opacity-30 mix-blend-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                       <path d="M0,0 L100,0 L50,100 Z" fill="white" />
                    </svg>

                    {/* Instructor Placeholder image */}
                    <div className="relative w-32 h-40 z-10 bottom-0">
                       <Image 
                         src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=320" 
                         alt="Instructor" 
                         fill 
                         className="object-cover object-top filter group-hover:brightness-110 transition rounded-t-lg"
                       />
                    </div>
                 </div>
                 <div className="p-4 bg-white relative text-center">
                    <button className="absolute -top-4 right-4 w-8 h-8 rounded flex items-center justify-center text-white shadow shadow-black/20 z-20" style={{ backgroundColor: "#00bfa5" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.896 5.365C16.806 9.906 17 10.18 17 10.5v8.25a3 3 0 11-6 0v-8.25c0-.32.194-.594.354-.635a3 3 0 11-1.25-.09c.142.126.315.22" clipRule="evenodd" /></svg>
                      {/* Using a standard share icon approximation for the design's icon */}
                    </button>
                    <h5 className="text-sm font-extrabold text-gray-900 mb-1">Meet Our Instructor</h5>
                    <span className="text-xs text-red-500 font-semibold">Teacher</span>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
}
