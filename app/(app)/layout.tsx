import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Inventory";
  return (
    <div className="min-h-full flex flex-col pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto w-full px-4 py-3">
          <p className="text-base font-bold text-indigo-700 tracking-tight">{storeName}</p>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
