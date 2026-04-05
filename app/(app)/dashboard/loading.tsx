export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between pt-2">
        <div className="h-7 w-28 bg-gray-200 rounded-lg" />
      </div>
      {/* Type tabs skeleton */}
      <div className="flex gap-2">
        {[60, 52, 80, 52].map((w, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {/* KPI grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-9 bg-gray-50 border-b border-gray-100" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-8 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
