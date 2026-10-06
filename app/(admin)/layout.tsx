'use client';

// ============================================================
// RAIH — Notion Platform Admin Layout
// Role: Administrator (Superadmin)
// Design System: Notion (design.md)
// ============================================================
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar } from '@heroui/react';
import {
  Shield,
  LayoutDashboard,
  CheckCircle,
  Users,
  Trophy,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Home,
  LogOut,
  ExternalLink,
} from '@/components/ui/icons';
import { useAuthStore } from '@/lib/stores/auth';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard Platform', icon: LayoutDashboard },
];

export default function NotionAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || !user)) {
      router.replace('/auth/login');
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

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
              <div className="w-5 h-5 rounded-[4px] bg-[#DD5B00] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                🛡️
              </div>
              <span className="font-semibold text-xs text-[#000000] truncate">
                Admin Platform
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#FDF5E8] text-[#DD5B00] font-bold border border-[#DD5B00]/30">
                Superadmin
              </span>
            </div>
          ) : (
            <div className="w-5 h-5 mx-auto rounded-[4px] bg-[#DD5B00] text-white flex items-center justify-center font-bold text-xs">
              🛡️
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

        {/* Navigation Items */}
        <div className="p-2 space-y-4 flex-1 overflow-y-auto">
          <div>
            {isSidebarOpen && (
              <p className="px-2 pb-1 text-[11px] font-semibold text-[#615D59] uppercase tracking-wider">
                Menu Administrator
              </p>
            )}
            <div className="space-y-0.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
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
                    <Icon size={16} className={active ? 'text-[#DD5B00]' : 'text-[#615D59]'} />
                    {isSidebarOpen && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Profile Bar */}
        <div className="p-2 border-t border-[#E6E6E6]">
          <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-[5px] hover:bg-[#EAE8E4] transition-colors">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 rounded-[4px] bg-[#DD5B00] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                A
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#000000] truncate">
                    {user?.name ?? 'Admin Raih'}
                  </p>
                  <p className="text-[10px] text-[#DD5B00] font-medium truncate">
                    🛡️ Administrator
                  </p>
                </div>
              )}
            </div>
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

      {/* ── Main Workspace Body ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Notion Document Breadcrumb & Chrome */}
        <header className="h-12 bg-white/90 backdrop-blur-xs border-b border-[#E6E6E6] sticky top-0 z-30 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-[4px] hover:bg-[#F6F5F4] text-[#615D59]"
            >
              <SlidersHorizontal size={16} />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-[#615D59]">
              <span className="hover:text-[#000000] cursor-pointer" onClick={() => router.push('/admin')}>
                Raih
              </span>
              <span>/</span>
              <span className="text-[#000000] font-semibold truncate">
                Panel Admin
              </span>
            </div>
          </div>

          {/* Role Status Tag */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-[4px] bg-[#FDF5E8] text-[#DD5B00] border border-[#DD5B00]/30 flex items-center gap-1">
              <Shield size={12} />
              <span>Role: Administrator</span>
            </span>

            <button
              onClick={() => {
                logout();
                router.push('/auth/login');
              }}
              className="p-1.5 rounded-[4px] text-[#615D59] hover:text-[#EB5757] hover:bg-[#FBEBEA] transition-colors"
              title="Keluar"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
