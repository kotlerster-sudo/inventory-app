export default function StockLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between pt-2">
        <div className="h-7 w-32 bg-gray-200 rounded-lg" />
        <div className="h-9 w-24 bg-gray-200 rounded-xl" />
      </div>
      {/* Filter chips */}
      <div className="flex gap-2">
        {[36, 80, 72, 64, 60, 72].map((w, i) => (
          <div key={i} className="h-7 bg-gray-200 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {/* Item cards */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
          <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="flex gap-3">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
