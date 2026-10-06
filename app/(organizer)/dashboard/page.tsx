'use client';

// ============================================================
// RAIH — Notion Organizer Dashboard
// Design System: Notion (design.md)
// Featuring Notion Document layout, Database Table & Streamline MingCute Icons
// ============================================================
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@heroui/react';
import {
  TrendingUp,
  Users,
  UsersFill,
  Trophy,
  TrophyFill,
  Clock,
  Eye,
  Plus,
  Target,
  Star,
  StarFill,
  Calendar,
  CheckCircle,
  CheckCircleFill,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
} from '@/components/ui/icons';
import { competitionRepo, registrationRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { Competition, Registration } from '@/types';

function CompStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
    draft: { bg: 'bg-[#F6F5F4]', text: 'text-[#615D59]', border: 'border-[#E6E6E6]', label: 'Draft' },
    published: { bg: 'bg-[#1AAE39]/10', text: 'text-[#0E6621]', border: 'border-[#1AAE39]/30', label: 'Aktif' },
    closed: { bg: 'bg-[#DD5B00]/10', text: 'text-[#793400]', border: 'border-[#DD5B00]/30', label: 'Ditutup' },
    completed: { bg: 'bg-[#62AEF0]/15', text: 'text-[#005BAB]', border: 'border-[#62AEF0]/30', label: 'Selesai' },
  };
  const c = config[status] ?? config.draft;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-[4px] border font-semibold ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}

export default function NotionOrganizerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'organizer') {
      router.push('/home');
      return;
    }
    async function load() {
      const [comps, regs] = await Promise.all([
        competitionRepo.getByOrganizer(user!.id),
        registrationRepo.getAll(),
      ]);
      setCompetitions(comps);
      setAllRegistrations(regs.filter((r) => comps.some((c) => c.id === r.competition_id)));
      setIsLoading(false);
    }
    load();
  }, [user, router]);

  const activeComps = competitions.filter((c) => c.status === 'published');
  const totalParticipants = allRegistrations.length;
  const approvedRegistrations = allRegistrations.filter((r) => r.status === 'approved').length;
  const orgProfile = user?.organizer_profile;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* ── 1. Document Header & Callout ─────────────────── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E6E6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-xl shadow-2xs">
              📊
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#000000]">
                Dashboard Penyelenggara
              </h1>
              <p className="text-xs text-[#615D59]">
                {orgProfile?.organization_name ?? user?.name} • Kelola alur pendaftaran, peserta, dan timeline lomba
              </p>
            </div>
          </div>

          <Link
            href="/competitions/create"
            className="px-4 py-2 text-xs font-semibold rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Buat Kompetisi Baru</span>
          </Link>
        </div>

        {/* Notion Callout Box */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] flex items-start gap-3 text-xs text-[#31302E] shadow-2xs mt-4">
          <span className="text-base leading-none">💡</span>
          <div className="flex-1 leading-relaxed">
            <strong className="text-[#000000]">Pemberitahuan Sistem:</strong> Pengaturan timeline tahapan lomba kini dapat disesuaikan langsung oleh pengelola di halaman detail masing-masing kompetisi. Klik <em>Kelola Timeline</em> pada baris tabel di bawah untuk mengatur jadwal babak penyisihan hingga award night.
          </div>
        </div>
      </div>

      {/* ── 2. KPI Metrics Grid (Notion Surface Cards) ─────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#615D59] mb-1">
            <span>Total Kompetisi</span>
            <TrophyFill size={14} className="text-[#0075DE]" />
          </div>
          <div className="text-2xl font-bold text-[#000000]">{competitions.length}</div>
          <p className="text-[10px] text-[#1AAE39] font-medium mt-1">
            {activeComps.length} kompetisi aktif
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#615D59] mb-1">
            <span>Total Pendaftar</span>
            <UsersFill size={14} className="text-[#1AAE39]" />
          </div>
          <div className="text-2xl font-bold text-[#000000]">{totalParticipants}</div>
          <p className="text-[10px] text-[#615D59] mt-1">
            Dari seluruh ajang lomba
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#615D59] mb-1">
            <span>Peserta Lolos Verifikasi</span>
            <CheckCircleFill size={14} className="text-[#DD5B00]" />
          </div>
          <div className="text-2xl font-bold text-[#000000]">{approvedRegistrations}</div>
          <p className="text-[10px] text-[#615D59] mt-1">
            Dokumen & pembayaran valid
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#615D59] mb-1">
            <span>Reputasi Organizer</span>
            <StarFill size={14} className="text-[#DD5B00]" />
          </div>
          <div className="text-2xl font-bold text-[#000000]">
            {orgProfile?.rating_avg?.toFixed(1) ?? '5.0'} / 5.0
          </div>
          <p className="text-[10px] text-[#0075DE] font-medium mt-1">
            Status Terverifikasi ✓
          </p>
        </div>
      </div>

      {/* ── 3. Notion Database Table: Daftar Kompetisi ─────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#000000] flex items-center gap-2">
            <Layers size={16} className="text-[#0075DE]" />
            <span>Database Kompetisi Anda ({competitions.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 rounded-lg bg-white border border-[#E6E6E6] space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xs" />
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-white border border-[#E6E6E6]">
            <span className="text-4xl block mb-2">📑</span>
            <p className="text-sm font-semibold text-[#000000]">Belum ada kompetisi yang dibuat</p>
            <p className="text-xs text-[#615D59] mt-1 mb-4">
              Mulai publikasikan event lomba Anda untuk menjaring ribuan peserta di seluruh Indonesia.
            </p>
            <Link
              href="/competitions/create"
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Plus size={14} />
              <span>Buat Kompetisi Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#E6E6E6] bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F6F5F4] border-b border-[#E6E6E6] text-[#615D59] font-medium">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-4 font-semibold text-[#31302E]">Nama Kompetisi</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Deadline Pendaftaran</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3 text-center">Pendaftar</th>
                  <th className="py-2.5 px-4 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E6]">
                {competitions.map((comp, idx) => {
                  const compRegs = allRegistrations.filter((r) => r.competition_id === comp.id);

                  return (
                    <tr key={comp.id} className="hover:bg-[#F7F6F3] transition-colors group">
                      <td className="py-3 px-3 text-center text-[#A39E98]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#000000] block group-hover:text-[#0075DE] transition-colors">
                          {comp.title}
                        </span>
                        <span className="text-[11px] text-[#615D59] truncate max-w-xs block">
                          {comp.description}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <CompStatusBadge status={comp.status} />
                      </td>
                      <td className="py-3 px-3 text-[#31302E]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#A39E98]" />
                          {new Date(comp.registration_deadline).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#615D59]">
                        <span className="capitalize">{comp.comp_type === 'team' ? 'Tim' : 'Individu'}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-[#000000]">
                        {compRegs.length} tim
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/competitions/${comp.id}/timeline`}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-[4px] bg-[#EBF4FC] text-[#0075DE] hover:bg-[#0075DE] hover:text-white transition-colors border border-[#0075DE]/20 inline-flex items-center gap-1"
                        >
                          <Clock size={11} />
                          <span>Atur Timeline</span>
                        </Link>
                        <Link
                          href={`/competitions/${comp.id}`}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-[4px] bg-white text-[#31302E] hover:bg-[#F6F5F4] transition-colors border border-[#E6E6E6] inline-flex items-center gap-1"
                        >
                          <Eye size={11} />
                          <span>Lihat</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
