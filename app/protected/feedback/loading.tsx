export default function LoadingFeedback() {
  return (
    <main className="min-h-screen bg-[#f7f3e7]">
      <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-5 w-56 bg-[#dce7f4] rounded mb-6 ml-auto" />
        <div className="h-14 w-2/3 bg-[#dce7f4] rounded mb-3" />
        <div className="h-6 w-1/2 bg-[#dce7f4] rounded mb-8" />

        <div className="h-72 w-full bg-white rounded-2xl border border-[#dce7f4] mb-8" />

        <div className="h-8 w-80 bg-[#dce7f4] rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="h-48 bg-white rounded-xl border border-[#dce7f4]" />
          <div className="h-48 bg-white rounded-xl border border-[#dce7f4]" />
          <div className="h-48 bg-white rounded-xl border border-[#dce7f4]" />
        </div>

        <div className="h-8 w-72 bg-[#dce7f4] rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-48 bg-white rounded-xl border border-[#dce7f4]" />
          <div className="h-48 bg-white rounded-xl border border-[#dce7f4]" />
          <div className="h-48 bg-white rounded-xl border border-[#dce7f4]" />
        </div>
      </div>
    </main>
  );
}
