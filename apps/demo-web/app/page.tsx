'use client';

export default function Dashboard() {
  return (
    <main className="p-8 max-w-[1400px] w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white tracking-tight">Performance Overview</h2>
          <p className="text-neutral-500 text-sm mt-1">Real-time metrics for your active campaigns.</p>
        </div>
        <div className="flex gap-3">
          <button type='button' className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent">
            <span className="material-symbols-outlined text-lg font-variation-fill">download</span>
            Export CSV
          </button>
          <button type='button' className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-lg">add</span>
            New Report
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: '$42,390.00', trend: '+12.4%', up: true },
          { label: 'Active Users', value: '24,512', trend: '+5.2%', up: true },
          { label: 'Conversion Rate', value: '18.6%', trend: '-1.2%', up: false },
          { label: 'Avg Session', value: '4m 32s', trend: '+0.8%', up: true }
        ].map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">{metric.label}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${metric.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {metric.trend}
              </span>
            </div>
            <p className="text-2xl font-black text-[#1a1a1a] dark:text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Chart/Body area */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold">Revenue Growth</h3>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#1a1a1a] dark:bg-white"></span> Current Year</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-neutral-300"></span> Previous Year</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-lg">
            <p className="text-neutral-400 text-sm italic">Growth Chart Visualization</p>
          </div>
        </div>
      </div>
    </main>
  );
}
