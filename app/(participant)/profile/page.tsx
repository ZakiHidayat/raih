'use client';

// ============================================================
// RAIH — Notion User Workspace Profile
// Design System: Notion (design.md)
// Featuring Notion Document layout, Properties table, XP gamification & Streamline MingCute Icons
// ============================================================
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Progress } from '@heroui/react';
import { motion } from 'framer-motion';
import {
  Settings,
  LogOut,
  Trophy,
  Star,
  Award,
  Edit3,
  Zap,
  ChevronRight,
  Bell,
  HelpCircle,
  MapPin,
  GraduationCap,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Layers,
  FileText,
  Mail,
  User,
} from '@/components/ui/icons';
import { certificateRepo, xpRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { Certificate, XpTransaction } from '@/types';

// Notion Sticker Accent Badge Colors (from design.md)
const skillStickerStyles = [
  'bg-[#62AEF0]/15 text-[#005BAB] border-[#62AEF0]/30', // Sky
  'bg-[#D6B6F6]/25 text-[#391C57] border-[#D6B6F6]/50', // Purple
  'bg-[#FF64C8]/15 text-[#B8117A] border-[#FF64C8]/30', // Pink
  'bg-[#DD5B00]/15 text-[#793400] border-[#DD5B00]/30', // Orange
  'bg-[#2A9D99]/15 text-[#0E5250] border-[#2A9D99]/30', // Teal
  'bg-[#1AAE39]/15 text-[#0E6621] border-[#1AAE39]/30', // Green
];

export default function NotionProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [xpHistory, setXpHistory] = useState<XpTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    async function load() {
      const [certs, xp] = await Promise.all([
        certificateRepo.getByUser(user!.id),
        xpRepo.getByUser(user!.id),
      ]);
      setCertificates(certs);
      setXpHistory(xp.slice(0, 5));
      setIsLoading(false);
    }
    load();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!user) return null;

  const profile = user.participant_profile;
  const xp = profile?.xp_points ?? 0;
  const level = profile?.level ?? 1;
  const joined = profile?.competitions_joined ?? 0;
  const won = profile?.competitions_won ?? 0;
  const skills = profile?.skills?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];

  const xpForNextLevel = level * 500;
  const xpInCurrentLevel = xp % 500;
  const progressPercent = Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
      {/* ── 1. Notion Cover Banner ────────────────────────── */}
      <div className="relative h-36 sm:h-44 rounded-xl overflow-hidden bg-[#213183] border border-[#E6E6E6] shadow-xs">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={handleLogout}
            id="logout-btn"
            className="px-2.5 py-1 text-xs rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs border border-white/20 inline-flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={13} />
            <span>Ganti / Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* ── 2. Profile Avatar & Title (Notion Style) ─────── */}
      <div className="relative -mt-12 sm:-mt-14 px-4 sm:px-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E6E6E6]">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar
                src={user.profile_photo ?? undefined}
                name={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-white shadow-sm text-lg font-bold bg-white"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-[4px] bg-[#0075DE] text-white text-[10px] font-bold border border-white">
                Lv. {level}
              </span>
            </div>
            <div className="mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#000000]">
                {user.name}
              </h1>
              <p className="text-xs text-[#615D59]">
                {user.role === 'organizer' ? 'Penyelenggara Kompetisi' : 'Peserta Aktif & Talenta'} • Bergabung 2025
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/search')}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Sparkles size={13} />
              <span>Eksplor Lomba</span>
            </button>
          </div>
        </div>

        {/* ── 3. Notion Properties Table ───────────────────── */}
        <div className="py-4 space-y-2 text-xs border-b border-[#E6E6E6]">
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-1 py-1">
            <span className="text-[#615D59] flex items-center gap-1.5">
              <Mail size={13} className="text-[#A39E98]" />
              <span>Email</span>
            </span>
            <span className="text-[#000000] font-medium">{user.email}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-1 py-1">
            <span className="text-[#615D59] flex items-center gap-1.5">
              <GraduationCap size={13} className="text-[#A39E98]" />
              <span>Pendidikan</span>
            </span>
            <span className="text-[#000000] font-medium">
              {user.education_level ?? 'Mahasiswa S1 / Sederajat'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-1 py-1">
            <span className="text-[#615D59] flex items-center gap-1.5">
              <MapPin size={13} className="text-[#A39E98]" />
              <span>Domisili</span>
            </span>
            <span className="text-[#000000] font-medium">{user.location ?? 'Yogyakarta, Indonesia'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-1 py-1">
            <span className="text-[#615D59] flex items-center gap-1.5 mt-0.5">
              <Layers size={13} className="text-[#A39E98]" />
              <span>Keahlian</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skills.length > 0 ? (
                skills.map((skill, idx) => {
                  const style = skillStickerStyles[idx % skillStickerStyles.length];
                  return (
                    <span
                      key={skill}
                      className={`text-[10px] px-2 py-0.5 rounded-[4px] border font-medium ${style}`}
                    >
                      {skill}
                    </span>
                  );
                })
              ) : (
                <span className="text-[#A39E98]">Belum menambahkan keahlian</span>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Notion Callout / Bio ──────────────────────── */}
        {profile?.bio && (
          <div className="p-3.5 my-4 rounded-lg bg-white border border-[#E6E6E6] flex items-start gap-3 text-xs text-[#31302E] shadow-2xs">
            <span className="text-base leading-none">💬</span>
            <div className="flex-1 leading-relaxed">
              <strong className="text-[#000000] block mb-0.5">Tentang Saya:</strong>
              {profile.bio}
            </div>
          </div>
        )}

        {/* ── 5. KPI & Gamification Section ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
          <div className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
            <div className="flex items-center justify-between text-[#615D59] text-xs mb-1">
              <span>Lomba Diikuti</span>
              <Award size={14} className="text-[#0075DE]" />
            </div>
            <div className="text-2xl font-bold text-[#000000]">{joined}</div>
            <p className="text-[10px] text-[#A39E98] mt-0.5">Partisipasi aktif</p>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
            <div className="flex items-center justify-between text-[#615D59] text-xs mb-1">
              <span>Juara & Menang</span>
              <Trophy size={14} className="text-[#DD5B00]" />
            </div>
            <div className="text-2xl font-bold text-[#000000]">{won}</div>
            <p className="text-[10px] text-[#A39E98] mt-0.5">Penghargaan podium</p>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
            <div className="flex items-center justify-between text-[#615D59] text-xs mb-1">
              <span>Total Prestasi XP</span>
              <Zap size={14} className="text-[#1AAE39]" />
            </div>
            <div className="text-2xl font-bold text-[#000000]">{xp}</div>
            <p className="text-[10px] text-[#A39E98] mt-0.5">Level saat ini: {level}</p>
          </div>
        </div>

        {/* ── 6. XP Progress & History ─────────────────────── */}
        <div className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#000000] flex items-center gap-1.5">
              <Star size={14} className="text-[#DD5B00]" />
              <span>Progres Level {level} ke Level {level + 1}</span>
            </span>
            <span className="text-[#615D59] font-medium">
              {xpInCurrentLevel} / {xpForNextLevel} XP
            </span>
          </div>

          <Progress
            value={progressPercent}
            size="sm"
            classNames={{
              track: 'bg-[#F6F5F4] border border-[#E6E6E6]',
              indicator: 'bg-[#0075DE]',
            }}
          />

          <p className="text-[11px] text-[#615D59] mt-2">
            Butuh <strong>{xpForNextLevel - xpInCurrentLevel} XP</strong> lagi untuk membuka badge tingkat berikutnya.
          </p>

          {xpHistory.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#E6E6E6]">
              <p className="text-xs font-semibold text-[#31302E] mb-2">Riwayat XP Terbaru:</p>
              <div className="space-y-1.5">
                {xpHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs text-[#615D59]">
                    <span className="truncate mr-2">• {tx.reason}</span>
                    <span className="text-[#1AAE39] font-bold">+{tx.xp_earned} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 7. Certificates Gallery ───────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#000000] flex items-center gap-2">
              <Award size={16} className="text-[#0075DE]" />
              <span>Sertifikat & Portofolio Digital ({certificates.length})</span>
            </h2>
          </div>

          {certificates.length === 0 ? (
            <div className="p-8 text-center rounded-lg bg-white border border-[#E6E6E6]">
              <span className="text-3xl block mb-2">📜</span>
              <p className="text-xs font-semibold text-[#000000]">Belum ada sertifikat terbit</p>
              <p className="text-[11px] text-[#615D59] mt-0.5">
                Ikuti kompetisi hingga babak final untuk mendapatkan sertifikat digital terverifikasi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-lg bg-white border border-[#E6E6E6] hover:border-[#0075DE]/40 transition-colors shadow-2xs flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-md bg-[#EBF4FC] text-[#0075DE] flex items-center justify-center flex-shrink-0">
                    <Award size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#000000] truncate">
                      Sertifikat Partisipasi #{cert.competition_id}
                    </p>
                    <p className="text-[11px] text-[#615D59] mt-0.5">
                      Diterbitkan: {new Date(cert.issued_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-[4px] bg-[#1AAE39]/10 text-[#0E6621] font-semibold border border-[#1AAE39]/30">
                      ✓ Sah & Terverifikasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
