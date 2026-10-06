'use client';

// ============================================================
// RAIH — Notion Search & Database Filter
// Design System: Notion (design.md)
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton, Chip } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SearchFill,
  ArrowLeft,
  X,
  Filter,
  FilterFill,
  CheckCircleFill,
  Clock,
  Zap,
  Users,
  Star,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  Trophy,
} from '@/components/ui/icons';
import { competitionRepo, searchHistoryRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import { mockCategories } from '@/data/mock';
import type { Competition, CompetitionFilters } from '@/lib/repositories/interfaces';

function formatDeadline(dateStr: string) {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'Ditutup';
  if (days === 0) return 'Hari ini!';
  return `${days} hari lagi`;
}

function isUrgent(dateStr: string) {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return days >= 0 && days <= 3;
}

export default function NotionSearchPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Competition[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [onlyFree, setOnlyFree] = useState(false);

  useEffect(() => {
    if (user) {
      searchHistoryRepo.getByUser(user.id).then((h) => setHistory(h.map((s) => s.keyword)));
    }
  }, [user]);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim() && !selectedCategory && !selectedType && !onlyFree) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setIsLoading(true);
      setHasSearched(true);
      const f: CompetitionFilters = {};
      if (selectedCategory) f.category_id = Number(selectedCategory);
      if (selectedType) (f as any).comp_type = selectedType;
      if (onlyFree) f.is_free = true;

      const res = await competitionRepo.search(q.trim(), f);
      setResults(res);
      if (q.trim() && user) {
        await searchHistoryRepo.add(user.id, q.trim());
        const h = await searchHistoryRepo.getByUser(user.id);
        setHistory(h.map((s) => s.keyword));
      }
      setIsLoading(false);
    },
    [selectedCategory, selectedType, onlyFree, user]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch(query);
  };

  const applyHistory = (keyword: string) => {
    setQuery(keyword);
    doSearch(keyword);
  };

  const clearHistory = async () => {
    if (user) await searchHistoryRepo.clear(user.id);
    setHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
      {/* ── Document Page Header ──────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-[#615D59] mb-2">
          <Link href="/home" className="hover:text-[#000000]">Raih</Link>
          <span>/</span>
          <span className="text-[#000000] font-semibold">Pencarian</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-xl shadow-2xs">
            🔍
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
              Cari & Filter Kompetisi
            </h1>
            <p className="text-xs text-[#615D59]">
              Temukan ajang kompetisi berdasarkan nama, bidang, format, dan biaya pendaftaran.
            </p>
          </div>
        </div>
      </div>

      {/* ── Notion Search Bar & Filter Controls ────────────── */}
      <div className="bg-white rounded-xl border border-[#E6E6E6] p-4 shadow-2xs mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            {query ? (
              <SearchFill size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0075DE]" />
            ) : (
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#615D59]" />
            )}
            <input
              id="search-input"
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik kata kunci (contoh: Hackathon, UI/UX, AI, Riset)..."
              className="w-full text-xs pl-9 pr-9 py-2.5 rounded-[4px] bg-[#F6F5F4] border border-[#E6E6E6] focus:bg-white focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000] placeholder:text-[#A39E98] transition-all"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#615D59] hover:text-[#000000]"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            onClick={() => doSearch(query)}
            className="px-5 py-2.5 rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            Cari
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6E6E6]/60 text-xs">
          <span className="text-[11px] font-semibold text-[#615D59] flex items-center gap-1">
            {(selectedCategory || selectedType || onlyFree) ? (
              <FilterFill size={12} className="text-[#0075DE]" />
            ) : (
              <Filter size={12} />
            )}
            <span>Filter:</span>
          </span>

          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); doSearch(query); }}
            className="text-xs px-2.5 py-1 rounded-[4px] bg-white border border-[#E6E6E6] text-[#31302E] focus:outline-hidden focus:border-[#0075DE]"
          >
            <option value="">Semua Kategori</option>
            {mockCategories.map((c) => (
              <option key={c.id} value={c.id.toString()}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); doSearch(query); }}
            className="text-xs px-2.5 py-1 rounded-[4px] bg-white border border-[#E6E6E6] text-[#31302E] focus:outline-hidden focus:border-[#0075DE]"
          >
            <option value="">Semua Format</option>
            <option value="individual">Individu</option>
            <option value="team">Tim</option>
          </select>

          <button
            onClick={() => { setOnlyFree(!onlyFree); doSearch(query); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 transition-colors ${
              onlyFree
                ? 'bg-[#1AAE39]/15 text-[#0E6621] border-[#1AAE39]/40 font-semibold'
                : 'bg-white border-[#E6E6E6] text-[#615D59] hover:bg-[#F6F5F4]'
            }`}
          >
            {onlyFree && <CheckCircleFill size={12} className="text-[#0E6621]" />}
            <span>Gratis Saja</span>
          </button>

          {(selectedCategory || selectedType || onlyFree) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedType('');
                setOnlyFree(false);
                doSearch(query);
              }}
              className="text-xs text-[#0075DE] hover:underline ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ── Search History / Recent ───────────────────────── */}
      {!hasSearched && history.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E6E6E6] p-4 shadow-2xs mb-6">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E6E6E6]/60">
            <span className="text-xs font-semibold text-[#000000]">Pencarian Terakhir</span>
            <button onClick={clearHistory} className="text-[11px] text-[#615D59] hover:text-[#000000]">
              Hapus Riwayat
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((kw, i) => (
              <button
                key={i}
                onClick={() => applyHistory(kw)}
                className="px-2.5 py-1 rounded-[4px] bg-[#F6F5F4] hover:bg-[#EAE8E4] border border-[#E6E6E6] text-xs text-[#31302E] inline-flex items-center gap-1 transition-colors"
              >
                <Clock size={11} className="text-[#615D59]" />
                <span>{kw}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Search Results List ───────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-[#E6E6E6] p-4 space-y-2">
              <Skeleton className="h-4 w-1/3 rounded bg-[#EAE8E4]" />
              <Skeleton className="h-3 w-2/3 rounded bg-[#EAE8E4]" />
            </div>
          ))}
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-[#E6E6E6]">
          <Search size={32} className="mx-auto text-[#615D59] mb-2" />
          <p className="text-sm font-semibold text-[#000000]">Tidak ada hasil untuk pencarian ini</p>
          <p className="text-xs text-[#615D59] mt-1">Coba gunakan kata kunci yang lebih umum atau kurangi filter.</p>
        </div>
      ) : hasSearched ? (
        <div className="space-y-3">
          <p className="text-xs text-[#615D59] font-medium">
            Ditemukan <strong>{results.length}</strong> kompetisi yang cocok:
          </p>

          {results.map((comp) => {
            const urgent = isUrgent(comp.registration_deadline);
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
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] ${urgent ? 'bg-[#DD5B00] text-white' : 'text-[#615D59]'}`}>
                        {formatDeadline(comp.registration_deadline)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-[#000000]">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-[#615D59] line-clamp-1 mt-0.5">
                      {comp.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E6E6]/60 text-xs">
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] text-[#615D59]">Hadiah</p>
                    <p className="font-semibold text-[#000000]">
                      {comp.prize_info ? comp.prize_info : 'Sertifikat'}
                    </p>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-medium">
                    Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
