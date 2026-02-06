'use client';

import Image from 'next/image';

export default function SettingsPage() {
      return (
        <main className="p-8 max-w-4xl mx-auto w-full">
              <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight text-[#1a1a1a] dark:text-white">Account Settings</h1>
                    <p className="mt-2 text-neutral-500 dark:text-neutral-400">Manage your profile, preferences, and security settings.</p>
              </div>

              {/* General Settings Section */}
              <section className="mb-12">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-6">
                          <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">General Settings</h2>
                          <span className="text-xs text-neutral-400 font-medium px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded">Public Profile</span>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                          <div className="flex flex-col items-center gap-4">
                                <div className="relative w-32 h-32 group cursor-pointer">
                                      <div className="w-full h-full rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden">
                                            <img
                                                  className="w-full h-full object-cover"
                                                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                  alt="Profile"
                                            />
                                      </div>
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined">photo_camera</span>
                                      </div>
                                </div>
                                <div className="text-center">
                                      <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">Profile Picture</p>
                                      <p className="text-xs text-neutral-400">JPG, PNG, max 2MB</p>
                                </div>
                          </div>

                          <div className="md:col-span-2 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                      <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">First Name</label>
                                            <input
                                                  className="h-10 rounded border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 text-sm focus:border-[#1a1a1a] focus:ring-0 dark:text-white"
                                                  type="text"
                                                  defaultValue="Alex"
                                            />
                                      </div>
                                      <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Last Name</label>
                                            <input
                                                  className="h-10 rounded border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 text-sm focus:border-[#1a1a1a] focus:ring-0 dark:text-white"
                                                  type="text"
                                                  defaultValue="Rivera"
                                            />
                                      </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email Address</label>
                                      <input
                                            className="h-10 rounded border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 text-sm focus:border-[#1a1a1a] focus:ring-0 dark:text-white"
                                            type="email"
                                            defaultValue="alex@example.com"
                                      />
                                </div>
                          </div>
                    </div>
              </section>

              {/* Notifications Section */}
              <section className="mb-12">
                    <div className="flex items-center border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-6">
                          <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                          {[
                                { title: 'Email Notifications', desc: 'Get updates about your activity and platform news', active: true },
                                { title: 'Push Notifications', desc: 'Real-time alerts on your browser or mobile device', active: false },
                                { title: 'Weekly Reports', desc: 'Summarized performance analytics every Monday', active: true },
                          ].map((notif) => (
                                <div key={notif.title} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a]/50">
                                      <div>
                                            <p className="text-sm font-bold text-[#1a1a1a] dark:text-white">{notif.title}</p>
                                            <p className="text-xs text-neutral-400">{notif.desc}</p>
                                      </div>
                                      <label className="relative inline-flex cursor-pointer items-center">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={notif.active} />
                                            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a] dark:peer-checked:bg-white/20"></div>
                                      </label>
                                </div>
                          ))}
                    </div>
              </section>

              {/* Actions */}
              <div className="pt-4 flex gap-4">
                    <button className="bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] text-sm font-bold h-11 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity">
                          Save Changes
                    </button>
                    <button className="border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm font-bold h-11 px-6 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                          Cancel
                    </button>
              </div>
        </main>
  );
}
