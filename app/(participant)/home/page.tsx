'use client';

// ============================================================
// RAIH — Notion Discovery Workspace
// Design System: Notion (design.md)
// Featuring Notion Document Canvas, Gallery View, Table View & Streamline MingCute Icons
// ============================================================
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Skeleton, Chip } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Heart,
  HeartFill,
  Share2,
  Users,
  Zap,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  Flame,
  ArrowRight,
  CheckCircle,
  Trophy,
  Award,
  Layers,
  FileText,
  DollarSign,
  Star,
  ExternalLink,
  Bell,
  BellFill,
  ChevronLeft,
  ChevronRight,
} from '@/components/ui/icons';
import { competitionRepo, savedCompRepo, registrationRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { Competition, RegistrationWithDetails } from '@/types';
import { mockCategories } from '@/data/mock';

// Notion Sticker Accent Badge Colors (from design.md)
const stickerColors: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-[#62AEF0]/15', text: 'text-[#005BAB]', border: 'border-[#62AEF0]/30' },   // Sky (Tech)
  2: { bg: 'bg-[#D6B6F6]/25', text: 'text-[#391C57]', border: 'border-[#D6B6F6]/50' },   // Purple (Hackathon)
  3: { bg: 'bg-[#FF64C8]/15', text: 'text-[#B8117A]', border: 'border-[#FF64C8]/30' },   // Pink (Design)
  4: { bg: 'bg-[#DD5B00]/15', text: 'text-[#793400]', border: 'border-[#DD5B00]/30' },   // Orange (Business)
  5: { bg: 'bg-[#2A9D99]/15', text: 'text-[#0E5250]', border: 'border-[#2A9D99]/30' },   // Teal (Science)
  6: { bg: 'bg-[#1AAE39]/15', text: 'text-[#0E6621]', border: 'border-[#1AAE39]/30' },   // Green (Writing)
  7: { bg: 'bg-[#523410]/15', text: 'text-[#523410]', border: 'border-[#523410]/30' },   // Brown (Debate)
};

function formatDeadlineTag(dateStr: string): { label: string; urgent: boolean } {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: 'Selesai', urgent: false };
  if (days === 0) return { label: 'Hari Terakhir!', urgent: true };
  if (days <= 3) return { label: `${days} hari lagi`, urgent: true };
  return { label: `${days} hari lagi`, urgent: false };
}

