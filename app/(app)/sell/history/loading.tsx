export default function SalesHistoryLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gray-200 rounded-lg" />
          <div className="h-7 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center space-y-1">
          <div className="h-8 w-16 bg-gray-200 rounded mx-auto" />
          <div className="h-3 w-20 bg-gray-200 rounded mx-auto" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center space-y-1">
          <div className="h-8 w-24 bg-gray-200 rounded mx-auto" />
          <div className="h-3 w-20 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
