'use client';

export default function ReportsPage() {
      return (
            <main className="p-8 max-w-[1400px] w-full mx-auto">
                  <div className="mb-8">
                        <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white tracking-tight">Reports</h2>
                        <p className="text-neutral-500 text-sm mt-1">Detailed analytics and financial statements.</p>
                  </div>
                  <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-12 rounded-xl text-center">
                        <span className="material-symbols-outlined text-4xl text-neutral-300 mb-4">bar_chart_4_bars</span>
                        <p className="text-neutral-500 font-medium">Financial reports will appear here.</p>
                  </div>
            </main>
      );
}
