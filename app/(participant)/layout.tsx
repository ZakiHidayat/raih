'use client';

// ============================================================
// RAIH — Notion Workspace Layout
// Modeled after Notion's document-first workspace shell (design.md)
// ============================================================
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Button } from '@heroui/react';
import {
  Home,
  HomeFill,
  Search,
  SearchFill,
  Heart,
  HeartFill,
  Ticket,
  TicketFill,
  User,
  UserFill,
  Users,
  UsersFill,
  LayoutDashboard,
  BarChart2,
  Plus,
  Settings,
  Bell,
  BellFill,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Star,
  StarFill,
  Share2,
  Sparkles,
  LogOut,
  SlidersHorizontal,
  Shield,
  Clock,
  X,
  Menu,
} from '@/components/ui/icons';
import { useAuthStore } from '@/lib/stores/auth';

const workspacePages = [
  { href: '/home', icon: Home, iconFill: HomeFill, label: 'Eksplor Kompetisi', badge: 'Utama' },
  { href: '/search', icon: Search, iconFill: SearchFill, label: 'Cari & Filter', badge: null },
  { href: '/saved', icon: Heart, iconFill: HeartFill, label: 'Lomba Disimpan', badge: null },
  { href: '/activity', icon: Ticket, iconFill: TicketFill, label: 'Aktivitas Saya', badge: null },
  { href: '/teammates', icon: Users, iconFill: UsersFill, label: 'Cari Rekan Tim', badge: 'Match' },
  { href: '/profile', icon: User, iconFill: UserFill, label: 'Profil & Prestasi', badge: null },
];

interface DeadlineNotification {
  id: string;
  type: 'deadline' | 'chat' | 'system';
  title: string;
  subtitle: string;
  dateStr: string;
  urgentBadge: string;
  urgentColor: string;
  link: string;
  read: boolean;
}

const initialNotifications: DeadlineNotification[] = [
  {
    id: 'n1',
    type: 'deadline',
    title: 'Batas Pengumpulan Berkas Proposal',
    subtitle: 'GEMASTIK XVII 2026 — Desain Pengalaman Pengguna (UX)',
    dateStr: 'Tenggat: 12 Oktober 2026 (Sisa 2 Hari)',
    urgentBadge: '🔴 H-2 Kritis',
    urgentColor: 'bg-rose-50 text-rose-600 border-rose-200',
    link: '/competitions/1',
    read: false,
  },
  {
    id: 'n2',
    type: 'deadline',
    title: 'Batas Akhir Registrasi Gelombang 1',
    subtitle: 'Astra Innovate Tech Challenge 2026',
    dateStr: 'Tenggat: 15 Oktober 2026 (Sisa 5 Hari)',
    urgentBadge: '🟡 H-5 Segera',
    urgentColor: 'bg-amber-50 text-amber-700 border-amber-200',
    link: '/competitions/3',
    read: false,
  },
  {
    id: 'n3',
    type: 'chat',
    title: 'Undangan Diskusi Calon Rekan Tim',
    subtitle: 'Sarah Nadira mengajak Anda berdiskusi untuk Hackathon Web3',
    dateStr: 'Baru saja • Dari menu Cari Rekan Tim',
    urgentBadge: '💬 Chat Baru',
    urgentColor: 'bg-[#EBF4FC] text-[#0075DE] border-[#0075DE]/20',
    link: '/teammates',
    read: false,
  },
  {
    id: 'n4',
    type: 'deadline',
    title: 'Pengumuman Lolos Tahap Seleksi Berkas',
    subtitle: 'National Business Case Competition FEB UI',
    dateStr: 'Tenggat: 20 Oktober 2026 (Sisa 10 Hari)',
    urgentBadge: '🟢 H-10 Mendatang',
    urgentColor: 'bg-[#EDF6EF] text-[#0F7B6C] border-[#0F7B6C]/20',
    link: '/competitions/2',
    read: true,
  },
];

