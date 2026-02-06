'use client';

const invoices = [
      { id: '#INV-2024-001', client: 'Acme Corp', initials: 'AC', amount: '$1,250.00', status: 'Paid', date: 'Oct 24, 2023' },
      { id: '#INV-2024-002', client: 'Global Tech', initials: 'GT', amount: '$850.00', status: 'Pending', date: 'Oct 22, 2023' },
      { id: '#INV-2024-003', client: 'Design Studio', initials: 'DS', amount: '$3,400.00', status: 'Paid', date: 'Oct 20, 2023' },
      { id: '#INV-2024-004', client: 'Cloud Systems', initials: 'CS', amount: '$2,100.00', status: 'Overdue', date: 'Oct 15, 2023' },
      { id: '#INV-2024-005', client: 'Nexus Inc', initials: 'NI', amount: '$500.00', status: 'Draft', date: 'Oct 25, 2023' },
];

export default function InvoicesPage() {
      return (
        <main className="p-8 max-w-[1400px] w-full mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                          <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white tracking-tight">Invoices Management</h2>
                          <p className="text-neutral-500 text-sm mt-1">Review and manage your billing transactions.</p>
                    </div>
                    <div className="flex gap-3">
                              <button type='button' className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent">
                                <span className="material-symbols-outlined text-lg">download</span>
                                Export CSV
                          </button>
                              <button type='button' className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                                <span className="material-symbols-outlined text-lg">add</span>
                                New Invoice
                          </button>
                    </div>
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                                <thead>
                                      <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/[0.02]">
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Invoice ID</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Client</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Amount</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Date</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                                      </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                      {invoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors group">
                                                  <td className="px-6 py-4 text-sm font-semibold text-[#1a1a1a] dark:text-white">{inv.id}</td>
                                                  <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                              <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold">
                                                                    {inv.initials}
                                                              </div>
                                                              <span className="text-sm font-medium">{inv.client}</span>
                                                        </div>
                                                  </td>
                                                  <td className="px-6 py-4 text-sm font-medium">{inv.amount}</td>
                                                  <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${inv.status === 'Paid'
                                                                    ? 'bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a]'
                                                                    : inv.status === 'Overdue'
                                                                          ? 'bg-red-500 text-white'
                                                                          : 'border border-neutral-200 dark:border-neutral-700 text-neutral-500'
                                                              }`}>
                                                              {inv.status}
                                                        </span>
                                                  </td>
                                                  <td className="px-6 py-4 text-sm text-neutral-500">{inv.date}</td>
                                                  <td className="px-6 py-4 text-right">
                                                        <button type='button' className="text-neutral-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors">
                                                              <span className="material-symbols-outlined">more_vert</span>
                                                        </button>
                                                  </td>
                                            </tr>
                                      ))}
                                </tbody>
                          </table>
                    </div>
              </div>
        </main>
  );
}
