'use client';

// ============================================================
// RAIH — Notion Saved Competitions
// Design System: Notion (design.md)
// ============================================================
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, ArrowRight, Zap, Flame, Trophy, Trash, DollarSign, Clock } from '@/components/ui/icons';
import { savedCompRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import { mockCategories } from '@/data/mock';
import type { SavedCompetition, Competition } from '@/types';

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function NotionSavedPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [saved, setSaved] = useState<(SavedCompetition & { competition: Competition })[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'closed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    savedCompRepo.getByUser(user?.id ?? 1).then((data) => {
      setSaved(data);
      setIsLoading(false);
    });
  }, [user]);

  const handleRemove = async (e: React.MouseEvent, competitionId: number) => {
    e.preventDefault();
    e.stopPropagation();
    await savedCompRepo.unsave(user?.id ?? 1, competitionId);
    setSaved((prev) => prev.filter((s) => s.competition_id !== competitionId));
  };

  const filtered = saved.filter((item) => {
    const isPast = new Date(item.competition.registration_deadline).getTime() < Date.now();
    if (filterTab === 'upcoming') return !isPast;
    if (filterTab === 'closed') return isPast;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
      {/* ── Document Page Header ──────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-[#615D59] mb-2">
          <Link href="/home" className="hover:text-[#000000]">Raih</Link>
          <span>/</span>
          <span className="text-[#000000] font-semibold">Tersimpan</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-xl shadow-2xs">
            ❤️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
              Kompetisi Tersimpan
            </h1>
            <p className="text-xs text-[#615D59]">
              Daftar pantauan lomba favorit untuk persiapan dan registrasi tepat waktu.
            </p>
          </div>
        </div>
      </div>

      {/* ── Notion Filter Tabs ────────────────────────────── */}
      <div className="flex items-center gap-2 pb-3 mb-5 border-b border-[#E6E6E6] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            filterTab === 'all'
              ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
              : 'text-[#615D59] hover:bg-[#EAE8E4]'
          }`}
        >
          Semua ({saved.length})
        </button>

        <button
          onClick={() => setFilterTab('upcoming')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            filterTab === 'upcoming'
              ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
              : 'text-[#615D59] hover:bg-[#EAE8E4]'
          }`}
        >
          Masih Dibuka
        </button>

        <button
          onClick={() => setFilterTab('closed')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            filterTab === 'closed'
              ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
              : 'text-[#615D59] hover:bg-[#EAE8E4]'
          }`}
        >
          Ditutup
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-[#E6E6E6] p-4 space-y-2">
              <Skeleton className="h-4 w-1/3 rounded bg-[#EAE8E4]" />
              <Skeleton className="h-3 w-2/3 rounded bg-[#EAE8E4]" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-[#E6E6E6]">
          <Heart size={32} className="mx-auto text-[#615D59] mb-2" />
          <p className="text-sm font-semibold text-[#000000]">Belum ada kompetisi yang disimpan</p>
          <p className="text-xs text-[#615D59] mt-1">Simpan lomba dari halaman Eksplor untuk dipantau di sini.</p>
          <button
            onClick={() => router.push('/home')}
            className="mt-4 px-4 py-1.5 text-xs font-semibold rounded-full bg-[#0075DE] text-white"
          >
            Cari Kompetisi
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const comp = item.competition;
            const isClosed = new Date(comp.registration_deadline).getTime() < Date.now();

            return (
              <div
                key={comp.id}
                onClick={() => router.push(`/competitions/${comp.id}`)}
                className="bg-white rounded-xl border border-[#E6E6E6] hover:border-[#0075DE] p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EBF4FC] text-[#0075DE] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F6F5F4] text-[#31302E] border border-[#E6E6E6]">
                        {mockCategories.find((c) => c.id === comp.category_id)?.name ?? 'Umum'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] ${isClosed ? 'bg-[#EAE8E4] text-[#615D59]' : 'bg-[#1AAE39]/15 text-[#0E6621]'}`}>
                        {isClosed ? 'Pendaftaran Selesai' : 'Terbuka'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-[#000000]">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-[#615D59] line-clamp-1 mt-0.5">
                      Batas Pendaftaran: {formatEventDate(comp.registration_deadline)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E6E6]/60">
                  <button
                    onClick={(e) => handleRemove(e, comp.id)}
                    className="p-2 rounded-md hover:bg-[#EAE8E4] text-[#615D59] hover:text-[#DD5B00] transition-colors"
                    title="Hapus dari simpanan"
                  >
                    <Trash size={15} />
                  </button>

                  <button className="px-4 py-1.5 rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-semibold">
                    Lihat Lomba
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
