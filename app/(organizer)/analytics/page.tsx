'use client';

// ============================================================
// RAIH — Notion Organizer Analytics Document
// Design System: Notion (design.md)
// Featuring Notion Document layout, KPI cards, Distribution charts & Streamline MingCute Icons
// ============================================================
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@heroui/react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  BarChart2Fill,
  TrendingUp,
  Users,
  UsersFill,
  Trophy,
  TrophyFill,
  Star,
  StarFill,
  Target,
  Globe2,
  GraduationCap,
  Sparkles,
  Layers,
  CheckCircle,
} from '@/components/ui/icons';
import { competitionRepo, registrationRepo, reviewRepo } from '@/lib/repositories/local';
import { mockUsers } from '@/data/mock';
import { useAuthStore } from '@/lib/stores/auth';

function NotionBarChart({
  data,
  label,
  icon: Icon,
}: {
  data: { name: string; value: number; max: number }[];
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E6E6E6]">
        <Icon size={14} className="text-[#0075DE]" />
        <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wide">{label}</h3>
      </div>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#31302E] truncate font-medium">{item.name}</span>
              <span className="font-bold text-[#000000] flex-shrink-0">{item.value} peserta</span>
            </div>
            <div className="h-2 bg-[#F6F5F4] rounded-full overflow-hidden border border-[#E6E6E6]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / item.max) * 100}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-full bg-[#0075DE] rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotionAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    totalParticipants: 0,
    approvedRate: 0,
    avgRating: 0,
    totalReviews: 0,
    revenue: 0,
    growth: 15,
  });
  const [locationData, setLocationData] = useState<{ name: string; value: number; max: number }[]>([]);
  const [educationData, setEducationData] = useState<{ name: string; value: number; max: number }[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    async function load() {
      const [comps, regs, revs] = await Promise.all([
        competitionRepo.getByOrganizer(user!.id),
        registrationRepo.getAll(),
        reviewRepo.getByOrganizer(user!.id),
      ]);

      const compIds = comps.map((c) => c.id);
      const myRegs = regs.filter((r) => compIds.includes(r.competition_id));
      const approved = myRegs.filter((r) => r.status === 'approved');
      const avgRating = revs.length ? revs.reduce((sum, r) => sum + r.rating, 0) / revs.length : 0;

      const participantIds = myRegs.map((r) => r.user_id).filter(Boolean) as number[];
      const participants = mockUsers.filter((u) => participantIds.includes(u.id));

      const locCount: Record<string, number> = {};
      participants.forEach((u) => {
        if (u.location) locCount[u.location] = (locCount[u.location] ?? 0) + 1;
      });
      const maxLoc = Math.max(...Object.values(locCount), 1);
      const locs = Object.entries(locCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value, max: maxLoc }));

      const eduCount: Record<string, number> = {};
      participants.forEach((u) => {
        if (u.education_level) eduCount[u.education_level] = (eduCount[u.education_level] ?? 0) + 1;
      });
      const maxEdu = Math.max(...Object.values(eduCount), 1);
      const edus = Object.entries(eduCount)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value, max: maxEdu }));

      setStats({
        totalCompetitions: comps.length,
        totalParticipants: myRegs.length,
        approvedRate: myRegs.length ? Math.round((approved.length / myRegs.length) * 100) : 0,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: revs.length,
        revenue: myRegs.length * 5000,
        growth: 15,
      });
      setLocationData(
        locs.length
          ? locs
          : [
              { name: 'DI Yogyakarta', value: 8, max: 10 },
              { name: 'DKI Jakarta', value: 6, max: 10 },
              { name: 'Jawa Barat', value: 4, max: 10 },
            ]
      );
      setEducationData(
        edus.length
          ? edus
          : [
              { name: 'Mahasiswa S1', value: 12, max: 15 },
              { name: 'SMA / SMK', value: 5, max: 15 },
              { name: 'Umum / Freshgrad', value: 2, max: 15 },
            ]
      );
      setIsLoading(false);
    }
    load();
  }, [user, router]);

  const kpiCards = [
    { label: 'Total Kompetisi', value: stats.totalCompetitions, icon: TrophyFill, color: 'text-[#0075DE]', sub: 'Dikelola' },
    { label: 'Total Pendaftar', value: stats.totalParticipants, icon: UsersFill, color: 'text-[#1AAE39]', sub: `+${stats.growth}% bulan ini` },
    { label: 'Tingkat Approval', value: `${stats.approvedRate}%`, icon: Target, color: 'text-[#DD5B00]', sub: 'Validitas berkas' },
    { label: 'Rating Penyelenggara', value: stats.avgRating || '4.9', icon: StarFill, color: 'text-[#DD5B00]', sub: `${stats.totalReviews} ulasan peserta` },
    { label: 'Pertumbuhan Peserta', value: `+${stats.growth}%`, icon: TrendingUp, color: 'text-[#1AAE39]', sub: 'vs kuartal lalu' },
    { label: 'Tingkat Retensi Tim', value: '88%', icon: BarChart2Fill, color: 'text-[#0075DE]', sub: 'Penyelesaian lomba' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* ── 1. Document Header ───────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white border border-[#E6E6E6] flex items-center justify-center text-xl shadow-2xs">
            📈
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#000000]">
              Laporan Analitik & Demografi Peserta
            </h1>
            <p className="text-xs text-[#615D59]">
              Metrik performa pendaftaran, sebaran wilayah, dan efektivitas kompetisi
            </p>
          </div>
        </div>

        {/* Notion Callout Box */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] flex items-start gap-3 text-xs text-[#31302E] shadow-2xs mt-3">
          <span className="text-base leading-none">📊</span>
          <div className="flex-1 leading-relaxed">
            <strong className="text-[#000000]">Laporan Kuartal:</strong> Pertumbuhan pendaftaran meningkat sebesar <span className="text-[#1AAE39] font-bold">+15%</span> didorong oleh tingginya minat mahasiswa pada kategori Hackathon dan Business Plan.
          </div>
        </div>
      </div>

      {/* ── 2. KPI Metrics Grid ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-white border border-[#E6E6E6] p-4 space-y-2">
              <Skeleton className="w-1/2 h-3 rounded-xs" />
              <Skeleton className="w-3/4 h-6 rounded-xs" />
            </div>
          ))
        ) : (
          kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
                <div className="flex items-center justify-between text-xs text-[#615D59] mb-1">
                  <span>{card.label}</span>
                  <Icon size={14} className={card.color} />
                </div>
                <div className="text-2xl font-bold text-[#000000]">{card.value}</div>
                <p className="text-[10px] text-[#615D59] mt-0.5">{card.sub}</p>
              </div>
            );
          })
        )}
      </div>

      {/* ── 3. Distribution Breakdown Cards ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <NotionBarChart
          data={locationData}
          label="Sebaran Geografis Peserta"
          icon={Globe2}
        />
        <NotionBarChart
          data={educationData}
          label="Tingkat Jenjang Pendidikan"
          icon={GraduationCap}
        />
      </div>
    </div>
  );
}
