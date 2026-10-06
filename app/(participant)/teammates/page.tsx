'use client';

// ============================================================
// RAIH — Notion Team Directory & Matchmaking Database
// Design System: Notion (design.md)
// Featuring Notion Document layout, Property Badges & Streamline MingCute Icons
// ============================================================
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Skeleton } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Zap,
  MapPin,
  GraduationCap,
  Sparkles,
  Trophy,
  Award,
  Layers,
  FileText,
  CheckCircle,
  CheckCircleFill,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  MessageCircleFill,
} from '@/components/ui/icons';
import { teammateRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { UserWithProfiles } from '@/types';
import { TeammateChatModal } from '@/components/teammates/TeammateChatModal';

// Notion Sticker Accent Badge Colors (from design.md)
const skillStickerStyles = [
  'bg-[#62AEF0]/15 text-[#005BAB] border-[#62AEF0]/30', // Sky
  'bg-[#D6B6F6]/25 text-[#391C57] border-[#D6B6F6]/50', // Purple
  'bg-[#FF64C8]/15 text-[#B8117A] border-[#FF64C8]/30', // Pink
  'bg-[#DD5B00]/15 text-[#793400] border-[#DD5B00]/30', // Orange
  'bg-[#2A9D99]/15 text-[#0E5250] border-[#2A9D99]/30', // Teal
  'bg-[#1AAE39]/15 text-[#0E6621] border-[#1AAE39]/30', // Green
];

export default function NotionTeammatesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [matches, setMatches] = useState<{ user: UserWithProfiles; score: number }[]>([]);
  const [potential, setPotential] = useState<UserWithProfiles[]>([]);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
  const [isLoading, setIsLoading] = useState(true);
  const [invitedIds, setInvitedIds] = useState<Set<number>>(new Set());
  const [inviteToast, setInviteToast] = useState<string | null>(null);
  const [chatCandidate, setChatCandidate] = useState<UserWithProfiles | null>(null);

  useEffect(() => {
    async function load() {
      const currentUserId = user?.id ?? 1;
      const [matchData, potentialData] = await Promise.all([
        teammateRepo.getMatchesFor(currentUserId),
        teammateRepo.findPotential(currentUserId),
      ]);
      setMatches(matchData.map((m) => ({ user: m.matchedUser, score: m.compatibility_score })));
      setPotential(potentialData.filter((p) => !matchData.some((m) => m.matchedUser.id === p.id)));
      setIsLoading(false);
    }
    load();
  }, [user]);

  const handleInvite = (targetUser: UserWithProfiles) => {
    setInvitedIds((prev) => new Set(prev).add(targetUser.id));
    setInviteToast(`Undangan kolaborasi dikirimkan ke ${targetUser.name}!`);
    setTimeout(() => setInviteToast(null), 3000);
  };

  const allTeammates = [
    ...matches.map((m) => ({ ...m.user, compatibilityScore: m.score })),
    ...potential.map((p) => ({ ...p, compatibilityScore: undefined })),
  ];

  const filtered = query
    ? allTeammates.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.participant_profile?.skills?.toLowerCase().includes(query.toLowerCase()) ||
          u.location?.toLowerCase().includes(query.toLowerCase())
      )
    : allTeammates;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {inviteToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 right-8 z-50 bg-[#000000] text-white text-xs px-3.5 py-2 rounded-md shadow-md flex items-center gap-2"
          >
            <CheckCircleFill size={14} className="text-[#1AAE39]" />
            <span>{inviteToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Notion Document Header & Icon ───────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-xl shadow-2xs">
            🤝
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#000000]">
              Direktori Rekan Tim & Matchmaking
            </h1>
            <p className="text-xs text-[#615D59]">
              Temukan partner potensial berbasis komplementaritas skill, latar belakang, dan riwayat prestasi lomba
            </p>
          </div>
        </div>

        {/* Notion Callout Box */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] flex items-start gap-3 text-xs text-[#31302E] shadow-2xs mt-3">
          <span className="text-base leading-none">⚡</span>
          <div className="flex-1 leading-relaxed">
            <strong className="text-[#000000]">Algoritma Kecocokan AI:</strong> Skor persentase (mis. <span className="text-[#1AAE39] font-bold">95%</span>) dihitung otomatis dari keselarasan bidang minat dan sinergi peran (cth: Hacker + Hipster + Hustler). Klik <em>Ajak Kolaborasi</em> untuk mengirim undangan instan ke profil mereka.
          </div>
        </div>
      </div>

      {/* ── 2. Notion Database View Tabs & Filter Toolbar ──── */}
      <div className="border-b border-[#E6E6E6] mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                viewMode === 'gallery'
                  ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
                  : 'text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000]'
              }`}
            >
              <Layers size={14} className={viewMode === 'gallery' ? 'text-[#0075DE]' : 'text-[#615D59]'} />
              <span>Galeri Anggota</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
                  : 'text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000]'
              }`}
            >
              <FileText size={14} className={viewMode === 'table' ? 'text-[#0075DE]' : 'text-[#615D59]'} />
              <span>Tabel Database</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#615D59]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, skill, kota..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000] placeholder:text-[#A39E98]"
              />
            </div>
            <span className="text-xs text-[#615D59] whitespace-nowrap">
              {filtered.length} peserta
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Database Content Views ──────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-lg bg-white border border-[#E6E6E6] p-4 space-y-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="w-3/4 h-4 rounded-xs" />
              <Skeleton className="w-1/2 h-3 rounded-xs" />
              <Skeleton className="w-full h-8 rounded-md mt-4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-white border border-[#E6E6E6]">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="text-sm font-semibold text-[#000000]">Tidak ada peserta yang cocok</p>
          <p className="text-xs text-[#615D59] mt-1">Coba sesuaikan kata kunci pencarian atau bersihkan filter.</p>
        </div>
      ) : viewMode === 'gallery' ? (
        /* ── Gallery Cards View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => {
            const profile = item.participant_profile;
            const skills = profile?.skills?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
            const isInvited = invitedIds.has(item.id);

            return (
              <div
                key={item.id}
                className="group rounded-lg bg-white border border-[#E6E6E6] hover:border-[#0075DE]/40 transition-all hover:shadow-xs flex flex-col p-4"
              >
                {/* Header: Avatar, Name, Compatibility */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={item.profile_photo ?? undefined}
                      name={item.name}
                      size="md"
                      className="w-11 h-11 rounded-full border border-[#E6E6E6] text-sm flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-[#000000] group-hover:text-[#0075DE] transition-colors leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#615D59] flex items-center gap-1 mt-0.5">
                        <GraduationCap size={12} className="text-[#A39E98]" />
                        <span>{item.education_level ?? 'Mahasiswa'}</span>
                        {item.location && (
                          <>
                            <span className="text-[#A39E98]">•</span>
                            <MapPin size={11} className="text-[#A39E98]" />
                            <span className="truncate max-w-[90px]">{item.location}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {item.compatibilityScore !== undefined && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1AAE39]/10 border border-[#1AAE39]/30 text-[#0E6621] text-xs font-bold flex-shrink-0">
                      <Zap size={11} className="text-[#1AAE39]" />
                      <span>{item.compatibilityScore.toFixed(0)}%</span>
                    </div>
                  )}
                </div>

                {/* Bio snippet */}
                {profile?.bio && (
                  <p className="text-xs text-[#31302E] line-clamp-2 mb-3 leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Notion Skills Tag List */}
                <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                  {skills.slice(0, 3).map((skill, sIdx) => {
                    const style = skillStickerStyles[sIdx % skillStickerStyles.length];
                    return (
                      <span
                        key={skill}
                        className={`text-[10px] px-2 py-0.5 rounded-[4px] border font-medium ${style}`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                  {skills.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#F6F5F4] text-[#615D59] font-medium border border-[#E6E6E6]">
                      +{skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Track Record Stats */}
                <div className="pt-2.5 border-t border-[#E6E6E6] flex items-center justify-between text-[11px] text-[#615D59] mb-3">
                  <span className="flex items-center gap-1">
                    <Trophy size={12} className="text-[#DD5B00]" />
                    <span>{profile?.competitions_won ?? 0} menang</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={12} className="text-[#0075DE]" />
                    <span>{profile?.competitions_joined ?? 0} lomba</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F6F5F4] text-[#31302E] font-medium border border-[#E6E6E6]">
                    Lv. {profile?.level ?? 1}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setChatCandidate(item)}
                    className="py-1.5 px-2.5 rounded-md border border-[#0075DE]/30 bg-[#EBF4FC] hover:bg-[#D6EAF8] text-xs font-semibold text-[#0075DE] inline-flex items-center gap-1 transition-colors"
                    title="Mulai Chat & Diskusi Sebelum Kolaborasi"
                  >
                    {chatCandidate?.id === item.id ? (
                      <MessageCircleFill size={13} />
                    ) : (
                      <MessageCircle size={13} />
                    )}
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => handleInvite(item)}
                    disabled={isInvited}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
                      isInvited
                        ? 'bg-[#1AAE39]/10 text-[#0E6621] border border-[#1AAE39]/30 cursor-default'
                        : 'bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs'
                    }`}
                  >
                    {isInvited ? (
                      <>
                        <CheckCircleFill size={13} />
                        <span>Terkirim</span>
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        <span>Ajak Kolaborasi</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push('/profile')}
                    className="p-1.5 px-2 rounded-md border border-[#E6E6E6] hover:bg-[#F6F5F4] text-xs text-[#615D59] hover:text-[#000000] transition-colors"
                    title="Lihat Profil Lengkap"
                  >
                    Profil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Notion Database Table View ── */
        <div className="overflow-x-auto rounded-lg border border-[#E6E6E6] bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F6F5F4] border-b border-[#E6E6E6] text-[#615D59] font-medium">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-4 font-semibold text-[#31302E]">Nama Peserta</th>
                <th className="py-2.5 px-3">Kecocokan</th>
                <th className="py-2.5 px-4">Keahlian (Skills)</th>
                <th className="py-2.5 px-3">Pendidikan / Lokasi</th>
                <th className="py-2.5 px-3 text-center">Rekam Jejak</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E6]">
              {filtered.map((item, i) => {
                const profile = item.participant_profile;
                const skills = profile?.skills?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
                const isInvited = invitedIds.has(item.id);

                return (
                  <tr key={item.id} className="hover:bg-[#F7F6F3] transition-colors group">
                    <td className="py-3 px-3 text-center text-[#A39E98]">{i + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={item.profile_photo ?? undefined}
                          name={item.name}
                          size="sm"
                          className="w-7 h-7 rounded-full border border-[#E6E6E6] flex-shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-[#000000] block">{item.name}</span>
                          <span className="text-[11px] text-[#615D59] truncate max-w-[200px] block">
                            {profile?.bio || 'Siap berkolaborasi'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {item.compatibilityScore !== undefined ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1AAE39]/10 text-[#0E6621] font-bold text-[11px]">
                          <Zap size={11} className="text-[#1AAE39]" />
                          {item.compatibilityScore.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-[#A39E98] text-[11px]">Umum</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {skills.slice(0, 3).map((s, sIdx) => {
                          const style = skillStickerStyles[sIdx % skillStickerStyles.length];
                          return (
                            <span
                              key={s}
                              className={`text-[10px] px-1.5 py-0.2 rounded-[4px] border font-medium ${style}`}
                            >
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#615D59]">
                      <div className="text-[11px]">
                        <div>{item.education_level ?? 'Mahasiswa'}</div>
                        <div className="text-[#A39E98] text-[10px]">{item.location ?? 'Indonesia'}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] text-[#31302E] font-medium">
                        🏆 {profile?.competitions_won ?? 0}W / {profile?.competitions_joined ?? 0}L
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setChatCandidate(item)}
                          className="px-2 py-1 text-xs rounded-md font-medium inline-flex items-center gap-1 border border-[#0075DE]/30 bg-[#EBF4FC] text-[#0075DE] hover:bg-[#D6EAF8] transition-colors"
                          title="Chat Rekan Tim"
                        >
                          <MessageCircle size={12} />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => handleInvite(item)}
                          disabled={isInvited}
                          className={`px-3 py-1 text-xs rounded-md font-medium inline-flex items-center gap-1 transition-colors ${
                            isInvited
                              ? 'bg-[#1AAE39]/10 text-[#0E6621] border border-[#1AAE39]/30'
                              : 'bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs'
                          }`}
                        >
                          {isInvited ? 'Terkirim' : 'Ajak'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Teammate Chat Modal (Solves WISH, QUESTIONS, IDEAS) ── */}
      <TeammateChatModal
        isOpen={!!chatCandidate}
        onClose={() => setChatCandidate(null)}
        candidate={chatCandidate}
        currentUserName={user?.name ?? 'Ariel Pratama'}
      />
    </div>
  );
}
