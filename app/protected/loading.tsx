export default function Loading() {
  return (
    <div className="min-h-screen bg-white rounded-2xl shadow-2xl p-6 md:p-10 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Skeleton del Header */}
        <header className="bg-slate-50 rounded-[2rem] p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row gap-6">
          <div className="w-28 h-28 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
            <div className="h-6 bg-slate-200 rounded-lg w-1/4" />
          </div>
        </header>

        {/* Skeleton de las Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-50 rounded-2xl border border-slate-100" />
          ))}
        </section>

        {/* Skeleton de Habilidades */}
        <div className="h-64 bg-slate-50 rounded-2xl border border-slate-100 w-full" />
      </div>
    </div>
  );
}