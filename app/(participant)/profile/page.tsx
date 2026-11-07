'use client';

// ============================================================
// RAIH — Participant Profile & Prestasi
// Design System: Notion (design.md) & Strictly NO Gradients
// Featuring Unified Cover, Clean Identity Header, KPI Metrics,
// 2-Column Balanced Architecture, Interactive Edit Profile & Certificate Credential Modal
// ============================================================
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Progress, Button, Input, Textarea } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle2,
  Layers,
  FileText,
  Mail,
  User,
  Share2,
  Download,
  Plus,
  X,
  Clock,
  Shield,
  Heart,
  Users,
  Compass,
} from '@/components/ui/icons';
import { certificateRepo, xpRepo, registrationRepo, competitionRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { Certificate, XpTransaction, RegistrationWithDetails, Competition } from '@/types';

// Notion Clean Accent Styles for Skills & Badges (Strictly NO Gradients)
const skillChipStyles = [
  'bg-[#EBF4FC] text-[#005BAB] border-[#B3D8FA]',
  'bg-[#F3EBF9] text-[#4A154B] border-[#D6B6F6]',
  'bg-[#FDF2F8] text-[#9D174D] border-[#FBCFE8]',
  'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]',
  'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
  'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
];

export default function ParticipantProfilePage() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [xpHistory, setXpHistory] = useState<XpTransaction[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [competitionsMap, setCompetitionsMap] = useState<Record<number, Competition>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'certificates' | 'xp' | 'competitions'>('overview');

  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<{ cert: Certificate; compTitle: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSkills, setEditSkills] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Populate initial edit form
    setEditName(user.name);
    setEditBio(user.participant_profile?.bio ?? '');
    setEditEducation(user.education_level ?? 'S1 Teknik Informatika');
    setEditLocation(user.location ?? 'Jakarta, Indonesia');
    setEditSkills(user.participant_profile?.skills ?? 'Python, JavaScript, Machine Learning, UI/UX');

    async function loadData() {
      try {
        const [certs, xp, regs, allComps] = await Promise.all([
          certificateRepo.getByUser(user!.id),
          xpRepo.getByUser(user!.id),
          registrationRepo.getByUser(user!.id),
          competitionRepo.getAll(),
        ]);

        const compMap: Record<number, Competition> = {};
        allComps.forEach((c) => {
          compMap[c.id] = c;
        });

        setCertificates(certs);
        setXpHistory(xp.slice(0, 6));
        setUserRegistrations(regs);
        setCompetitionsMap(compMap);
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Tautan profil berhasil disalin ke clipboard!');
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;
    const updatedSkills = editSkills.trim();
    const updatedBio = editBio.trim();

    updateProfile({
      name: editName.trim() || user.name,
      education_level: editEducation.trim() || user.education_level,
      location: editLocation.trim() || user.location,
      participant_profile: user.participant_profile
        ? {
            ...user.participant_profile,
            bio: updatedBio,
            skills: updatedSkills,
          }
        : undefined,
    });

    setIsEditModalOpen(false);
    showToast('Profil berhasil diperbarui!');
  };

  if (!user) return null;

  const profile = user.participant_profile;
  const xp = profile?.xp_points ?? 1250;
  const level = profile?.level ?? 5;
  const joined = profile?.competitions_joined ?? 12;
  const won = profile?.competitions_won ?? 3;
  const skills = (profile?.skills ?? 'Python, JavaScript, Machine Learning, UI/UX')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const xpForNextLevel = level * 500;
  const xpInCurrentLevel = xp % 500;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100));

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-16">
      {/* ── Toast Notification ─────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#201E3D] text-white text-xs font-semibold shadow-lg flex items-center gap-2 border border-white/20"
          >
            <CheckCircle2 size={15} className="text-[#1AAE39]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* ── 1. Unified Cover & Identity Banner ──────────────── */}
        <div className="bg-white rounded-2xl border border-[#EAEAEF] shadow-xs overflow-hidden mb-6">
          {/* Cover Header Band (Clean Solid Brand Navy - Strictly NO Gradients) */}
          <div className="relative h-36 sm:h-44 bg-[#201E3D] px-4 sm:px-6 py-4 flex items-start justify-between">
            {/* Subtle decorative geometric badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-semibold border border-white/15 backdrop-blur-xs flex items-center gap-1.5">
                <Shield size={12} className="text-[#0075DE]" />
                <span>Profil Talenta Terverifikasi Raih</span>
              </span>
            </div>

            {/* Quick Actions in Banner Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-white text-[#201E3D] hover:bg-[#F6F5F4] text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                title="Edit Profil Lengkap"
              >
                <Edit3 size={13} className="text-[#0075DE]" />
                <span>Edit Profil</span>
              </button>

              <button
                onClick={handleShareProfile}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 inline-flex items-center justify-center transition-colors"
                title="Bagikan Tautan Profil"
              >
                <Share2 size={14} />
              </button>

              <button
                onClick={handleLogout}
                id="logout-btn"
                className="px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white text-xs font-medium border border-white/15 inline-flex items-center gap-1.5 transition-colors"
                title="Keluar dari Akun"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>

          {/* Profile Identity Bar (Directly below Cover, clean overlap) */}
          <div className="px-5 sm:px-8 pb-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              {/* Avatar + Name Block */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="relative inline-block self-start -mt-16 sm:-mt-20">
                  <Avatar
                    src={user.profile_photo ?? undefined}
                    name={user.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white shadow-md text-2xl font-bold bg-[#F6F5F4] text-[#201E3D]"
                  />
                  {/* Status Indicator & Level Badge */}
                  <span
                    className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-[#201E3D] text-[#FFB84D] text-[11px] font-black border-2 border-white shadow-xs flex items-center gap-1"
                    title={`Level ${level} Competitor`}
                  >
                    <Star size={11} className="text-[#FFB84D]" />
                    <span>Lv.{level}</span>
                  </span>
                </div>

                <div className="space-y-1 sm:pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000000] tracking-tight">
                      {user.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#EBF4FC] text-[#0075DE] border border-[#B3D8FA]">
                      {user.role === 'organizer' ? 'Penyelenggara Resmi' : 'Talenta Mahasiswa'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#615D59]">
                    <span>@{user.email.split('@')[0]}</span>
                    <span className="mx-2">•</span>
                    <span>Peserta Aktif Kompetisi Nasional & Internasional</span>
                  </p>
                </div>
              </div>

              {/* Status Indicator & Quick Action */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1AAE39] animate-pulse" />
                  <span>Terbuka untuk Tim</span>
                </span>
                <Link
                  href="/teammates"
                  className="px-4 py-1.5 rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Users size={13} />
                  <span>Cari Rekan Tim</span>
                </Link>
              </div>
            </div>

            {/* Quick Meta Row (Pendidikan, Domisili, Email) */}
            <div className="pt-3 border-t border-[#EAEAEF] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#615D59]">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-[#0075DE]" />
                <span className="text-[#000000] font-medium">{user.email}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} className="text-[#DD5B00]" />
                <span className="text-[#000000] font-medium">{user.education_level ?? 'S1 Teknik Informatika'}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#1AAE39]" />
                <span className="text-[#000000] font-medium">{user.location ?? 'Jakarta, Indonesia'}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#615D59]" />
                <span>Anggota sejak 2025</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. Performance & KPI Metrics Strip ────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {/* Card 1: Lomba Diikuti */}
          <div className="p-4 rounded-xl bg-white border border-[#EAEAEF] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EBF4FC] text-[#0075DE] flex items-center justify-center flex-shrink-0">
              <Award size={20} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#615D59] uppercase tracking-wide block">
                Lomba Diikuti
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#000000]">{joined}</span>
                <span className="text-xs text-[#1AAE39] font-semibold">Kompetisi</span>
              </div>
            </div>
          </div>

          {/* Card 2: Juara & Podium */}
          <div className="p-4 rounded-xl bg-white border border-[#EAEAEF] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] text-[#DD5B00] flex items-center justify-center flex-shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#615D59] uppercase tracking-wide block">
                Juara & Menang
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#000000]">{won}</span>
                <span className="text-xs text-[#DD5B00] font-semibold">Penghargaan</span>
              </div>
            </div>
          </div>

          {/* Card 3: Prestasi XP */}
          <div className="p-4 rounded-xl bg-white border border-[#EAEAEF] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] text-[#1AAE39] flex items-center justify-center flex-shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#615D59] uppercase tracking-wide block">
                Prestasi XP
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#000000]">{xp}</span>
                <span className="text-xs text-[#615D59] font-medium">Poin</span>
              </div>
            </div>
          </div>

          {/* Card 4: Sertifikat Sah */}
          <div className="p-4 rounded-xl bg-white border border-[#EAEAEF] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#F3EBF9] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#615D59] uppercase tracking-wide block">
                Sertifikat Sah
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#000000]">{certificates.length}</span>
                <span className="text-xs text-[#7C3AED] font-semibold">Kredensial</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Navigation Tabs ────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-[#EAEAEF] pb-2 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#201E3D] text-white shadow-xs'
                : 'bg-white text-[#615D59] hover:bg-[#F6F5F4] border border-[#EAEAEF]'
            }`}
          >
            <Compass size={14} />
            <span>Ikhtisar & Portofolio</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'certificates'
                ? 'bg-[#201E3D] text-white shadow-xs'
                : 'bg-white text-[#615D59] hover:bg-[#F6F5F4] border border-[#EAEAEF]'
            }`}
          >
            <Award size={14} />
            <span>Sertifikat Digital ({certificates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('xp')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'xp'
                ? 'bg-[#201E3D] text-white shadow-xs'
                : 'bg-white text-[#615D59] hover:bg-[#F6F5F4] border border-[#EAEAEF]'
            }`}
          >
            <Zap size={14} />
            <span>Gamifikasi & XP Level</span>
          </button>

          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'competitions'
                ? 'bg-[#201E3D] text-white shadow-xs'
                : 'bg-white text-[#615D59] hover:bg-[#F6F5F4] border border-[#EAEAEF]'
            }`}
          >
            <Clock size={14} />
            <span>Kompetisi Saya ({userRegistrations.length})</span>
          </button>
        </div>

        {/* ── 4. Main Content Body ──────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 of 12 cols): Personal Bio, Skills & Contact */}
            <div className="lg:col-span-5 space-y-6">
              {/* Tentang Saya (Bio) */}
              <div className="p-5 rounded-xl bg-white border border-[#EAEAEF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-[#0075DE]" />
                    <span>Tentang Saya</span>
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-[11px] text-[#0075DE] hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F6F5F4] border border-[#EAEAEF] text-xs text-[#31302E] leading-relaxed">
                  <p className="italic">
                    "{profile?.bio || 'Mahasiswa Teknik Informatika, suka competitive programming, hackathon, dan inovasi teknologi digital.'}"
                  </p>
                </div>
              </div>

              {/* Keahlian & Minat */}
              <div className="p-5 rounded-xl bg-white border border-[#EAEAEF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-[#0075DE]" />
                    <span>Keahlian & Minat</span>
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-[11px] text-[#0075DE] hover:underline font-semibold"
                  >
                    Kelola
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.length > 0 ? (
                    skills.map((skill, idx) => (
                      <span
                        key={skill}
                        className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${
                          skillChipStyles[idx % skillChipStyles.length]
                        }`}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#A39E98]">Belum menambahkan keahlian.</span>
                  )}
                </div>
              </div>

              {/* Biodata & Informasi Detail */}
              <div className="p-5 rounded-xl bg-white border border-[#EAEAEF] shadow-xs space-y-3.5">
                <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-[#0075DE]" />
                  <span>Informasi Detail Akun</span>
                </h3>

                <div className="space-y-2.5 text-xs divide-y divide-[#F0F0F5]">
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#615D59]">Nama Lengkap</span>
                    <span className="text-[#000000] font-semibold">{user.name}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#615D59]">Jenjang Pendidikan</span>
                    <span className="text-[#000000] font-semibold">{user.education_level ?? 'S1'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#615D59]">Kota Domisili</span>
                    <span className="text-[#000000] font-semibold">{user.location ?? 'Jakarta'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#615D59]">Status Partisipasi</span>
                    <span className="text-[#166534] bg-[#F0FDF4] px-2 py-0.5 rounded font-semibold text-[11px] border border-[#BBF7D0]">
                      Aktif & Mencari Tim
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="p-4 rounded-xl bg-[#F6F5F4] border border-[#EAEAEF] space-y-2 text-xs">
                <span className="text-[11px] font-bold text-[#615D59] uppercase tracking-wide block">
                  Aksi Cepat Peserta
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/saved"
                    className="p-2.5 rounded-lg bg-white border border-[#EAEAEF] hover:border-[#0075DE] text-[#000000] font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Heart size={14} className="text-[#DD5B00]" />
                    <span>Lomba Disimpan</span>
                  </Link>
                  <Link
                    href="/activity"
                    className="p-2.5 rounded-lg bg-white border border-[#EAEAEF] hover:border-[#0075DE] text-[#000000] font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Clock size={14} className="text-[#0075DE]" />
                    <span>Aktivitas Saya</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column (7 of 12 cols): Gamification, XP Progress, Certificates, Recent Activity */}
            <div className="lg:col-span-7 space-y-6">
              {/* Gamification: XP Progress Card */}
              <div className="p-5 rounded-xl bg-white border border-[#EAEAEF] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                      <Star size={14} className="text-[#DD5B00]" />
                      <span>Progres Prestasi Level {level}</span>
                    </h3>
                    <p className="text-[11px] text-[#615D59] mt-0.5">
                      Kumpulkan XP dari pendaftaran dan kemenangan lomba untuk naik peringkat.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FFF7ED] text-[#9A3412] font-black text-xs border border-[#FED7AA]">
                    Level {level}
                  </span>
                </div>

                {/* Progress Bar (Strictly Solid) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#0075DE]">{xpInCurrentLevel} XP</span>
                    <span className="text-[#615D59]">{xpForNextLevel} XP (Target Level {level + 1})</span>
                  </div>
                  <Progress
                    value={progressPercent}
                    size="md"
                    classNames={{
                      track: 'bg-[#F0F0F5] border border-[#EAEAEF]',
                      indicator: 'bg-[#0075DE]',
                    }}
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#615D59] pt-1">
                    <span>
                      Butuh <strong>{xpForNextLevel - xpInCurrentLevel} XP</strong> lagi ke Level {level + 1}
                    </span>
                    <span className="font-bold text-[#000000]">{progressPercent}% selesai</span>
                  </div>
                </div>

                {/* XP History Snapshot */}
                {xpHistory.length > 0 && (
                  <div className="pt-3 border-t border-[#EAEAEF] space-y-2">
                    <span className="text-[11px] font-bold text-[#615D59] uppercase tracking-wide block">
                      Riwayat Perolehan XP Terbaru:
                    </span>
                    <div className="space-y-2">
                      {xpHistory.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-lg bg-[#FAFAFC] border border-[#EAEAEF] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-[#F0FDF4] text-[#166534] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              +
                            </span>
                            <span className="text-[#31302E] truncate font-medium">{item.reason}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-[#F0FDF4] text-[#166534] font-black text-xs border border-[#BBF7D0] flex-shrink-0">
                            +{item.xp_earned} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sertifikat Digital & Portofolio (Snapshot) */}
              <div className="p-5 rounded-xl bg-white border border-[#EAEAEF] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} className="text-[#0075DE]" />
                    <span>Sertifikat Digital Terverifikasi ({certificates.length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className="text-[11px] text-[#0075DE] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                {certificates.length === 0 ? (
                  <div className="p-6 text-center rounded-lg border border-dashed border-[#EAEAEF] bg-[#FAFAFC]">
                    <Award size={24} className="mx-auto text-[#A39E98] mb-1.5" />
                    <p className="text-xs font-bold text-[#000000]">Belum ada sertifikat terbit</p>
                    <p className="text-[11px] text-[#615D59] mt-0.5">
                      Ikuti kompetisi hingga tahap selesai untuk memperoleh sertifikat digital resmi.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {certificates.slice(0, 2).map((cert) => {
                      const comp = competitionsMap[cert.competition_id];
                      const compTitle = comp?.title || `Kompetisi Nasional #${cert.competition_id}`;

                      return (
                        <div
                          key={cert.id}
                          className="p-3.5 rounded-xl border border-[#EAEAEF] bg-white hover:border-[#0075DE] transition-colors shadow-2xs flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                                ✓ Terverifikasi
                              </span>
                              <span className="text-[10px] text-[#615D59]">
                                {new Date(cert.issued_at).toLocaleDateString('id-ID', {
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-[#000000] line-clamp-2 leading-snug">
                              {compTitle}
                            </p>
                          </div>

                          <button
                            onClick={() => setSelectedCert({ cert, compTitle })}
                            className="mt-3 w-full py-1.5 rounded-lg border border-[#EAEAEF] bg-[#F6F5F4] hover:bg-[#EBF4FC] hover:text-[#0075DE] hover:border-[#0075DE] text-xs font-semibold text-[#31302E] inline-flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ExternalLink size={12} />
                            <span>Buka Kredensial</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kompetisi Terdaftar Terkini */}
              <div className="p-5 rounded-xl bg-white border border-[#EAEAEF] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-[#0075DE]" />
                    <span>Kompetisi Terdaftar Terkini</span>
                  </h3>
                  <Link
                    href="/activity"
                    className="text-[11px] text-[#0075DE] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Ke Dashboard Aktivitas</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {userRegistrations.slice(0, 3).map((reg) => {
                    const compTitle = reg.competition?.title || `Kompetisi #${reg.competition_id}`;
                    const isApproved = reg.status === 'approved';

                    return (
                      <div
                        key={reg.id}
                        className="p-3 rounded-lg border border-[#EAEAEF] bg-white flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-[#000000] truncate">{compTitle}</p>
                          <p className="text-[11px] text-[#615D59] mt-0.5">
                            Terdaftar: {new Date(reg.registered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${
                            isApproved
                              ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                              : 'bg-[#FFF7ED] text-[#9A3412] border border-[#FED7AA]'
                          }`}
                        >
                          {isApproved ? '✓ Disetujui' : 'Menunggu'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Sertifikat Digital Penuh ─────────────────── */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white border border-[#EAEAEF] shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#000000]">Koleksi Sertifikat Digital Resmi</h2>
                <p className="text-xs text-[#615D59] mt-0.5">
                  Setiap sertifikat diterbitkan dengan tanda tangan digital terenkripsi yang dapat dibagikan ke LinkedIn atau CV.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF4FC] text-[#0075DE] border border-[#B3D8FA]">
                {certificates.length} Sertifikat Terverifikasi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => {
                const comp = competitionsMap[cert.competition_id];
                const compTitle = comp?.title || `Kompetisi Nasional #${cert.competition_id}`;

                return (
                  <div
                    key={cert.id}
                    className="p-5 rounded-xl border border-[#EAEAEF] bg-white shadow-xs hover:border-[#0075DE] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] inline-flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-[#1AAE39]" />
                          <span>Kredensial Terverifikasi</span>
                        </span>
                        <span className="text-xs text-[#615D59]">
                          ID: RAIH-{cert.id}-2025
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#000000] mb-2 leading-snug">
                        {compTitle}
                      </h3>

                      <p className="text-xs text-[#615D59] mb-4">
                        Diterbitkan resmi untuk <strong>{user.name}</strong> atas partisipasi dan pencapaian kompetisi.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EAEAEF] flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#A39E98]">
                        Terbit: {new Date(cert.issued_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>

                      <button
                        onClick={() => setSelectedCert({ cert, compTitle })}
                        className="px-4 py-2 rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ExternalLink size={13} />
                        <span>Lihat Sertifikat</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab: Riwayat Gamifikasi & XP ──────────────────── */}
        {activeTab === 'xp' && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-white border border-[#EAEAEF] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#000000]">Sistem Gamifikasi & Prestasi XP Raih</h2>
                  <p className="text-xs text-[#615D59] mt-0.5">
                    Tingkat keaktifanmu diukur berdasarkan partisipasi, pendaftaran tim, dan kemenangan kompetisi.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#000000]">{xp} XP</span>
                  <span className="text-xs text-[#DD5B00] font-bold block">Level {level} Competitor</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-2">
                <Progress
                  value={progressPercent}
                  size="md"
                  classNames={{
                    track: 'bg-[#F0F0F5] border border-[#EAEAEF]',
                    indicator: 'bg-[#0075DE]',
                  }}
                />
                <div className="flex items-center justify-between text-xs text-[#615D59]">
                  <span>{xpInCurrentLevel} XP</span>
                  <span>{xpForNextLevel} XP Target</span>
                </div>
              </div>
            </div>

            {/* Riwayat Transaksi Lengkap */}
            <div className="p-5 rounded-xl bg-white border border-[#EAEAEF] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
                Log Riwayat Perolehan XP Lengkap
              </h3>

              <div className="divide-y divide-[#EAEAEF]">
                {xpHistory.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-[#000000]">{item.reason}</p>
                      <p className="text-[11px] text-[#615D59] mt-0.5">
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#F0FDF4] text-[#166534] font-black text-xs border border-[#BBF7D0]">
                      +{item.xp_earned} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Kompetisi Terdaftar ──────────────────────── */}
        {activeTab === 'competitions' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white border border-[#EAEAEF] shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#000000]">Daftar Partisipasi Lomba</h2>
                <p className="text-xs text-[#615D59] mt-0.5">
                  Seluruh kompetisi yang pernah dan sedang kamu ikuti di platform Raih.
                </p>
              </div>
              <Link
                href="/search"
                className="px-3.5 py-1.5 rounded-full bg-[#0075DE] text-white text-xs font-bold hover:bg-[#005BAB] transition-colors"
              >
                + Ikuti Lomba Baru
              </Link>
            </div>

            <div className="space-y-3">
              {userRegistrations.map((reg) => {
                const comp = reg.competition;
                const isApproved = reg.status === 'approved';

                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-xl bg-white border border-[#EAEAEF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                              : 'bg-[#FFF7ED] text-[#9A3412] border border-[#FED7AA]'
                          }`}
                        >
                          {isApproved ? '✓ Terverifikasi & Disetujui' : 'Menunggu Verifikasi'}
                        </span>
                        <span className="text-[11px] text-[#615D59]">
                          ID Pendaftaran: #{reg.id}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#000000]">{comp?.title || `Kompetisi #${reg.competition_id}`}</h3>
                      <p className="text-xs text-[#615D59] mt-0.5">
                        Format: {reg.team_id ? 'Tim Kolaborasi' : 'Individu'} • Biaya: {comp?.registration_fee === 0 ? 'Gratis' : `Rp ${comp?.registration_fee?.toLocaleString('id-ID')}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Link
                        href={`/competitions/${reg.competition_id}`}
                        className="px-4 py-2 rounded-full border border-[#EAEAEF] hover:bg-[#F6F5F4] text-xs font-semibold text-[#000000] transition-colors"
                      >
                        Detail Lomba
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL 1: Edit Profil Lengkap ───────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-2xl border border-[#EAEAEF] shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 bg-[#F6F5F4] border-b border-[#EAEAEF] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#000000] flex items-center gap-1.5">
                    <Edit3 size={15} className="text-[#0075DE]" />
                    <span>Edit Profil & Portofolio Peserta</span>
                  </h3>
                  <p className="text-[11px] text-[#615D59]">
                    Perbarui identitas, keahlian, dan deskripsi singkat dirimu.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-md text-[#615D59] hover:text-[#000000] hover:bg-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 overflow-y-auto">
                <Input
                  label="Nama Lengkap"
                  value={editName}
                  onValueChange={setEditName}
                  classNames={{ inputWrapper: 'rounded-lg border-[#EAEAEF] h-10' }}
                />

                <Textarea
                  label="Bio / Tentang Saya"
                  placeholder="Tuliskan latar belakang, minat lomba, dan bidang yang kamu minati..."
                  value={editBio}
                  onValueChange={setEditBio}
                  minRows={3}
                  classNames={{ inputWrapper: 'rounded-lg border-[#EAEAEF]' }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Jenjang Pendidikan"
                    placeholder="e.g. S1 Teknik Informatika"
                    value={editEducation}
                    onValueChange={setEditEducation}
                    classNames={{ inputWrapper: 'rounded-lg border-[#EAEAEF] h-10' }}
                  />

                  <Input
                    label="Kota Domisili"
                    placeholder="e.g. Jakarta, Indonesia"
                    value={editLocation}
                    onValueChange={setEditLocation}
                    classNames={{ inputWrapper: 'rounded-lg border-[#EAEAEF] h-10' }}
                  />
                </div>

                <div>
                  <Input
                    label="Keahlian & Kemampuan (Pisahkan dengan koma)"
                    placeholder="e.g. Python, UI/UX, Public Speaking, Machine Learning"
                    value={editSkills}
                    onValueChange={setEditSkills}
                    classNames={{ inputWrapper: 'rounded-lg border-[#EAEAEF] h-10' }}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {editSkills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((skill, idx) => (
                        <span
                          key={skill + idx}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EBF4FC] text-[#0075DE] border border-[#B3D8FA]"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 bg-[#F6F5F4] border-t border-[#EAEAEF] flex items-center justify-end gap-2.5">
                <Button
                  size="sm"
                  variant="bordered"
                  className="rounded-full border-[#EAEAEF] text-xs font-semibold text-[#615D59]"
                  onPress={() => setIsEditModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-bold px-5"
                  onPress={handleSaveProfile}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: Certificate Credential Preview ────────── */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-white rounded-2xl border border-[#EAEAEF] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Certificate Canvas Frame */}
              <div className="p-6 sm:p-8 bg-[#F6F5F4] border-b border-[#EAEAEF] text-center relative">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 hover:bg-white text-[#615D59] hover:text-[#000000]"
                >
                  <X size={16} />
                </button>

                <div className="max-w-md mx-auto p-6 rounded-xl bg-white border-2 border-[#D6B6F6] shadow-sm space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EBF4FC] text-[#0075DE] mx-auto flex items-center justify-center">
                    <Award size={24} />
                  </div>

                  <span className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-widest block">
                    SERTIFIKAT PENGHARGAAN RESMI
                  </span>

                  <h2 className="text-xl font-black text-[#000000]">
                    {user.name}
                  </h2>

                  <p className="text-xs text-[#615D59]">
                    Diberikan atas partisipasi dan dedikasi luar biasa dalam kompetisi:
                  </p>

                  <p className="text-sm font-bold text-[#0075DE]">
                    {selectedCert.compTitle}
                  </p>

                  <div className="pt-3 border-t border-[#F0F0F5] flex items-center justify-between text-[10px] text-[#A39E98]">
                    <span>ID: RAIH-{selectedCert.cert.id}-VERIFIED</span>
                    <span>Status: Terdaftar Sah</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-white flex items-center justify-between gap-3">
                <div className="text-xs text-[#615D59] flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#1AAE39]" />
                  <span>Kredensial dapat divalidasi publik</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="bordered"
                    className="rounded-full border-[#EAEAEF] text-xs font-semibold"
                    onPress={() => {
                      navigator.clipboard?.writeText(window.location.origin + `/certificates/${selectedCert.cert.id}`);
                      showToast('Tautan kredensial sertifikat berhasil disalin!');
                    }}
                  >
                    Salin Tautan
                  </Button>

                  <Button
                    size="sm"
                    className="rounded-full bg-[#0075DE] text-white text-xs font-bold"
                    onPress={() => {
                      showToast('Mengunduh sertifikat digital...');
                      setTimeout(() => setSelectedCert(null), 1000);
                    }}
                  >
                    <Download size={13} />
                    <span>Unduh PDF</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