export default function NotionHomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [reminders, setReminders] = useState<Record<number, boolean>>({});
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'gallery' | 'table' | 'timeline'>('gallery');
  const [isLoading, setIsLoading] = useState(true);
  const [copyToast, setCopyToast] = useState(false);
  const activityScrollRef = useRef<HTMLDivElement>(null);

  const scrollActivity = (direction: 'left' | 'right') => {
    if (activityScrollRef.current) {
      const scrollAmount = 440;
      activityScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    async function loadData() {
      const userId = user?.id ?? 1;
      const [all, saved, regs] = await Promise.all([
        competitionRepo.getByStatus('published'),
        savedCompRepo.getByUser(userId),
        registrationRepo.getByUser(userId),
      ]);
      setCompetitions(all);
      setSavedIds(new Set(saved.map((s) => s.competition_id)));
      setUserRegistrations(regs);
      setIsLoading(false);
    }
    loadData();
  }, [user]);

  const toggleReminder = (compId: number, compTitle: string) => {
    setReminders((prev) => {
      const nextState = !prev[compId];
      setReminderToast(
        nextState
          ? `🔔 Notifikasi deadline (H-3 & H-1) diaktifkan untuk "${compTitle}"!`
          : `Pengingat deadline dinonaktifkan.`
      );
      setTimeout(() => setReminderToast(null), 3500);
      return { ...prev, [compId]: nextState };
    });
  };

  const toggleSave = async (e: React.MouseEvent, compId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const userId = user?.id ?? 1;
    if (savedIds.has(compId)) {
      await savedCompRepo.unsave(userId, compId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(compId);
        return next;
      });
    } else {
      await savedCompRepo.save(userId, compId);
      setSavedIds((prev) => new Set(prev).add(compId));
    }
  };

  const handleShare = (e: React.MouseEvent, compId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/competitions/${compId}`);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    }
  };

  const filteredCompetitions = competitions.filter((comp) => {
    const matchesCategory = selectedCategory === null || comp.category_id === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 right-8 z-50 bg-[#000000] text-white text-xs px-3.5 py-2 rounded-md shadow-md flex items-center gap-2"
          >
            <CheckCircle size={14} className="text-[#1AAE39]" />
            <span>Tautan kompetisi berhasil disalin ke clipboard!</span>
          </motion.div>
        )}
        {reminderToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-28 right-8 z-50 bg-[#0075DE] text-white text-xs px-3.5 py-2 rounded-md shadow-md flex items-center gap-2"
          >
            <Bell size={14} className="text-white" />
            <span>{reminderToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Notion Cover / Deep Indigo Night Hero Band ──── */}
      <section className="relative rounded-xl overflow-hidden mb-8 border border-[#E6E6E6] bg-[#213183] text-white shadow-xs">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-white mb-3">
              <Sparkles size={13} className="text-[#62AEF0]" />
              <span>Pusat Kompetisi Mahasiswa & Pelajar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Raih Prestasi Terbesarmu di Sini
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Jelajahi ratusan ajang lomba, hackathon, olimpiade riset, dan kompetisi bisnis dari kampus serta institusi terkemuka di seluruh Indonesia.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => router.push('/competitions/create')}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-sm inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trophy size={14} />
              <span>Publikasikan Lomba</span>
            </button>
            <button
              onClick={() => router.push('/teammates')}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-full bg-white/15 hover:bg-white/20 text-white inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Users size={14} />
              <span>Cari Rekan Tim</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Aktivitas Lomba & Deadline Terdekat (Horizontal Scrolling) ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#EDF6EF] text-[#0F7B6C] flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
              ⏱️
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#000000] leading-tight">
                Aktivitas Lomba & Deadline Terdekat
              </h2>
              <p className="text-xs text-[#615D59] mt-0.5">
                {userRegistrations.length > 0 ? `${userRegistrations.length} Lomba Diikuti` : 'Jadwal Paling Mendesak'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Horizontal Scroll Navigation Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollActivity('left')}
                className="w-7 h-7 rounded-full border border-[#E6E6E6] bg-white hover:bg-[#F6F5F4] text-[#615D59] hover:text-[#000000] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Geser ke kiri"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => scrollActivity('right')}
                className="w-7 h-7 rounded-full border border-[#E6E6E6] bg-white hover:bg-[#F6F5F4] text-[#615D59] hover:text-[#000000] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Geser ke kanan"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <Link
              href="/activity"
              className="text-xs text-[#0075DE] hover:underline font-medium inline-flex items-center gap-1 ml-1"
            >
              <span className="hidden sm:inline">Semua Aktivitas</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {userRegistrations.length > 0 ? (
          <div
            ref={activityScrollRef}
            className="flex gap-3.5 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {userRegistrations.map((reg) => {
              const comp = reg.competition;
              if (!comp) return null;
              const deadline = formatDeadlineTag(comp.registration_deadline);
              const isReminded = reminders[comp.id] ?? true;

              return (
                <div
                  key={reg.id}
                  className="w-[310px] sm:w-[380px] md:w-[420px] shrink-0 snap-start rounded-xl bg-white border border-[#E6E6E6] p-4 shadow-2xs hover:border-[#0075DE]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#EDF6EF] text-[#0F7B6C] border border-[#0F7B6C]/20">
                          ✓ Terdaftar Resmi
                        </span>
                        <span className="text-[10px] text-[#615D59] font-medium">
                          {mockCategories.find((c) => c.id === comp.category_id)?.name ?? 'Kompetisi'}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border flex items-center gap-1 ${
                          deadline.urgent
                            ? 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30'
                            : 'bg-[#F6F5F4] text-[#31302E] border-[#E6E6E6]'
                        }`}
                      >
                        <Clock size={11} />
                        <span>{deadline.label}</span>
                      </span>
                    </div>

                    <h3
                      onClick={() => router.push(`/competitions/${comp.id}`)}
                      className="text-sm font-bold text-[#000000] hover:text-[#0075DE] cursor-pointer line-clamp-1 transition-colors"
                    >
                      {comp.title}
                    </h3>
                    <p className="text-[11px] text-[#615D59] mt-0.5 line-clamp-1">
                      Penyelenggara Resmi Terverifikasi
                    </p>

                    {/* Progress stage tracker */}
                    <div className="mt-3 p-2.5 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-[#31302E]">
                        <span className="font-semibold flex items-center gap-1">
                          <CheckCircle size={12} className="text-[#1AAE39]" />
                          Tahap 1: Pengumpulan Proposal & Berkas
                        </span>
                        <span className="text-[10px] font-bold text-[#0075DE]">Aktif</span>
                      </div>
                      <div className="w-full bg-[#E6E6E6] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#0075DE] h-full rounded-full w-2/3" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#E6E6E6] flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleReminder(comp.id, comp.title)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 transition-colors ${
                        isReminded
                          ? 'bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/30'
                          : 'bg-[#F6F5F4] text-[#615D59] hover:bg-[#EAE8E4]'
                      }`}
                      title="Klik untuk aktifkan/nonaktifkan pengingat tenggat waktu"
                    >
                      {isReminded ? <BellFill size={12} className="text-[#0075DE]" /> : <Bell size={12} />}
                      <span className="text-[11px]">{isReminded ? 'Pengingat Aktif' : 'Pasang Pengingat'}</span>
                    </button>

                    <button
                      onClick={() => router.push(`/competitions/${comp.id}`)}
                      className="text-xs font-semibold text-[#0075DE] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Checklist & Timeline</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Recommended Upcoming Deadlines if user has no registrations yet */
          <div
            ref={activityScrollRef}
            className="flex gap-3.5 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {competitions.slice(0, 6).map((comp) => {
              const deadline = formatDeadlineTag(comp.registration_deadline);
              const isReminded = reminders[comp.id] ?? false;

              return (
                <div
                  key={comp.id}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start rounded-xl bg-white border border-[#E6E6E6] p-3.5 shadow-2xs hover:border-[#0075DE]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#EBF4FC] text-[#0075DE]">
                        {mockCategories.find((c) => c.id === comp.category_id)?.name ?? 'Lomba'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${
                          deadline.urgent
                            ? 'bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/30'
                            : 'bg-[#F6F5F4] text-[#615D59]'
                        }`}
                      >
                        {deadline.label}
                      </span>
                    </div>
                    <h3
                      onClick={() => router.push(`/competitions/${comp.id}`)}
                      className="text-xs font-bold text-[#000000] hover:text-[#0075DE] cursor-pointer line-clamp-1"
                    >
                      {comp.title}
                    </h3>
                    <p className="text-[10px] text-[#615D59] mt-0.5 line-clamp-1">
                      Penyelenggara Terverifikasi
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E6E6E6] flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleReminder(comp.id, comp.title)}
                      className="text-[10px] text-[#615D59] hover:text-[#0075DE] inline-flex items-center gap-1"
                    >
                      {isReminded ? <BellFill size={11} className="text-[#0075DE]" /> : <Bell size={11} />}
                      <span>{isReminded ? 'Pengingat Aktif' : 'Pasang Pengingat'}</span>
                    </button>
                    <Link
                      href={`/competitions/${comp.id}/register`}
                      className="text-[11px] font-semibold text-[#0075DE] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Daftar</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 2. Notion Document Title & Page Callout ────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-xl shadow-2xs">
            🏆
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#000000]">
              Database Kompetisi
            </h2>
            <p className="text-xs text-[#615D59]">
              Diperbarui secara berkala oleh penyelenggara terverifikasi
            </p>
          </div>
        </div>

        {/* Notion Callout Box */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] flex items-start gap-3 text-xs text-[#31302E] shadow-2xs mt-3">
          <span className="text-base leading-none">💡</span>
          <div className="flex-1 leading-relaxed">
            <strong className="text-[#000000]">Ruang Kolaborasi:</strong> Gunakan filter kategori di bawah atau beralih antara tampilan <strong>Galeri</strong>, <strong>Tabel</strong>, dan <strong>Timeline</strong> untuk menyesuaikan alur kerjamu.{' '}
            <Link href="/saved" className="text-[#0075DE] hover:underline font-medium">
              Lihat kompetisi yang sudah disimpan &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. Notion Database View Tabs & Filter Toolbar ──── */}
      <div className="border-b border-[#E6E6E6] mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveView('gallery')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                activeView === 'gallery'
                  ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
                  : 'text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000]'
              }`}
            >
              <Layers size={14} className={activeView === 'gallery' ? 'text-[#0075DE]' : 'text-[#615D59]'} />
              <span>Galeri</span>
            </button>

            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                activeView === 'table'
                  ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
                  : 'text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000]'
              }`}
            >
              <FileText size={14} className={activeView === 'table' ? 'text-[#0075DE]' : 'text-[#615D59]'} />
              <span>Tabel</span>
            </button>

            <button
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                activeView === 'timeline'
                  ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
                  : 'text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000]'
              }`}
            >
              <Clock size={14} className={activeView === 'timeline' ? 'text-[#0075DE]' : 'text-[#615D59]'} />
              <span>Timeline</span>
            </button>
          </div>

          {/* Quick Search inside database */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#615D59]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam database..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000] placeholder:text-[#A39E98]"
              />
            </div>

            <span className="text-xs text-[#615D59] whitespace-nowrap hidden sm:inline">
              {filteredCompetitions.length} item
            </span>
          </div>
        </div>

        {/* Notion Category Filter Pills (Sticker Palette) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center ${
              selectedCategory === null
                ? 'bg-[#000000] text-white font-semibold'
                : 'bg-white border border-[#E6E6E6] text-[#31302E] hover:bg-[#EAE8E4]'
            }`}
          >
            Semua ({competitions.length})
          </button>

          {mockCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const sticker = stickerColors[cat.id] ?? { bg: 'bg-[#62AEF0]/15', text: 'text-[#005BAB]', border: 'border-[#62AEF0]/30' };
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  isSelected
                    ? `${sticker.bg} ${sticker.text} ${sticker.border} font-semibold ring-1 ring-[#0075DE]/40`
                    : 'bg-white border-[#E6E6E6] text-[#31302E] hover:bg-[#EAE8E4]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Main Database Views ─────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-lg bg-white border border-[#E6E6E6] p-4 space-y-3">
              <Skeleton className="h-28 rounded-md bg-[#EAE8E4]" />
              <Skeleton className="h-4 w-3/4 rounded bg-[#EAE8E4]" />
              <Skeleton className="h-3 w-1/2 rounded bg-[#EAE8E4]" />
            </div>
          ))}
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-white border border-[#E6E6E6] my-6">
          <FileText size={32} className="mx-auto text-[#615D59] mb-3" />
          <h3 className="text-sm font-semibold text-[#000000]">Tidak ada kompetisi ditemukan</h3>
          <p className="text-xs text-[#615D59] mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter kategori.</p>
          <button
            onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
            className="mt-4 px-3 py-1.5 text-xs rounded-full bg-[#0075DE] text-white font-medium"
          >
            Reset Filter
          </button>
        </div>
      ) : activeView === 'gallery' ? (
        /* ── Notion Gallery Card View ─────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompetitions.map((comp) => {
            const isSaved = savedIds.has(comp.id);
            const deadline = formatDeadlineTag(comp.registration_deadline);
            const sticker = stickerColors[comp.category_id ?? 1] ?? { bg: 'bg-[#62AEF0]/15', text: 'text-[#005BAB]', border: 'border-[#62AEF0]/30' };
            const catName = mockCategories.find((c) => c.id === comp.category_id)?.name ?? 'Umum';

            return (
              <div
                key={comp.id}
                onClick={() => router.push(`/competitions/${comp.id}`)}
                className="group bg-white rounded-lg border border-[#E6E6E6] hover:border-[#B3D8FA] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all cursor-pointer flex flex-col overflow-hidden"
              >
                {/* Banner / Poster Preview */}
                <div className="h-32 bg-[#F6F5F4] relative border-b border-[#E6E6E6] overflow-hidden">
                  {comp.banner_image ? (
                    <img
                      src={comp.banner_image}
                      alt={comp.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#EAE8E4] text-[#615D59]">
                      <Trophy size={32} className="text-[#A39E98]" />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sticker.bg} ${sticker.text} ${sticker.border} backdrop-blur-xs`}>
                      {catName}
                    </span>

                    <button
                      onClick={(e) => toggleSave(e, comp.id)}
                      className={`p-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#E6E6E6] hover:scale-110 transition-transform ${
                        isSaved ? 'text-[#DD5B00]' : 'text-[#615D59] hover:text-[#000000]'
                      }`}
                      title={isSaved ? 'Hapus simpanan' : 'Simpan lomba'}
                    >
                      {isSaved ? <HeartFill size={14} className="text-[#DD5B00]" /> : <Heart size={14} />}
                    </button>
                  </div>

                  {/* Deadline Indicator */}
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] shadow-2xs ${
                        deadline.urgent
                          ? 'bg-[#DD5B00] text-white'
                          : 'bg-white/95 text-[#31302E] border border-[#E6E6E6]'
                      }`}
                    >
                      {deadline.label}
                    </span>
                  </div>
                </div>

                {/* Card Content & Notion Properties */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[#000000] line-clamp-2 leading-snug group-hover:text-[#0075DE] transition-colors mb-2">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-[#615D59] line-clamp-2 mb-3">
                      {comp.description}
                    </p>
                  </div>

                  {/* Notion-style Metadata Rows */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E6E6E6]/60 text-xs text-[#615D59]">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px]">
                        <DollarSign size={13} className="text-[#1AAE39]" />
                        <span>Hadiah:</span>
                      </span>
                      <span className="font-semibold text-[#000000]">
                        {comp.prize_info ? comp.prize_info : 'Sertifikat'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px]">
                        <Users size={13} className="text-[#62AEF0]" />
                        <span>Format:</span>
                      </span>
                      <span className="text-[#31302E] capitalize">
                        {comp.comp_type === 'team' ? 'Tim' : 'Individu'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#A39E98] truncate max-w-[130px]">
                        Penyelenggara Terverifikasi
                      </span>
                      <button
                        onClick={(e) => handleShare(e, comp.id)}
                        className="p-1 rounded text-[#615D59] hover:text-[#000000] hover:bg-[#F6F5F4] transition-colors"
                        title="Bagikan Tautan"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeView === 'table' ? (
        /* ── Notion Table View ────────────────────────────── */
        <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F6F5F4] border-b border-[#E6E6E6] text-[#615D59] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Nama Kompetisi</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Deadline</th>
                <th className="py-2.5 px-3">Biaya</th>
                <th className="py-2.5 px-3">Hadiah</th>
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E6]">
              {filteredCompetitions.map((comp) => {
                const deadline = formatDeadlineTag(comp.registration_deadline);
                const sticker = stickerColors[comp.category_id ?? 1] ?? { bg: 'bg-[#62AEF0]/15', text: 'text-[#005BAB]', border: 'border-[#62AEF0]/30' };
                const catName = mockCategories.find((c) => c.id === comp.category_id)?.name ?? 'Umum';
                const isSaved = savedIds.has(comp.id);

                return (
                  <tr
                    key={comp.id}
                    onClick={() => router.push(`/competitions/${comp.id}`)}
                    className="hover:bg-[#F6F5F4]/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-[#000000] max-w-xs truncate">
                      {comp.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sticker.bg} ${sticker.text} ${sticker.border}`}>
                        {catName}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`text-[11px] ${deadline.urgent ? 'text-[#DD5B00] font-bold' : 'text-[#31302E]'}`}>
                        {deadline.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {comp.registration_fee === 0 ? (
                        <span className="text-[#1AAE39] font-medium">Gratis</span>
                      ) : (
                        `Rp ${comp.registration_fee.toLocaleString('id-ID')}`
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#000000] whitespace-nowrap">
                      {comp.prize_info ? comp.prize_info : '-'}
                    </td>
                    <td className="py-3 px-3 capitalize text-[#615D59]">
                      {comp.comp_type === 'team' ? 'Tim' : 'Individu'}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => toggleSave(e, comp.id)}
                        className={`p-1 rounded mr-1 hover:bg-[#EAE8E4] ${isSaved ? 'text-[#DD5B00]' : 'text-[#615D59]'}`}
                      >
                        {isSaved ? <HeartFill size={14} className="text-[#DD5B00]" /> : <Heart size={14} />}
                      </button>
                      <button
                        onClick={(e) => handleShare(e, comp.id)}
                        className="p-1 rounded text-[#615D59] hover:bg-[#EAE8E4]"
                      >
                        <Share2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Notion Timeline View ─────────────────────────── */
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6E6E6]">
            <Clock size={16} className="text-[#0075DE]" />
            <span className="text-xs font-semibold text-[#000000]">Kalender Urutan Batas Waktu</span>
          </div>

          <div className="space-y-3">
            {filteredCompetitions
              .slice()
              .sort((a, b) => new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime())
              .map((comp) => {
                const deadline = formatDeadlineTag(comp.registration_deadline);
                const dateStr = new Date(comp.registration_deadline).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={comp.id}
                    onClick={() => router.push(`/competitions/${comp.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border border-[#E6E6E6] hover:border-[#0075DE] hover:bg-[#F6F5F4]/40 cursor-pointer transition-colors gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#EBF4FC] text-[#0075DE] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <Calendar size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#000000]">{comp.title}</p>
                        <p className="text-[11px] text-[#615D59]">Penyelenggara Terverifikasi</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-[11px] text-[#615D59]">{dateStr}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${deadline.urgent ? 'bg-[#DD5B00] text-white' : 'bg-[#EAE8E4] text-[#31302E]'}`}>
                        {deadline.label}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
