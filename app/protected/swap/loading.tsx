export default function SwapLoading() {
  return (
    <main className="flex-1 flex flex-col items-center w-full bg-[#f7f3e7]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#9cd2d3]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-10 w-64 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="w-full max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-[#9cd2d3]">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-[#9cd2d3]/20 p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-grow space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="flex gap-3">
                  <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
