export default function SellLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between pt-2">
        <div className="h-7 w-28 bg-gray-200 rounded-lg" />
        <div className="h-5 w-16 bg-gray-200 rounded" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
