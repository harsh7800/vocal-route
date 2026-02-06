'use client';

export default function ClientsPage() {
      return (
            <main className="p-8 max-w-[1400px] w-full mx-auto">
                  <div className="mb-8">
                        <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white tracking-tight">Clients</h2>
                        <p className="text-neutral-500 text-sm mt-1">Manage your customer relationships.</p>
                  </div>
                  <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-12 rounded-xl text-center">
                        <span className="material-symbols-outlined text-4xl text-neutral-300 mb-4">group</span>
                        <p className="text-neutral-500 font-medium">Customer list will appear here.</p>
                  </div>
            </main>
      );
}
