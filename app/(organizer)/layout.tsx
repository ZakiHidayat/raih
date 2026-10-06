'use client';

// ============================================================
// RAIH — Notion Organizer Workspace Shell
// Design System: Notion (design.md)
// Modeled after Notion's document-first workspace shell with Streamline MingCute Icons
// ============================================================
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Chip } from '@heroui/react';
import {
  LayoutDashboard,
  LayoutDashboardFill,
  Users,
  UsersFill,
  BarChart2,
  BarChart2Fill,
  Plus,
  PlusCircleFill,
  Home,
  HomeFill,
  ChevronLeft,
  ChevronRight,
  Search,
  SearchFill,
  SlidersHorizontal,
  Bell,
  BellFill,
  Settings,
  SettingsFill,
  Trophy,
  TrophyFill,
  LogOut,
  Menu,
} from '@/components/ui/icons';
import { useAuthStore } from '@/lib/stores/auth';

const organizerPages = [
  { href: '/dashboard', icon: LayoutDashboard, iconFill: LayoutDashboardFill, label: 'Dashboard Pengelola' },
  { href: '/participants', icon: Users, iconFill: UsersFill, label: 'Daftar Peserta' },
  { href: '/analytics', icon: BarChart2, iconFill: BarChart2Fill, label: 'Analitik & Laporan' },
  { href: '/competitions/create', icon: Plus, iconFill: PlusCircleFill, label: 'Buat Lomba Baru' },
];

