// app/protected/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f7f3e7] animate-pulse">
      {/* 1. Navbar Skeleton */}
      <nav className="w-full flex items-center justify-between px-12 py-4 bg-white/80 border-b border-[#9cd2d3]/20 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-32 h-10 bg-slate-200 rounded-full" />
          <div className="w-24 h-6 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-10">
          <div className="flex gap-8">
            <div className="w-6 h-6 bg-slate-200 rounded-full" />
            <div className="w-6 h-6 bg-slate-200 rounded-full" />
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-full" />
        </div>
      </nav>

      {/* 2. Main Content Wrapper */}
      <div className="w-full max-w-7xl px-6 py-12 space-y-8">
        
        {/* 3. Search Filters Skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#9cd2d3]/20 flex gap-5 items-center">
          <div className="w-7/12 h-12 bg-slate-100 rounded-2xl" />
          <div className="flex gap-3">
            <div className="w-28 h-10 bg-slate-200 rounded-2xl" />
            <div className="w-32 h-10 bg-slate-200 rounded-2xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 4. Left Column - User Cards Grid */}
          <div className="lg:col-span-2 space-y-8">
            <div className="w-48 h-10 bg-slate-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#9cd2d3]/20">
                  <div className="h-72 bg-slate-100 m-3 rounded-sm" />
                  <div className="p-5 space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                      <div className="h-5 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-12 bg-slate-200 rounded-2xl w-full mt-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Intercambios Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#9cd2d3]/20">
              <div className="h-8 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-4" />
              <div className="w-full bg-slate-100 rounded-full h-3" />
            </div>

            {/* Trending Skills Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#9cd2d3]/20">
              <div className="h-8 bg-slate-200 rounded w-2/3 mb-6" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 mb-2 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white rounded-full" />
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                  </div>
                  <div className="w-16 h-4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}