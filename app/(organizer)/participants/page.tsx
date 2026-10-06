'use client';

// ============================================================
// RAIH — Notion Organizer Participants Database
// Design System: Notion (design.md)
// Featuring Notion Database Table, Sticker Status Tags & Streamline MingCute Icons
// ============================================================
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Skeleton, addToast } from '@heroui/react';
import {
  Users,
  CheckCircle,
  CheckCircleFill,
  XCircle,
  Clock,
  ClockFill,
  Search,
  SearchFill,
  Filter,
  FileText,
  Layers,
  Sparkles,
  Trophy,
} from '@/components/ui/icons';
import { competitionRepo, registrationRepo } from '@/lib/repositories/local';
import { mockUsers } from '@/data/mock';
import { useAuthStore } from '@/lib/stores/auth';
import type { RegistrationWithDetails, Competition } from '@/types';

export default function NotionParticipantsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>('');
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    competitionRepo.getByOrganizer(user.id).then((comps) => {
      setCompetitions(comps);
      if (comps.length > 0) {
        setSelectedComp(comps[0].id.toString());
      }
      setIsLoading(false);
    });
  }, [user, router]);

  useEffect(() => {
    if (!selectedComp) return;
    registrationRepo.getByCompetition(Number(selectedComp)).then(setRegistrations);
  }, [selectedComp]);

  const handleApprove = async (regId: number) => {
    await registrationRepo.updateStatus(regId, 'approved');
    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, status: 'approved' as const } : r))
    );
    addToast({ title: 'Pendaftaran Disetujui ✓', color: 'success' });
  };

  const handleReject = async (regId: number) => {
    await registrationRepo.updateStatus(regId, 'rejected');
    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, status: 'rejected' as const } : r))
    );
    addToast({ title: 'Pendaftaran Ditolak', color: 'danger' });
  };

  const filtered = searchQuery
    ? registrations.filter((r) => {
        const participantUser = r.user_id ? mockUsers.find((u) => u.id === r.user_id) : null;
        return (
          participantUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          participantUser?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : registrations;

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = registrations.filter((r) => r.status === 'rejected').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* ── 1. Document Header ───────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-xl shadow-2xs">
            👥
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#000000]">
              Database Pendaftar & Peserta
            </h1>
            <p className="text-xs text-[#615D59]">
              Verifikasi berkas, persetujuan administrasi tim, dan data kontak peserta lomba
            </p>
          </div>
        </div>

        {/* Notion Callout */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] flex items-start gap-3 text-xs text-[#31302E] shadow-2xs mt-3">
          <span className="text-base leading-none">📋</span>
          <div className="flex-1 leading-relaxed">
            <strong className="text-[#000000]">Instruksi Verifikasi:</strong> Pendaftar dengan status <strong>Pending</strong> memerlukan persetujuan berkas pendaftaran. Klik tombol <em>Setujui</em> untuk mengirim konfirmasi dan memberikan token registrasi ke peserta.
          </div>
        </div>
      </div>

      {/* ── 2. Filters & Metrics Bar ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        {/* Comp selector */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-[#615D59] uppercase tracking-wider mb-1">
            Filter Kompetisi
          </label>
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-md bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] text-[#000000] font-medium shadow-2xs"
          >
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id.toString()}>
                {comp.title} ({comp.status})
              </option>
            ))}
          </select>
        </div>

        {/* Summary Counter */}
        <div className="p-2.5 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] text-[#615D59] block">Perlu Review</span>
            <span className="text-base font-bold text-[#DD5B00]">{pendingCount}</span>
          </div>
          <ClockFill size={16} className="text-[#DD5B00]" />
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] text-[#615D59] block">Telah Disetujui</span>
            <span className="text-base font-bold text-[#1AAE39]">{approvedCount}</span>
          </div>
          <CheckCircleFill size={16} className="text-[#1AAE39]" />
        </div>
      </div>

      {/* ── 3. Database Search Toolbar ───────────────────── */}
      <div className="border-b border-[#E6E6E6] pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:w-72">
          {searchQuery ? (
            <SearchFill size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0075DE]" />
          ) : (
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#615D59]" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari peserta berdasarkan nama, tim, email..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] text-[#000000] placeholder:text-[#A39E98]"
          />
        </div>
        <span className="text-xs text-[#615D59]">
          Menampilkan {filtered.length} pendaftaran
        </span>
      </div>

      {/* ── 4. Notion Table View ─────────────────────────── */}
      {isLoading ? (
        <div className="p-6 rounded-lg bg-white border border-[#E6E6E6] space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xs" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-white border border-[#E6E6E6]">
          <span className="text-4xl block mb-2">👥</span>
          <p className="text-sm font-semibold text-[#000000]">Tidak ada data pendaftar</p>
          <p className="text-xs text-[#615D59] mt-1">
            Belum ada pendaftaran masuk untuk filter kompetisi yang dipilih.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E6E6E6] bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F6F5F4] border-b border-[#E6E6E6] text-[#615D59] font-medium">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-4 font-semibold text-[#31302E]">Peserta / Ketua</th>
                <th className="py-2.5 px-3">Nama Tim</th>
                <th className="py-2.5 px-3">Tanggal Daftar</th>
                <th className="py-2.5 px-3">Status Verifikasi</th>
                <th className="py-2.5 px-4 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E6]">
              {filtered.map((reg, idx) => {
                const participant = reg.user_id
                  ? mockUsers.find((u) => u.id === reg.user_id)
                  : null;
                const regDate = new Date(reg.registered_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={reg.id} className="hover:bg-[#F7F6F3] transition-colors group">
                    <td className="py-3 px-3 text-center text-[#A39E98]">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={participant?.profile_photo ?? undefined}
                          name={participant?.name ?? 'Peserta'}
                          size="sm"
                          className="w-7 h-7 rounded-full border border-[#E6E6E6] flex-shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-[#000000] block">
                            {participant?.name ?? 'Peserta Anonim'}
                          </span>
                          <span className="text-[11px] text-[#615D59]">
                            {participant?.email ?? '-'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#31302E]">
                      {reg.team_name ? (
                        <span className="font-medium">{reg.team_name}</span>
                      ) : (
                        <span className="text-[#A39E98] italic">Individu</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#615D59]">{regDate}</td>
                    <td className="py-3 px-3">
                      {reg.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-[4px] bg-[#1AAE39]/10 text-[#0E6621] font-semibold border border-[#1AAE39]/30">
                          <CheckCircleFill size={10} />
                          <span>Disetujui</span>
                        </span>
                      )}
                      {reg.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-[4px] bg-[#DD5B00]/10 text-[#793400] font-semibold border border-[#DD5B00]/30">
                          <ClockFill size={10} />
                          <span>Pending</span>
                        </span>
                      )}
                      {reg.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-[4px] bg-[#F6F5F4] text-[#615D59] font-semibold border border-[#E6E6E6]">
                          <XCircle size={10} />
                          <span>Ditolak</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {reg.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(reg.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-[4px] bg-[#1AAE39] hover:bg-[#0E6621] text-white transition-colors shadow-2xs inline-flex items-center gap-1"
                          >
                            <CheckCircleFill size={11} />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => handleReject(reg.id)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-[4px] bg-white border border-[#E6E6E6] text-[#DD5B00] hover:bg-[#DD5B00]/10 transition-colors inline-flex items-center gap-1"
                          >
                            <XCircle size={11} />
                            <span>Tolak</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#A39E98] italic">Selesai diverifikasi</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
