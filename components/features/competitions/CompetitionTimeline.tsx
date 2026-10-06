'use client';

// ============================================================
// RAIH — Competition Timeline Component & Organizer Manager
// Modern, interactive timeline display with full organizer editing
// ============================================================
import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  addToast,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  MapPin,
  Flame,
  Layers,
  Check,
  AlertCircle,
  ExternalLink,
} from '@/components/ui/icons';
import type { CompetitionTimelineItem, TimelineStatus } from '@/types';
import { competitionRepo } from '@/lib/repositories/local';

interface CompetitionTimelineProps {
  competitionId: number;
  timeline: CompetitionTimelineItem[];
  isOrganizer?: boolean;
  onTimelineUpdated?: (updated: CompetitionTimelineItem[]) => void;
}

// Preset templates for quick organizer setup
const TIMELINE_PRESETS: {
  name: string;
  badge: string;
  items: Array<{ title: string; description: string; durationDays: number; location: string }>;
}[] = [
  {
    name: 'Hackathon / Coding',
    badge: '💻 Hackathon',
    items: [
      {
        title: 'Pendaftaran & Pengumpulan Proposal',
        description: 'Registrasi tim secara online dan pengunggahan proposal gagasan solusi inovatif.',
        durationDays: 14,
        location: 'Portal Raih',
      },
      {
        title: 'Pengumuman 20 Tim Finalis',
        description: 'Penyaringan ide terbaik oleh tim reviewer independen.',
        durationDays: 2,
        location: 'Email & Website',
      },
      {
        title: 'Technical Meeting & Pembekalan API',
        description: 'Briefing teknis tata tertib, penyediaan API dataset, dan sesi tanya jawab.',
        durationDays: 1,
        location: 'Zoom Cloud Meeting',
      },
      {
        title: 'Hackathon 48 Jam Non-stop',
        description: 'Waktu pengerjaan prototype aplikasi fungsional bersama tim secara intensif.',
        durationDays: 2,
        location: 'Discord / GitHub Classroom',
      },
      {
        title: 'Grand Final Pitching & Awarding',
        description: 'Presentasi langsung 5 tim dengan skor tertinggi di hadapan dewan juri.',
        durationDays: 1,
        location: 'Live Zoom & YouTube',
      },
    ],
  },
  {
    name: 'Karya Tulis / LKTI',
    badge: '📄 LKTI',
    items: [
      {
        title: 'Pendaftaran & Pengumpulan Abstrak',
        description: 'Pendaftaran peserta dan pengumpulan naskah abstrak karya ilmiah (bebas biaya).',
        durationDays: 15,
        location: 'Portal Raih',
      },
      {
        title: 'Pengumuman Lolos Abstrak',
        description: 'Pengumuman daftar peserta yang berhak melanjutkan ke babak Full Paper.',
        durationDays: 3,
        location: 'Email Peserta',
      },
      {
        title: 'Pengumpulan Full Paper & Video Presentasi',
        description: 'Unggah naskah lengkap karya tulis ilmiah format PDF beserta lembar orisinalitas.',
        durationDays: 20,
        location: 'Upload Dokumen Raih',
      },
      {
        title: 'Penjurian Naskah oleh Dewan Pakar',
        description: 'Penilaian karya tulis secara blind-review oleh akademisi dan praktisi riset.',
        durationDays: 7,
        location: 'Sistem Penjurian Raih',
      },
      {
        title: 'Presentasi Finalis 10 Besar & Penganugerahan',
        description: 'Presentasi karya ilmiah finalis dan sesi tanya jawab dewan juri.',
        durationDays: 2,
        location: 'Auditorium Kampus / Online',
      },
    ],
  },
  {
    name: 'UI/UX & Desain',
    badge: '🎨 Desain',
    items: [
      {
        title: 'Registrasi & Pembagian Problem Brief',
        description: 'Pendaftaran tim dan rilis studi kasus permasalahan yang harus diselesaikan.',
        durationDays: 10,
        location: 'Drive Briefing Raih',
      },
      {
        title: 'Submission Prototype Figma & Case Study',
        description: 'Pengumpulan link interactive prototype dan dokumen design thinking PDF.',
        durationDays: 14,
        location: 'Portal Raih',
      },
      {
        title: 'Penjurian & Seleksi 5 Finalis',
        description: 'Evaluasi usability, user research, estetika UI, dan inovasi interaksi.',
        durationDays: 4,
        location: 'Panel Juri',
      },
      {
        title: 'Live Design Demo & Awarding Day',
        description: 'Demo langsung prototype produk digital di hadapan Lead Product Designer industri.',
        durationDays: 1,
        location: 'Zoom Meeting',
      },
    ],
  },
  {
    name: 'Business Plan & Pitching',
    badge: '💼 Business',
    items: [
      {
        title: 'Pendaftaran & Executive Summary Submission',
        description: 'Pendaftaran tim bisnis dan submission model bisnis serta analisis pasar awal.',
        durationDays: 14,
        location: 'Portal Raih',
      },
      {
        title: 'Pengumuman Semifinalis',
        description: 'Penyaringan tim dengan potensi skalabilitas bisnis tertinggi.',
        durationDays: 3,
        location: 'Website & WhatsApp',
      },
      {
        title: 'Mentoring 1-on-1 dengan Business Advisor',
        description: 'Sesi bimbingan eksklusif untuk mempertajam unit economics dan pitch deck.',
        durationDays: 5,
        location: 'Google Meet',
      },
      {
        title: 'Grand Pitching di Depan Investor & Juri',
        description: 'Sesi pitching 7 menit di hadapan dewan investor dan penyerahan seed prize.',
        durationDays: 1,
        location: 'Hall / Online',
      },
    ],
  },
];

function formatTimelineDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeDateTag(item: CompetitionTimelineItem): { text: string; color: string } {
  if (item.status === 'completed') {
    return { text: '✓ Selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }

  const startDate = new Date(item.start_date);
  const endDate = item.end_date ? new Date(item.end_date) : null;
  const now = new Date();

  if (item.status === 'current') {
    if (endDate) {
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
      if (daysLeft < 0) return { text: 'Sedang Berjalan', color: 'bg-[#0075DE]/10 text-[#0075DE] border-[#0075DE]/30' };
      if (daysLeft === 0) return { text: '🔥 Berakhir Hari Ini!', color: 'bg-rose-50 text-rose-600 border-rose-200' };
      return { text: `🔥 Sisa ${daysLeft} hari lagi`, color: 'bg-[#0075DE]/10 text-[#0075DE] border-[#0075DE]/30' };
    }
    return { text: '🔥 Sedang Berlangsung', color: 'bg-[#0075DE]/10 text-[#0075DE] border-[#0075DE]/30' };
  }

  // Upcoming
  const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / 86400000);
  if (daysUntil <= 0) return { text: 'Segera Dimulai', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (daysUntil === 1) return { text: 'Besok', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  return { text: `${daysUntil} hari lagi`, color: 'bg-slate-50 text-slate-600 border-slate-200' };
}

export function CompetitionTimeline({
  competitionId,
  timeline,
  isOrganizer = false,
  onTimelineUpdated,
}: CompetitionTimelineProps) {
  const [items, setItems] = useState<CompetitionTimelineItem[]>(timeline);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItems, setEditingItems] = useState<CompetitionTimelineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync internal state if prop updates
  React.useEffect(() => {
    setItems(timeline);
  }, [timeline]);

  const activeIndex = items.findIndex((i) => i.status === 'current');
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  // Open modal and initialize edit copy
  const handleOpenEditor = () => {
    setEditingItems(JSON.parse(JSON.stringify(items)));
    setIsModalOpen(true);
  };

  // Add new blank item
  const handleAddItem = () => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: CompetitionTimelineItem = {
      id: Date.now(),
      competition_id: competitionId,
      order: editingItems.length + 1,
      title: '',
      description: '',
      start_date: today,
      end_date: null,
      status: 'upcoming',
      location_or_link: '',
    };
    setEditingItems([...editingItems, newItem]);
  };

  // Move item up / down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingItems.length) return;

    const copy = [...editingItems];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    // Re-assign order numbers
    const updated = copy.map((it, idx) => ({ ...it, order: idx + 1 }));
    setEditingItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    const copy = editingItems.filter((_, idx) => idx !== index);
    const updated = copy.map((it, idx) => ({ ...it, order: idx + 1 }));
    setEditingItems(updated);
  };

  // Update specific item field
  const handleUpdateItem = (index: number, field: keyof CompetitionTimelineItem, value: any) => {
    const copy = [...editingItems];
    copy[index] = { ...copy[index], [field]: value };
    setEditingItems(copy);
  };

  // Apply a template preset
  const handleApplyPreset = (preset: typeof TIMELINE_PRESETS[0]) => {
    const now = new Date();
    let currentCursor = new Date(now);

    const generated: CompetitionTimelineItem[] = preset.items.map((presetItem, idx) => {
      const startDateStr = currentCursor.toISOString().split('T')[0];
      currentCursor = new Date(currentCursor.getTime() + presetItem.durationDays * 86400000);
      const endDateStr = presetItem.durationDays > 1 ? currentCursor.toISOString().split('T')[0] : null;

      // First item current, others upcoming
      const status: TimelineStatus = idx === 0 ? 'current' : 'upcoming';

      return {
        id: Date.now() + idx,
        competition_id: competitionId,
        order: idx + 1,
        title: presetItem.title,
        description: presetItem.description,
        start_date: startDateStr,
        end_date: endDateStr,
        status,
        location_or_link: presetItem.location,
      };
    });

    setEditingItems(generated);
    addToast({
      title: `Template ${preset.name} Dipasang`,
      description: 'Silakan sesuaikan tanggal dan rincian sebelum menyimpan.',
      color: 'success',
    });
  };

  // Save changes
  const handleSaveTimeline = async () => {
    // Validate titles and start_dates
    const invalidItem = editingItems.find((it) => !it.title.trim() || !it.start_date);
    if (invalidItem) {
      addToast({
        title: 'Data Belum Lengkap',
        description: 'Setiap tahapan harus memiliki judul dan tanggal mulai.',
        color: 'danger',
      });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await competitionRepo.saveTimeline(competitionId, editingItems);
      setItems(saved);
      if (onTimelineUpdated) onTimelineUpdated(saved);
      setIsModalOpen(false);
      addToast({
        title: 'Timeline Berhasil Diperbarui! 🎉',
        description: 'Alur tahapan kompetisi langsung diperbarui secara realtime.',
        color: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Gagal Menyimpan Timeline',
        description: 'Terjadi kesalahan saat menyimpan alur lomba.',
        color: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-3.5">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#EBF4FC] flex items-center justify-center text-[#0075DE]">
            <Calendar size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#000000]">Jadwal & Alur Kompetisi</h2>
            <p className="text-[11px] text-[#615D59]">
              {items.length} Tahapan • {completedCount} Selesai ({progressPercent}%)
            </p>
          </div>
        </div>

        {/* Organizer Edit Button */}
        {isOrganizer && (
          <Button
            size="sm"
            className="bg-[#000000] hover:bg-[#2B294F] text-white text-xs font-semibold rounded-full px-3.5 h-8 shadow-sm flex items-center gap-1.5"
            onPress={handleOpenEditor}
            id="open-timeline-editor-btn"
          >
            <Edit3 size={13} />
            <span>Atur Timeline</span>
          </Button>
        )}
      </div>

      {/* Progress Track Bar */}
      {items.length > 0 && (
        <div className="w-full bg-[#E6E6E6] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0075DE] to-[#2FBF71] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Timeline List / Vertical Stepper */}
      {items.length === 0 ? (
        <div className="bg-white border border-[#E6E6E6] rounded-[20px] p-6 text-center space-y-2">
          <Clock size={32} className="mx-auto text-[#AFAEC0]" />
          <h3 className="text-xs font-bold text-[#000000]">Belum Ada Jadwal Tahapan</h3>
          <p className="text-[11px] text-[#615D59] max-w-xs mx-auto">
            Penyelenggara belum mempublikasikan rincian alur lomba ini.
          </p>
          {isOrganizer && (
            <Button
              size="sm"
              className="bg-[#0075DE] text-white text-xs font-bold rounded-full mt-2"
              onPress={handleOpenEditor}
            >
              + Buat Alur Timeline Sekarang
            </Button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E6E6E6]">
          {items.map((item, index) => {
            const isCompleted = item.status === 'completed';
            const isCurrent = item.status === 'current';
            const tag = formatRelativeDateTag(item);

            const dateLabel = item.end_date
              ? `${formatTimelineDate(item.start_date)} — ${formatTimelineDate(item.end_date)}`
              : formatTimelineDate(item.start_date);

            return (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Timeline Bullet Node */}
                <div
                  className={`absolute -left-6 top-3 w-6 h-6 rounded-full flex items-center justify-center -translate-x-1/2 shadow-sm transition-all z-10 ${
                    isCompleted
                      ? 'bg-[#2FBF71] text-white ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-[#0075DE] text-white ring-4 ring-blue-100 ring-offset-0 animate-pulse'
                      : 'bg-white text-[#615D59] border-2 border-[#E6E6E6]'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={13} strokeWidth={3} />
                  ) : isCurrent ? (
                    <Flame size={12} className="text-white fill-white" />
                  ) : (
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Timeline Card */}
                <div
                  className={`rounded-[20px] p-4 border transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-br from-white to-[#F6F5F4] border-[#0075DE]/40 shadow-[0_4px_20px_rgba(0,117,222,0.06)]'
                      : isCompleted
                      ? 'bg-white/80 border-[#E6E6E6] opacity-90'
                      : 'bg-white border-[#E6E6E6]'
                  }`}
                >
                  {/* Top Meta: Dates & Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#565470]">
                      <Calendar size={13} className={isCurrent ? 'text-[#0075DE]' : 'text-[#615D59]'} />
                      <span>{dateLabel}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tag.color}`}
                    >
                      {tag.text}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-sm font-bold leading-snug ${
                      isCurrent ? 'text-[#000000]' : isCompleted ? 'text-[#3E3C56]' : 'text-[#000000]'
                    }`}
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-[#565470] mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Location or platform tag */}
                  {item.location_or_link && (
                    <div className="flex items-center gap-1 mt-2.5 text-[11px] text-[#615D59] font-medium bg-[#F7F7FA] px-2.5 py-1 rounded-lg w-fit">
                      <MapPin size={11} className="text-[#0075DE]" />
                      <span>{item.location_or_link}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ============================================================
          ORGANIZER TIMELINE SETTINGS MODAL
          ============================================================ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: 'rounded-[24px] max-h-[90vh]',
          header: 'border-b border-[#E6E6E6] p-5 pb-3',
          body: 'p-5 space-y-5',
          footer: 'border-t border-[#E6E6E6] p-4',
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EBF4FC] flex items-center justify-center text-[#0075DE]">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#000000]">Pengaturan Timeline & Alur Lomba</h3>
                <p className="text-xs text-[#615D59] font-normal">
                  Atur tahapan pendaftaran, penjurian, hingga grand final untuk peserta
                </p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            {/* Quick Templates Bar */}
            <div className="space-y-2 bg-[#F8F8FC] p-3.5 rounded-2xl border border-[#E6E6E6]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#0075DE]" />
                  Template Cepat (1-Klik Isi Alur):
                </span>
                <span className="text-[10px] text-[#615D59]">Pilih untuk autofill tahapan</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {TIMELINE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] transition-all shadow-2xs"
                  >
                    {preset.badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Stages List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
                  Daftar Tahapan Lomba ({editingItems.length})
                </h4>
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-[#EBF4FC] text-[#0075DE] font-bold text-xs rounded-xl h-8"
                  startContent={<Plus size={14} />}
                  onPress={handleAddItem}
                  id="add-timeline-stage-btn"
                >
                  Tambah Tahap
                </Button>
              </div>

              {editingItems.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-[#E6E6E6] rounded-2xl p-4">
                  <p className="text-xs text-[#615D59] mb-3">Belum ada tahapan. Buat manual atau gunakan template.</p>
                  <Button
                    size="sm"
                    className="bg-[#0075DE] text-white font-bold text-xs rounded-full"
                    startContent={<Plus size={14} />}
                    onPress={handleAddItem}
                  >
                    Tambah Tahapan Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {editingItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white border border-[#E6E6E6] hover:border-[#E6E6E6] rounded-2xl p-4 space-y-3 relative shadow-2xs transition-all"
                    >
                      {/* Item Top Bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#F0F0F5] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#000000] text-white text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#000000]">Tahap {idx + 1}</span>
                        </div>

                        {/* Action buttons (Move Up, Move Down, Delete) */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="w-7 h-7 rounded-lg border border-[#E6E6E6] hover:bg-[#F0F0F5] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#565470]"
                            title="Pindah ke Atas"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === editingItems.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="w-7 h-7 rounded-lg border border-[#E6E6E6] hover:bg-[#F0F0F5] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#565470]"
                            title="Pindah ke Bawah"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="w-7 h-7 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center ml-1"
                            title="Hapus Tahapan Ini"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Status */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="text-[11px] font-bold text-[#000000] block mb-1">
                            Nama Tahapan <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Pendaftaran Gelombang 1"
                            value={item.title}
                            onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] bg-[#F6F5F4]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#000000] block mb-1">
                            Status Tahapan
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateItem(idx, 'status', e.target.value as TimelineStatus)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] bg-[#F6F5F4]"
                          >
                            <option value="upcoming">⏳ Akan Datang</option>
                            <option value="current">🔥 Sedang Berlangsung</option>
                            <option value="completed">✓ Selesai</option>
                          </select>
                        </div>
                      </div>

                      {/* Dates & Location */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-[#000000] block mb-1">
                            Tanggal Mulai <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={item.start_date ? item.start_date.split('T')[0] : ''}
                            onChange={(e) => handleUpdateItem(idx, 'start_date', e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] bg-[#F6F5F4]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#000000] block mb-1">
                            Tanggal Selesai (Opsional)
                          </label>
                          <input
                            type="date"
                            value={item.end_date ? item.end_date.split('T')[0] : ''}
                            onChange={(e) => handleUpdateItem(idx, 'end_date', e.target.value || null)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] bg-[#F6F5F4]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#000000] block mb-1">
                            Platform / Lokasi
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Portal Raih / Zoom"
                            value={item.location_or_link ?? ''}
                            onChange={(e) => handleUpdateItem(idx, 'location_or_link', e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] bg-[#F6F5F4]"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-[11px] font-bold text-[#000000] block mb-1">
                          Penjelasan / Instruksi untuk Peserta
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Jelaskan apa yang harus dipersiapkan, diunggah, atau dihadiri oleh peserta..."
                          value={item.description ?? ''}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] bg-[#F6F5F4] resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="flex items-center justify-between">
            <Button
              variant="bordered"
              size="sm"
              className="rounded-full text-xs font-semibold border-[#E6E6E6]"
              onPress={() => setIsModalOpen(false)}
            >
              Batal
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-[#EBF4FC] text-[#0075DE] font-bold text-xs rounded-full"
                startContent={<Plus size={14} />}
                onPress={handleAddItem}
              >
                + Tambah Tahap
              </Button>
              <Button
                size="sm"
                className="bg-[#0075DE] hover:bg-[#005BAB] text-white font-bold text-xs rounded-full px-5 shadow-sm"
                isLoading={isSaving}
                onPress={handleSaveTimeline}
                id="save-timeline-modal-btn"
              >
                Simpan Perubahan Timeline
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
