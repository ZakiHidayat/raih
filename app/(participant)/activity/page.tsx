'use client';

// ============================================================
// RAIH — Notion Activity & Registration Management
// Design System: Notion (design.md)
// ============================================================
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@heroui/react';
import { motion } from 'framer-motion';
import {
  Trophy,
  TrophyFill,
  Clock,
  ClockFill,
  CheckCircle,
  CheckCircleFill,
  XCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  Ticket,
  FileText,
} from '@/components/ui/icons';
import { registrationRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { RegistrationWithDetails } from '@/types';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
    pending: {
      label: 'Menunggu Review',
      style: 'bg-[#DD5B00]/15 text-[#793400] border-[#DD5B00]/30',
      icon: <ClockFill size={12} />,
    },
    approved: {
      label: 'Disetujui',
      style: 'bg-[#1AAE39]/15 text-[#0E6621] border-[#1AAE39]/30',
      icon: <CheckCircleFill size={12} />,
    },
    rejected: {
      label: 'Ditolak',
      style: 'bg-[#DD5B00]/15 text-[#DD5B00] border-[#DD5B00]/30',
      icon: <XCircle size={12} />,
    },
    completed: {
      label: 'Selesai',
      style: 'bg-[#EBF4FC] text-[#0075DE] border-[#B3D8FA]',
      icon: <TrophyFill size={12} />,
    },
  };
  const c = config[status] ?? config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${c.style}`}>
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
}

export default function NotionActivityPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    registrationRepo.getByUser(user.id).then((data) => {
      setRegistrations(data);
      setIsLoading(false);
    });
  }, [user, router]);

  const filtered = registrations.filter((reg) => {
    if (filterTab === 'all') return true;
    return reg.status === filterTab;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
      {/* ── Document Page Header ──────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-[#615D59] mb-2">
          <Link href="/home" className="hover:text-[#000000]">Raih</Link>
          <span>/</span>
          <span className="text-[#000000] font-semibold">Aktivitas</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-xl shadow-2xs">
            🎟️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
              Aktivitas Pendaftaran
            </h1>
            <p className="text-xs text-[#615D59]">
              Pantau status verifikasi berkas, tahapan kompetisi, dan progress keikutsertaanmu.
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
          Semua ({registrations.length})
        </button>

        <button
          onClick={() => setFilterTab('approved')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            filterTab === 'approved'
              ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
              : 'text-[#615D59] hover:bg-[#EAE8E4]'
          }`}
        >
          Disetujui
        </button>

        <button
          onClick={() => setFilterTab('pending')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            filterTab === 'pending'
              ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
              : 'text-[#615D59] hover:bg-[#EAE8E4]'
          }`}
        >
          Menunggu Review
        </button>

        <button
          onClick={() => setFilterTab('completed')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            filterTab === 'completed'
              ? 'bg-white border border-[#E6E6E6] text-[#000000] shadow-2xs font-semibold'
              : 'text-[#615D59] hover:bg-[#EAE8E4]'
          }`}
        >
          Selesai
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
          <Ticket size={32} className="mx-auto text-[#615D59] mb-2" />
          <p className="text-sm font-semibold text-[#000000]">Belum ada aktivitas pendaftaran</p>
          <p className="text-xs text-[#615D59] mt-1">Daftar lomba sekarang untuk mulai mengumpulkan portofolio prestasimu.</p>
          <button
            onClick={() => router.push('/home')}
            className="mt-4 px-4 py-1.5 text-xs font-semibold rounded-full bg-[#0075DE] text-white"
          >
            Jelajahi Kompetisi
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reg) => {
            const comp = reg.competition;
            if (!comp) return null;

            return (
              <div
                key={reg.id}
                onClick={() => router.push(`/competitions/${comp.id}`)}
                className="bg-white rounded-xl border border-[#E6E6E6] hover:border-[#0075DE] p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EBF4FC] text-[#0075DE] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={reg.status} />
                      <span className="text-[11px] text-[#615D59]">
                        Terdaftar: {new Date(reg.registered_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-[#000000]">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-[#615D59] mt-0.5">
                      Penyelenggara Terverifikasi &bull; Deadline: {new Date(comp.registration_deadline).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E6E6]/60">
                  <button className="px-4 py-1.5 rounded-full border border-[#E6E6E6] hover:bg-[#F6F5F4] text-xs font-medium text-[#31302E] inline-flex items-center gap-1.5">
                    <span>Lihat Alur</span>
                    <ChevronRight size={13} />
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
