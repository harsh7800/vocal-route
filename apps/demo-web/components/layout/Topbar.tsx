'use client';

import { useVocalRoute } from 'vocalroute-sdk';

export function Topbar() {
  const { startListening } = useVocalRoute();

  return (
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#1a1a1a]/80 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xl">search</span>
          <input 
            className="w-full bg-neutral-100 dark:bg-white/5 border-none rounded-lg pl-10 pr-4 h-10 text-sm focus:ring-1 focus:ring-[#1a1a1a] dark:focus:ring-white transition-all placeholder:text-neutral-400 dark:text-white" 
            placeholder="Search or use voice command (Ctrl+Space)..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          type='button'
          onClick={startListening}
          className="p-2 text-neutral-500 hover:text-[#1a1a1a] dark:hover:text-white transition-colors flex items-center gap-2 group"
          title="Voice Command"
        >
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">mic</span>
        </button>
        <button type='button' className="p-2 text-neutral-500 hover:text-[#1a1a1a] dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined text-2xl">notifications</span>
        </button>
        <div 
          className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 bg-cover bg-center border border-neutral-200 dark:border-neutral-700" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')" }}
        ></div>
      </div>
    </header>
  );
}
