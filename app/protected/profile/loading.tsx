export default function Loading() {
  return (
    <div className="min-h-screen bg-white font-gentium animate-pulse">
      <div className="max-w-full mx-auto space-y-8 p-6 md:p-12">
        {/* Skeleton del Header */}
        <header className="bg-white rounded-[2rem] p-6 md:p-8 shadow-lg border border-[#d7e5ef] flex flex-col md:flex-row justify-between items-start gap-6 relative">
          <div className="flex items-start gap-5 flex-1">
            <div className="w-28 h-28 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-10 bg-slate-200 rounded-lg w-3/4" />
              <div className="h-6 bg-slate-200 rounded-lg w-2/3" />
              <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
            </div>
          </div>
          <div className="absolute top-6 right-6 md:relative md:top-0 md:right-0">
            <div className="h-10 bg-slate-200 rounded-lg w-24" />
          </div>
        </header>

        {/* Skeleton de las Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border shadow-sm border-[#e2ecf6]"
            >
              <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded-lg w-full" />
                <div className="h-4 bg-slate-100 rounded-lg w-5/6" />
                <div className="h-4 bg-slate-100 rounded-lg w-4/6" />
              </div>
            </div>
          ))}
        </section>

        {/* Skeleton de Habilidades */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm border-[#e2ecf6]">
          <div className="h-7 bg-slate-200 rounded-lg w-1/3 mb-6" />
          <div className="flex flex-wrap gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-full w-32" />
            ))}
          </div>
          <div className="h-7 bg-slate-200 rounded-lg w-1/3 mb-6" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-full w-40" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