export default function NotionOrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const orgProfile = user?.organizer_profile;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Pengelola';
    if (pathname.startsWith('/participants')) return 'Daftar Peserta';
    if (pathname.startsWith('/analytics')) return 'Analitik & Laporan';
    if (pathname.startsWith('/competitions/create')) return 'Buat Lomba Baru';
    return 'Panel Pengelola';
  };

  return (
    <div className="min-h-screen flex bg-[#F6F5F4] text-[#000000] font-sans antialiased">
      {/* ── Left Notion Sidebar (Desktop) ────────────────── */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen max-h-screen shrink-0 self-start bg-[#F7F6F3] border-r border-[#E6E6E6] transition-all duration-200 z-30 select-none ${
          isSidebarOpen ? 'w-60 min-w-[240px]' : 'w-14 min-w-[56px]'
        }`}
      >
        {/* Workspace Switcher Header */}
        <div className="h-12 border-b border-[#E6E6E6] px-3 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-[4px] bg-[#0075DE] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                R
              </div>
              <span className="font-semibold text-xs text-[#000000] truncate">
                {orgProfile?.organization_name ?? 'Organizer Hub'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#1AAE39]/10 text-[#0E6621] font-semibold border border-[#1AAE39]/30">
                Verified
              </span>
            </div>
          ) : (
            <div className="w-5 h-5 mx-auto rounded-[4px] bg-[#0075DE] text-white flex items-center justify-center font-bold text-xs">
              R
            </div>
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-[4px] hover:bg-[#EAE8E4] text-[#615D59] transition-colors"
            title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Buka Sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Quick Actions */}
        {isSidebarOpen && (
          <div className="p-2 space-y-0.5 border-b border-[#E6E6E6]/60">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2 py-1 rounded-[4px] text-xs text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000] transition-colors"
            >
              <Search size={15} />
              <span className="flex-1">Pencarian Panel</span>
              <kbd className="text-[10px] px-1 py-0.2 bg-white border border-[#E6E6E6] rounded text-[#615D59]">
                ⌘K
              </kbd>
            </Link>
            <div className="flex items-center gap-2 px-2 py-1 rounded-[4px] text-xs text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000] cursor-pointer transition-colors">
              <Bell size={15} />
              <span className="flex-1">Pemberitahuan Pendaftar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1AAE39]" />
            </div>
          </div>
        )}

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          <div>
            {isSidebarOpen && (
              <p className="px-2 pb-1 text-[11px] font-semibold text-[#615D59] uppercase tracking-wider">
                Panel Organizer
              </p>
            )}
            <div className="space-y-0.5">
              {organizerPages.map((item) => {
                const active = pathname === item.href;
                const Icon = active ? item.iconFill : item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-xs transition-colors ${
                      active
                        ? 'bg-[#EAE8E4] text-[#000000] font-semibold'
                        : 'text-[#31302E] hover:bg-[#EFEFEF]'
                    } ${!isSidebarOpen && 'justify-center px-0'}`}
                    title={item.label}
                  >
                    <Icon size={16} className={active ? 'text-[#0075DE]' : 'text-[#615D59]'} />
                    {isSidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

        {/* User Profile Footer */}
        <div className="p-2 border-t border-[#E6E6E6]">
          <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-[5px] hover:bg-[#EAE8E4] transition-colors">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 min-w-0 flex-1 ${!isSidebarOpen && 'justify-center'}`}
            >
              <Avatar
                src={user?.profile_photo ?? undefined}
                name={user?.name ?? 'Admin'}
                size="sm"
                className="w-6 h-6 rounded-[4px] border border-[#E6E6E6] text-xs shrink-0"
              />
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#000000] truncate">
                    {user?.name ?? 'Admin Penyelenggara'}
                  </p>
                  <p className="text-[10px] text-[#0075DE] font-semibold truncate flex items-center gap-1">
                    <span>🏛️</span> Organizer
                  </p>
                </div>
              )}
            </Link>
            {isSidebarOpen && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/auth/login');
                }}
                className="p-1 rounded-[4px] text-[#615D59] hover:text-[#EB5757] hover:bg-[#FBEBEA] transition-colors shrink-0"
                title="Keluar / Ganti Akun"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Organizer Body ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Notion Breadcrumb Bar */}
        <header className="h-12 bg-white/90 backdrop-blur-xs border-b border-[#E6E6E6] sticky top-0 z-30 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#615D59] min-w-0">
            <span className="hover:text-[#000000] cursor-pointer" onClick={() => router.push('/dashboard')}>
              Raih
            </span>
            <span>/</span>
            <span>Pengelola</span>
            <span>/</span>
            <span className="text-[#000000] font-semibold truncate">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/competitions/create"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white transition-colors shadow-2xs h-8"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Buat Lomba Baru</span>
              <span className="sm:hidden">Buat</span>
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/auth/login');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border border-[#E6E6E6] hover:bg-[#FBEBEA] hover:text-[#EB5757] text-[#615D59] transition-colors shadow-2xs h-8"
              title="Keluar ke Portal Login"
            >
              <LogOut size={12} />
              <span>Ganti Akun</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-full border border-[#E6E6E6] bg-white hover:bg-[#F6F5F4] text-[#615D59] hover:text-[#000000] flex items-center justify-center shrink-0 transition-colors"
              title="Menu Navigasi"
              aria-label="Buka Menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </header>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/30 md:hidden flex"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-64 bg-[#F7F6F3] h-full p-4 flex flex-col border-r border-[#E6E6E6]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E6E6]">
                <span className="font-semibold text-xs">Panel Pengelola</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs px-2 py-1 rounded bg-[#E6E6E6]"
                >
                  Tutup
                </button>
              </div>
              <div className="py-3 flex-1 overflow-y-auto space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-[#615D59] uppercase mb-1">
                    Panel Organizer
                  </p>
                  <div className="space-y-0.5">
                    {organizerPages.map((item) => {
                      const active = pathname === item.href;
                      const Icon = active ? item.iconFill : item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
                            active ? 'bg-[#EAE8E4] font-semibold text-[#0075DE]' : 'text-[#31302E]'
                          }`}
                        >
                          <Icon size={15} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E6E6]">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    router.push('/auth/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[5px] text-xs font-medium text-[#EB5757] bg-[#FBEBEA] hover:bg-[#F7DCD9] transition-colors"
                >
                  <LogOut size={14} />
                  <span>Keluar / Ganti Akun</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
