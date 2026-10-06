'use client';

// ============================================================
// RAIH — Notion Competition Detail Document Page
// Design System: Notion (design.md)
// Featuring Notion Page Properties, Callout Blocks, Document Body, and Timeline
// ============================================================
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Skeleton, Avatar, Chip } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  HeartFill,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Zap,
  Trophy,
  CheckCircle,
  Shield,
  Award,
  AlertCircle,
  ExternalLink,
  Mail,
  Star,
  DollarSign,
  FileText,
  Sparkles,
  CheckSquare,
  CheckSquareFill,
  Square,
  Download,
  Check,
} from '@/components/ui/icons';
import { competitionRepo, savedCompRepo, reviewRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { CompetitionWithDetails, Review } from '@/types';
import { CompetitionTimeline } from '@/components/features/competitions/CompetitionTimeline';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDeadlineTag(dateStr: string): { label: string; urgent: boolean } {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: 'Pendaftaran Ditutup', urgent: false };
  if (days === 0) return { label: 'Hari Terakhir!', urgent: true };
  if (days <= 3) return { label: `Sisa ${days} hari lagi`, urgent: true };
  return { label: `Sisa ${days} hari lagi`, urgent: false };
}

export default function NotionCompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const compId = Number(params?.id);

  const [comp, setComp] = useState<CompetitionWithDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && compId) {
      try {
        const stored = localStorage.getItem(`raih_checklist_${compId}`);
        if (stored) {
          setCheckedItems(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [compId]);

  const toggleCheckItem = (id: string) => {
    setCheckedItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      if (typeof window !== 'undefined' && compId) {
        localStorage.setItem(`raih_checklist_${compId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleDownloadTemplate = (templateName: string) => {
    setDownloadToast(`📥 Mengunduh berkas template: "${templateName}"`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      if (!compId) return;
      const [data, revs] = await Promise.all([
        competitionRepo.getById(compId),
        reviewRepo.getByCompetition(compId),
      ]);
      setComp(data);
      setReviews(revs);

      if (user) {
        const saved = await savedCompRepo.getByUser(user.id);
        setIsSaved(saved.some((s) => s.competition_id === compId));
      }
      setIsLoading(false);
    }
    loadData();
  }, [compId, user]);

  const toggleSave = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (isSaved) {
      await savedCompRepo.unsave(user.id, compId);
      setIsSaved(false);
    } else {
      await savedCompRepo.save(user.id, compId);
      setIsSaved(true);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-48 rounded-xl bg-[#EAE8E4]" />
        <Skeleton className="h-8 w-2/3 rounded-md bg-[#EAE8E4]" />
        <Skeleton className="h-24 rounded-lg bg-[#EAE8E4]" />
      </div>
    );
  }

  if (!comp) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold text-[#000000]">Kompetisi tidak ditemukan</p>
        <button
          onClick={() => router.push('/home')}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-full bg-[#0075DE] text-white"
        >
          Kembali ke Eksplor
        </button>
      </div>
    );
  }

  const deadline = formatDeadlineTag(comp.registration_deadline);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 right-8 z-50 bg-[#000000] text-white text-xs px-3.5 py-2 rounded-md shadow-md flex items-center gap-2"
          >
            <CheckCircle size={14} className="text-[#1AAE39]" />
            <span>Tautan berhasil disalin ke clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Navigation Bar ────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[#615D59] hover:text-[#000000] hover:bg-[#EAE8E4] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSave}
            className={`p-2 rounded-md border border-[#E6E6E6] bg-white hover:bg-[#F6F5F4] transition-colors ${
              isSaved ? 'text-[#DD5B00]' : 'text-[#615D59]'
            }`}
            title={isSaved ? 'Hapus Simpanan' : 'Simpan Lomba'}
          >
            {isSaved ? <HeartFill size={15} className="text-[#DD5B00]" /> : <Heart size={15} />}
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-md border border-[#E6E6E6] bg-white text-[#615D59] hover:text-[#000000] hover:bg-[#F6F5F4] transition-colors"
            title="Bagikan Tautan"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Notion Document Page Header ───────────────────── */}
      <div className="bg-white rounded-xl border border-[#E6E6E6] overflow-hidden shadow-2xs mb-6">
        {/* Cover Band / Poster */}
        <div className="h-44 sm:h-56 bg-[#213183] relative overflow-hidden flex items-center justify-center">
          {comp.banner_image ? (
            <img src={comp.banner_image} alt={comp.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/40">
              <Trophy size={48} />
              <span className="text-xs">Raih Competition Portal</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-[4px] shadow-sm ${
                deadline.urgent ? 'bg-[#DD5B00] text-white' : 'bg-white text-[#000000] border border-[#E6E6E6]'
              }`}
            >
              {deadline.label}
            </span>
          </div>
        </div>

        {/* Page Icon & Title */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 -mt-12 rounded-xl bg-white border border-[#E6E6E6] flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
              🏆
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF4FC] text-[#0075DE] border border-[#B3D8FA]">
                  {comp.category?.name ?? 'Umum'}
                </span>
                <span className="text-xs text-[#615D59]">
                  Diselenggarakan oleh <strong>{comp.organizer?.organization_name ?? 'Penyelenggara Terverifikasi'}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000] leading-snug">
                {comp.title}
              </h1>
            </div>
          </div>

          {/* ── Notion Properties Table (Database Page Attributes) ── */}
          <div className="my-6 p-4 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#615D59] block mb-1 flex items-center gap-1.5 text-[11px]">
                <Calendar size={13} className="text-[#0075DE]" /> Deadline
              </span>
              <span className="font-semibold text-[#000000]">
                {formatDate(comp.registration_deadline)}
              </span>
            </div>

            <div>
              <span className="text-[#615D59] block mb-1 flex items-center gap-1.5 text-[11px]">
                <DollarSign size={13} className="text-[#1AAE39]" /> Biaya
              </span>
              <span className="font-semibold text-[#000000]">
                {comp.registration_fee === 0 ? 'Gratis' : `Rp ${comp.registration_fee.toLocaleString('id-ID')}`}
              </span>
            </div>

            <div>
              <span className="text-[#615D59] block mb-1 flex items-center gap-1.5 text-[11px]">
                <Trophy size={13} className="text-[#DD5B00]" /> Total Hadiah
              </span>
              <span className="font-semibold text-[#000000]">
                {comp.prize_info ? comp.prize_info : 'Sertifikat & Hadiah'}
              </span>
            </div>

            <div>
              <span className="text-[#615D59] block mb-1 flex items-center gap-1.5 text-[11px]">
                <Users size={13} className="text-[#62AEF0]" /> Format
              </span>
              <span className="font-semibold text-[#000000] capitalize">
                {comp.comp_type === 'team' ? 'Tim' : 'Individu'}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E6E6E6]">
            <div className="text-xs text-[#615D59]">
              Pendaftaran resmi dibuka hingga batas waktu yang tertera di atas.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push('/teammates')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full border border-[#E6E6E6] bg-white hover:bg-[#F6F5F4] text-xs font-medium text-[#31302E] inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users size={14} className="text-[#0075DE]" />
                <span>Cari Tim</span>
              </button>

              <button
                onClick={() => router.push(`/competitions/${comp.id}/register`)}
                className="flex-1 sm:flex-none px-6 py-2 rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Daftar Sekarang</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Document Body & Notion Sections ───────────────── */}
      <div className="space-y-6">
        {/* Section: Deskripsi */}
        <section className="bg-white rounded-xl border border-[#E6E6E6] p-6 shadow-2xs">
          <h2 className="text-base font-bold text-[#000000] mb-3 flex items-center gap-2">
            <FileText size={17} className="text-[#0075DE]" />
            <span>Tentang Kompetisi</span>
          </h2>
          <div className="text-xs text-[#31302E] leading-relaxed whitespace-pre-line space-y-2">
            {comp.description}
          </div>
        </section>

        {/* Section: Timeline & Alur Acara */}
        <section className="bg-white rounded-xl border border-[#E6E6E6] p-6 shadow-2xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#000000] flex items-center gap-2">
              <Clock size={17} className="text-[#0075DE]" />
              <span>Timeline & Jadwal Kegiatan</span>
            </h2>
            <p className="text-xs text-[#615D59] mt-0.5">
              Jadwal pelaksanaan tahapan lomba dari pembukaan pendaftaran hingga babak final.
            </p>
          </div>

          <CompetitionTimeline
            competitionId={comp.id}
            timeline={comp.timeline ?? []}
            isOrganizer={user?.role === 'organizer' && user?.id === comp.organizer_id}
            onTimelineUpdated={(updated) => {
              setComp((prev) => (prev ? { ...prev, timeline: updated } : null));
            }}
          />
        </section>

        {/* Section: Checklist Persyaratan & Kelengkapan Berkas (Feedback Grid Solution) */}
        {(() => {
          const defaultItems = [
            {
              id: 'ktm',
              title: 'Kartu Tanda Mahasiswa (KTM) / Pelajar Aktif',
              category: 'Identitas',
              desc: 'Scan foto KTM atau kartu identitas resmi berformat PDF/JPG/PNG (Maksimal 5 MB).',
              template: null,
              required: true,
            },
            {
              id: 'surat_aktif',
              title: 'Surat Keterangan Mahasiswa Aktif',
              category: 'Administrasi',
              desc: 'Surat keterangan resmi bertanda tangan dekanat atau kaprodi tahun akademik berjalan.',
              template: 'Template_Surat_Keterangan_Mahasiswa_Aktif.docx',
              required: comp.form_settings?.require_surat_aktif ?? false,
            },
            {
              id: 'proposal',
              title: 'Draft Proposal Inovasi / Karya Tulis Ilmiah',
              category: 'Dokumen Karya',
              desc: 'Sesuai format dan template resmi penyelenggara (maksimal 15 halaman termasuk lampiran).',
              template: 'Template_Format_Proposal_Lomba.docx',
              required: comp.form_settings?.require_proposal ?? true,
            },
            {
              id: 'orisinalitas',
              title: 'Lembar Pernyataan Orisinalitas & Bebas Plagiarisme',
              category: 'Legalitas',
              desc: 'Surat pernyataan bertanda tangan seluruh anggota tim dan bermaterai Rp 10.000.',
              template: 'Format_Surat_Pernyataan_Orisinalitas.pdf',
              required: comp.form_settings?.require_statement_letter ?? true,
            },
            {
              id: 'twibbon',
              title: 'Publikasi Twibbon & Bukti Share Poster Lomba',
              category: 'Publikasi',
              desc: 'Screenshot posting feed/story Instagram dengan mention akun resmi lomba.',
              template: 'Aset_Frame_Twibbon_Resmi.png',
              required: comp.form_settings?.require_twibbon ?? false,
            },
          ];

          const extraReqs = (comp.requirements || []).map((req, idx) => ({
            id: `req_${req.id || idx}`,
            title: req.requirement_name,
            category: 'Syarat Khusus',
            desc: 'Ketentuan khusus yang ditetapkan oleh panitia penyelenggara lomba.',
            template: null,
            required: req.is_mandatory ?? true,
          }));

          const allItems = [...defaultItems, ...extraReqs];
          const completedCount = allItems.filter((item) => checkedItems[item.id]).length;
          const progressPct = Math.round((completedCount / allItems.length) * 100);
          const isAllCompleted = completedCount === allItems.length;

          return (
            <section className="bg-white rounded-xl border border-[#E6E6E6] p-6 shadow-2xs space-y-4">
              {/* Header & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E6] pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#000000] flex items-center gap-2">
                    <CheckSquare size={18} className="text-[#0075DE]" />
                    <span>Checklist Persyaratan & Kelengkapan Berkas</span>
                  </h2>
                  <p className="text-xs text-[#615D59] mt-0.5">
                    Centang berkas yang telah Anda siapkan sebelum membuka formulir pendaftaran.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      isAllCompleted
                        ? 'bg-[#EDF6EF] text-[#0F7B6C] border-[#0F7B6C]/30'
                        : 'bg-[#EBF4FC] text-[#0075DE] border-[#0075DE]/20'
                    }`}
                  >
                    {isAllCompleted ? '✓ Semua Berkas Siap!' : `${completedCount}/${allItems.length} Siap (${progressPct}%)`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-[#E6E6E6] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isAllCompleted ? 'bg-[#0F7B6C]' : 'bg-[#0075DE]'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#615D59]">
                  <span>Progress Kelengkapan Berkas</span>
                  <span>{progressPct}% Terpenuhi</span>
                </div>
              </div>

              {/* Toast when downloading template */}
              {downloadToast && (
                <div className="p-2.5 rounded-lg bg-[#EBF4FC] border border-[#0075DE]/30 text-xs text-[#0075DE] flex items-center gap-2">
                  <Download size={14} className="shrink-0" />
                  <span>{downloadToast}</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2.5 pt-1">
                {allItems.map((item) => {
                  const isChecked = checkedItems[item.id] ?? false;

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheckItem(item.id)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none flex items-start gap-3 ${
                        isChecked
                          ? 'bg-[#EDF6EF]/40 border-[#0F7B6C]/40'
                          : 'bg-white border-[#E6E6E6] hover:border-[#C4C4C0]'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-base shrink-0 focus:outline-hidden"
                      >
                        {isChecked ? (
                          <CheckSquareFill size={18} className="text-[#0F7B6C]" />
                        ) : (
                          <Square size={18} className="text-[#9B9A97] hover:text-[#31302E]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold ${
                              isChecked ? 'line-through text-[#615D59]' : 'text-[#000000]'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-[4px] bg-[#F6F5F4] text-[#615D59] border border-[#E6E6E6]">
                            {item.category}
                          </span>
                          {item.required && (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                              Wajib
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#615D59] mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>

                        {/* Template download link if available */}
                        {item.template && (
                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleDownloadTemplate(item.template!)}
                              className="text-[11px] font-semibold text-[#0075DE] hover:underline inline-flex items-center gap-1.5 bg-[#EBF4FC]/60 border border-[#0075DE]/20 px-2.5 py-1 rounded-[4px] transition-colors"
                            >
                              <Download size={12} />
                              <span>Unduh Dokumen: {item.template}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Call To Action */}
              <div className="pt-3 border-t border-[#E6E6E6] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F6F5F4] p-3.5 rounded-lg">
                <div className="text-xs text-[#31302E]">
                  {isAllCompleted ? (
                    <span className="font-semibold text-[#0F7B6C] flex items-center gap-1">
                      <Check size={14} /> Seluruh berkas siap! Anda dapat langsung mengisi formulir pendaftaran resmi.
                    </span>
                  ) : (
                    <span className="text-[#615D59]">
                      Tips: Anda dapat menggunakan fitur <strong>Auto-Fill</strong> di halaman registrasi untuk mempercepat pengunggahan berkas tersimpan.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/competitions/${comp.id}/register`)}
                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0"
                >
                  <span>Lanjut ke Form Pendaftaran</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </section>
          );
        })()}
      </div>
    </div>
  );
}