export default function NotionParticipantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DeadlineNotification[]>(initialNotifications);
  const [notifFilter, setNotifFilter] = useState<'all' | 'deadline'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: DeadlineNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setIsNotificationsOpen(false);
    router.push(item.link);
  };

  const filteredNotifs = notifications.filter((n) =>
    notifFilter === 'deadline' ? n.type === 'deadline' : true
  );

  const getCurrentPageTitle = () => {
    if (pathname.startsWith('/home')) return 'Eksplor Kompetisi';
    if (pathname.startsWith('/search')) return 'Pencarian & Database';
    if (pathname.startsWith('/saved')) return 'Kompetisi Tersimpan';
    if (pathname.startsWith('/activity')) return 'Aktivitas & Pendaftaran';
    if (pathname.startsWith('/teammates')) return 'Rekan Tim & Matchmaking';
    if (pathname.startsWith('/profile')) return 'Profil & Portofolio';
    if (pathname.startsWith('/competitions')) return 'Detail Kompetisi';
    return 'Halaman';
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
                Raih
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

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          <div>
            <div className="space-y-0.5">
              {workspacePages.map((item) => {
                const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
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
                    {isSidebarOpen && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {isSidebarOpen && item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EBF4FC] text-[#0075DE] font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom User Profile Tile */}
        <div className="p-2 border-t border-[#E6E6E6] space-y-1">
          <Link
            href="/profile"
            className={`flex items-center gap-2 p-1.5 rounded-[5px] hover:bg-[#EAE8E4] transition-colors ${
              !isSidebarOpen && 'justify-center'
            }`}
            title="Lihat Profil & Pengaturan"
          >
            <Avatar
              src={user?.profile_photo ?? undefined}
              name={user?.name ?? 'Pengguna'}
              size="sm"
              className="w-6 h-6 rounded-[4px] border border-[#E6E6E6] text-xs shrink-0"
            />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#000000] truncate">
                  {user?.name ?? 'Tamu'}
                </p>
                <p className="text-[10px] text-[#615D59] truncate flex items-center gap-1">
                  <span>🎓</span> Peserta
                </p>
              </div>
            )}
          </Link>

          {isSidebarOpen ? (
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/auth/login');
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-xs font-medium text-[#615D59] hover:text-[#EB5757] hover:bg-[#FBEBEA] transition-colors"
              title="Keluar / Ganti Akun"
            >
              <LogOut size={13} />
              <span className="flex-1 text-left">Ganti Akun</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/auth/login');
              }}
              className="w-full flex items-center justify-center p-1.5 rounded-[5px] text-[#615D59] hover:text-[#EB5757] hover:bg-[#FBEBEA] transition-colors"
              title="Keluar / Ganti Akun"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Workspace Body ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Notion Document Breadcrumb & Chrome */}
        <header className="h-12 bg-white/90 backdrop-blur-xs border-b border-[#E6E6E6] sticky top-0 z-30 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {/* Notion Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-[#615D59]">
              <span className="hover:text-[#000000] cursor-pointer" onClick={() => router.push('/home')}>
                Raih
              </span>
              <span>/</span>
              <span className="text-[#000000] font-semibold truncate">
                {getCurrentPageTitle()}
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/search')}
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-colors h-8 ${
                pathname === '/search'
                  ? 'border-[#0075DE]/40 bg-[#EBF4FC] text-[#0075DE] font-semibold'
                  : 'border-[#E6E6E6] hover:bg-[#F6F5F4] text-[#31302E]'
              }`}
            >
              {pathname === '/search' ? (
                <SearchFill size={13} className="text-[#0075DE]" />
              ) : (
                <Search size={13} className="text-[#615D59]" />
              )}
              <span>Cari</span>
            </button>

            {/* Notification Bell Button in Header */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                isNotificationsOpen
                  ? 'bg-[#EAE8E4] border-[#0075DE]/40 text-[#0075DE]'
                  : 'border-[#E6E6E6] bg-white hover:bg-[#F6F5F4] text-[#615D59] hover:text-[#000000]'
              }`}
              title="Pemberitahuan & Deadline"
            >
              {isNotificationsOpen ? (
                <BellFill size={14} className="text-[#0075DE]" />
              ) : (
                <Bell size={14} />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-4 px-1 rounded-full bg-[#0075DE] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-2xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Button (Standard 3-bar hamburger on right) */}
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

        {/* ── Notion Notification & Deadline Drawer/Dropdown ── */}
        {isNotificationsOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/10"
              onClick={() => setIsNotificationsOpen(false)}
            />
            <div className="fixed top-14 right-4 sm:right-6 w-[340px] sm:w-[380px] max-h-[85vh] bg-white border border-[#E6E6E6] rounded-xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in duration-150">
              {/* Header */}
              <div className="p-3.5 border-b border-[#E6E6E6] flex items-center justify-between bg-[#F7F6F3]">
                <div className="flex items-center gap-2">
                  <BellFill size={15} className="text-[#0075DE]" />
                  <span className="text-xs font-bold text-[#000000]">Pemberitahuan & Deadline</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#0075DE] text-white">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10px] text-[#615D59] hover:text-[#0075DE] hover:underline"
                  >
                    Tandai dibaca
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 rounded-[4px] text-[#9B9A97] hover:text-[#000000] hover:bg-[#EAE8E4]"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#E6E6E6] bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setNotifFilter('all')}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors ${
                    notifFilter === 'all'
                      ? 'bg-[#EAE8E4] text-[#000000] font-semibold'
                      : 'text-[#615D59] hover:bg-[#F6F5F4]'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('deadline')}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors ${
                    notifFilter === 'deadline'
                      ? 'bg-[#EAE8E4] text-[#000000] font-semibold'
                      : 'text-[#615D59] hover:bg-[#F6F5F4]'
                  }`}
                >
                  Tenggat Waktu ({notifications.filter((n) => n.type === 'deadline').length})
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#E6E6E6] max-h-[380px]">
                {filteredNotifs.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3 transition-colors cursor-pointer text-left hover:bg-[#F6F5F4] ${
                      !item.read ? 'bg-[#EBF4FC]/25' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${item.urgentColor}`}>
                        {item.urgentBadge}
                      </span>
                      <span className="text-[10px] text-[#9B9A97]">
                        {!item.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0075DE] mr-1" />}
                        {item.type === 'deadline' ? 'Deadline' : 'Pesan'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#000000] line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-[#615D59] mt-0.5 line-clamp-1">{item.subtitle}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#9B9A97]">
                      <span className="flex items-center gap-1 font-medium text-[#31302E]">
                        <Clock size={11} className="text-[#0075DE]" />
                        {item.dateStr}
                      </span>
                      <span className="text-[#0075DE] font-semibold hover:underline flex items-center gap-0.5">
                        Buka
                        <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-[#F7F6F3] border-t border-[#E6E6E6] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    router.push('/activity');
                  }}
                  className="w-full text-center text-xs font-semibold text-[#0075DE] hover:underline"
                >
                  Buka Riwayat & Aktivitas Lengkap →
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mobile Navigation Drawer Overlay */}
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
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[4px] bg-[#0075DE] text-white flex items-center justify-center font-bold text-xs">
                    R
                  </div>
                  <span className="font-semibold text-xs">Raih</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs px-2 py-1 rounded bg-[#E6E6E6]"
                >
                  Tutup
                </button>
              </div>

              <div className="py-3 flex-1 overflow-y-auto space-y-4">
                <div>
                  <div className="space-y-0.5">
                    {workspacePages.map((item) => {
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

        {/* Workspace Canvas & Content View */}
        <main className="flex-1 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
