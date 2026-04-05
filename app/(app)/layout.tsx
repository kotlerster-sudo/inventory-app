import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col pb-20">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
