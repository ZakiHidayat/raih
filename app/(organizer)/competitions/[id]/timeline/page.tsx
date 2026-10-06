'use client';

// ============================================================
// RAIH — Organizer Competition Timeline Management Page
// Dedicated workspace for organizers to configure & manage event stages
// ============================================================
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Skeleton,
  addToast,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  Eye,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  ExternalLink,
  GripVertical,
  FileText,
} from '@/components/ui/icons';
import { competitionRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { CompetitionWithDetails, CompetitionTimelineItem, TimelineStatus } from '@/types';
import { CompetitionTimeline } from '@/components/features/competitions/CompetitionTimeline';

const TIMELINE_TEMPLATES: Record<
  string,
  Array<{ title: string; description: string; days: number; location: string }>
> = {
  Hackathon: [
    {
      title: 'Pendaftaran & Pengumpulan Proposal',
      description: 'Registrasi tim online dan pengunggahan resume ide produk berbasis AI.',
      days: 14,
      location: 'Portal Raih',
    },
    {
      title: 'Pengumuman 20 Tim Finalis',
      description: 'Penyaringan tim terbaik yang lolos ke tahap hacking utama.',
      days: 2,
      location: 'Email & Website',
    },
    {
      title: 'Technical Meeting Peserta',
      description: 'Briefing teknis aturan coding, API sandbox, dan sesi tanya jawab.',
      days: 1,
      location: 'Zoom Cloud Meeting',
    },
    {
      title: 'Pelaksanaan Hackathon 48 Jam',
      description: 'Pengerjaan prototype aplikasi fungsional bersama tim secara intensif.',
      days: 2,
      location: 'Discord & GitHub Classroom',
    },
    {
      title: 'Grand Final Pitching & Awarding',
      description: 'Presentasi langsung tim terpilih di hadapan juri dan pengumuman juara.',
      days: 1,
      location: 'Live Streaming Zoom',
    },
  ],
  LKTI: [
    {
      title: 'Pendaftaran & Pengumpulan Abstrak',
      description: 'Pendaftaran peserta dan pengumpulan naskah gagasan abstrak ilmiah.',
      days: 14,
      location: 'Portal Raih',
    },
    {
      title: 'Pengumuman Lolos Abstrak',
      description: 'Daftar peserta yang berhak melanjutkan ke pengumpulan naskah full paper.',
      days: 3,
      location: 'Email Peserta',
    },
    {
      title: 'Pengumpulan Full Paper & Video',
      description: 'Unggah naskah lengkap karya tulis ilmiah format PDF dan lembar orisinalitas.',
      days: 20,
      location: 'Upload Dokumen Raih',
    },
    {
      title: 'Penjurian Naskah oleh Dewan Pakar',
      description: 'Penilaian karya ilmiah secara blind review oleh tim juri akademisi.',
      days: 7,
      location: 'Sistem Penjurian',
    },
    {
      title: 'Presentasi Finalis 10 Besar & Juara',
      description: 'Presentasi karya ilmiah finalis dan sesi tanya jawab dewan juri.',
      days: 2,
      location: 'Auditorium Kampus / Online',
    },
  ],
  Desain: [
    {
      title: 'Pendaftaran & Pembagian Brief',
      description: 'Registrasi tim desainer dan pembagian studi kasus rancangan aplikasi.',
      days: 10,
      location: 'Drive Briefing Raih',
    },
    {
      title: 'Submission Prototype Figma & Case Study',
      description: 'Pengumpulan link interactive prototype dan dokumen design thinking.',
      days: 14,
      location: 'Portal Raih',
    },
    {
      title: 'Live Design Demo & Penganugerahan',
      description: 'Presentasi dan live demo interaction di hadapan tim juri praktisi.',
      days: 1,
      location: 'Zoom Meeting',
    },
  ],
};

export default function OrganizerTimelineManagementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [competition, setCompetition] = useState<CompetitionWithDetails | null>(null);
  const [stages, setStages] = useState<CompetitionTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    async function load() {
      const comp = await competitionRepo.getById(Number(id));
      if (!comp) {
        setIsLoading(false);
        return;
      }
      setCompetition(comp);
      setStages(comp.timeline ?? []);
      setIsLoading(false);
    }
    load();
  }, [id, user, router]);

  const handleAddStage = () => {
    const today = new Date().toISOString().split('T')[0];
    const newStage: CompetitionTimelineItem = {
      id: Date.now(),
      competition_id: Number(id),
      order: stages.length + 1,
      title: '',
      description: '',
      start_date: today,
      end_date: null,
      status: 'upcoming',
      location_or_link: '',
    };
    setStages([...stages, newStage]);
  };

  const handleUpdateStage = (index: number, field: keyof CompetitionTimelineItem, value: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  const handleRemoveStage = (index: number) => {
    const updated = stages.filter((_, idx) => idx !== index).map((st, i) => ({ ...st, order: i + 1 }));
    setStages(updated);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;

    const copy = [...stages];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    const reordered = copy.map((st, idx) => ({ ...st, order: idx + 1 }));
    setStages(reordered);
  };

  const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);
  const [dragOverStageIndex, setDragOverStageIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageIndex !== index) {
      setDragOverStageIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    if (dragOverStageIndex === index) {
      setDragOverStageIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedStageIndex(null);
    setDragOverStageIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedStageIndex === null || draggedStageIndex === targetIndex) {
      setDraggedStageIndex(null);
      setDragOverStageIndex(null);
      return;
    }
    setStages(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(draggedStageIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy.map((st, idx) => ({ ...st, order: idx + 1 }));
    });
    setDraggedStageIndex(null);
    setDragOverStageIndex(null);
  };

  const handleApplyTemplate = (templateName: string) => {
    const template = TIMELINE_TEMPLATES[templateName];
    if (!template) return;

    let cursor = new Date();
    const generated: CompetitionTimelineItem[] = template.map((st, idx) => {
      const startStr = cursor.toISOString().split('T')[0];
      cursor = new Date(cursor.getTime() + st.days * 86400000);
      const endStr = st.days > 1 ? cursor.toISOString().split('T')[0] : null;

      return {
        id: Date.now() + idx,
        competition_id: Number(id),
        order: idx + 1,
        title: st.title,
        description: st.description,
        start_date: startStr,
        end_date: endStr,
        status: idx === 0 ? 'current' : 'upcoming',
        location_or_link: st.location,
      };
    });

    setStages(generated);
    addToast({
      title: `Template ${templateName} Dipasang`,
      description: 'Jangan lupa sesuaikan tanggal lalu klik Simpan Perubahan.',
      color: 'success',
    });
  };

  const handleSave = async () => {
    const invalid = stages.find(s => !s.title.trim() || !s.start_date);
    if (invalid) {
      addToast({
        title: 'Data Belum Lengkap',
        description: 'Pastikan setiap tahapan memiliki nama tahapan dan tanggal mulai.',
        color: 'danger',
      });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await competitionRepo.saveTimeline(Number(id), stages);
      setStages(saved);
      if (competition) {
        setCompetition({ ...competition, timeline: saved });
      }
      addToast({
        title: 'Timeline Berhasil Disimpan! 🎉',
        description: 'Alur tahapan kompetisi langsung aktif dan diperbarui untuk peserta.',
        color: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Gagal Menyimpan Timeline',
        description: 'Terjadi kesalahan sistem saat menyimpan timeline.',
        color: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 py-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <span className="text-5xl">🏆</span>
        <h2 className="text-lg font-bold text-foreground">Kompetisi Tidak Ditemukan</h2>
        <p className="text-xs text-foreground/50">Kompetisi mungkin telah dihapus atau ID tidak valid.</p>
        <Button
          className="bg-[#0075DE] text-white rounded-full text-xs font-semibold"
          onPress={() => router.push('/dashboard')}
        >
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Pengaturan Timeline Lomba</h1>
            <p className="text-xs text-foreground/50">Atur alur tahapan seleksi & jadwal resmi untuk peserta</p>
          </div>
        </div>

        <Link
          href={`/competitions/${competition.id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-white text-xs font-semibold text-[#000000] hover:border-[#0075DE] hover:text-[#0075DE] transition-all shadow-2xs"
        >
          <span>Lihat Halaman Peserta</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* Competition Info Card */}
      <div className="rounded-lg border border-[#E6E6E6] bg-[#213183] text-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-white/15 text-white border border-white/20 font-medium">
                {competition.category?.name ?? 'Umum'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#0075DE] text-white font-bold">
                {stages.length} Tahapan
              </span>
            </div>
            <h2 className="text-lg font-bold text-white line-clamp-1">{competition.title}</h2>
            <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5">
              <Calendar size={13} className="text-[#62AEF0]" />
              Batas Pendaftaran: {new Date(competition.registration_deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Editor vs Live Participant Preview */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'editor'
                ? 'bg-[#000000] text-white'
                : 'text-foreground/60 hover:text-foreground hover:bg-default-100'
            }`}
          >
            <Layers size={14} />
            <span>Editor Tahapan ({stages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'preview'
                ? 'bg-[#000000] text-white'
                : 'text-foreground/60 hover:text-foreground hover:bg-default-100'
            }`}
          >
            <Eye size={14} />
            <span>Live Preview Peserta</span>
          </button>
        </div>

        <Button
          size="sm"
          className="bg-[#EBF4FC] text-[#0075DE] font-bold text-xs rounded-xl h-8"
          startContent={<Plus size={14} />}
          onPress={handleAddStage}
        >
          + Tambah Tahap
        </Button>
      </div>

      {/* Tab: Live Preview */}
      {activeTab === 'preview' && (
        <div className="bg-[#F6F5F4] border border-border rounded-2xl p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-center gap-2">
            <Eye size={15} />
            <span>Ini adalah tampilan langsung bagaimana alur timeline akan dilihat oleh peserta di aplikasi.</span>
          </div>
          <CompetitionTimeline
            competitionId={competition.id}
            timeline={stages}
            isOrganizer={false}
          />
        </div>
      )}

      {/* Tab: Editor */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          {/* Quick Templates Bar */}
          <div className="bg-default-50 border border-border rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#0075DE]" />
                Template Otomatis (1-Klik Isi):
              </span>
              <span className="text-[10px] text-foreground/50">Ganti tahapan dengan template standar</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Hackathon', 'LKTI', 'Desain'].map(tpl => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-border hover:border-[#0075DE] hover:text-[#0075DE] transition-all shadow-2xs"
                >
                  ⚡ Template {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Stages List */}
          {stages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl p-6 space-y-3">
              <Clock size={36} className="mx-auto text-foreground/30" />
              <p className="text-xs text-foreground/50">Belum ada tahapan yang dikonfigurasi.</p>
              <Button
                size="sm"
                className="bg-[#0075DE] text-white font-bold text-xs rounded-full"
                startContent={<Plus size={14} />}
                onPress={handleAddStage}
              >
                Tambah Tahapan Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#615D59] px-0.5">
                <span className="flex items-center gap-1.5">
                  <GripVertical size={13} className="text-[#9B9A97]" />
                  <span>Tahan & geser tombol titik untuk mengatur urutan alur secara bebas</span>
                </span>
                <span className="text-[10px] text-[#9B9A97] font-medium">Total {stages.length} Tahapan</span>
              </div>

              {stages.map((stage, idx) => (
                <div
                  key={stage.id || idx}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={(e) => handleDragLeave(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`relative bg-white border rounded-lg p-3.5 space-y-3 transition-all duration-150 ${
                    draggedStageIndex === idx
                      ? 'opacity-40 border-dashed border-[#0075DE] scale-[0.99] bg-[#F6F5F4]'
                      : dragOverStageIndex === idx
                      ? 'border-[#0075DE] ring-2 ring-[#0075DE]/30 bg-[#EBF4FC]/20'
                      : 'border-[#E6E6E6] hover:border-[#C4C4C0] shadow-2xs'
                  }`}
                >
                  {/* Top Bar of Stage */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                      {/* Draggable button */}
                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnd={handleDragEnd}
                        className="w-7 h-7 -ml-1 rounded-[4px] flex items-center justify-center text-[#9B9A97] hover:text-[#000000] hover:bg-[#EFEFED] cursor-grab active:cursor-grabbing transition-colors focus:outline-hidden group"
                        title="Klik & tarik naik/turun untuk mengatur urutan alur timeline"
                        aria-label={`Tarik Tahap ${idx + 1}`}
                      >
                        <GripVertical size={16} className="group-hover:scale-110 transition-transform" />
                      </button>

                      {/* Stage Badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold text-[#31302E] bg-[#F6F5F4] border border-[#E6E6E6] shrink-0">
                        Tahap {idx + 1}
                      </span>

                      {/* Status Tag Select */}
                      <div className="relative inline-flex items-center">
                        <select
                          value={stage.status}
                          onChange={e => handleUpdateStage(idx, 'status', e.target.value as TimelineStatus)}
                          className={`text-[11px] font-semibold pl-2 pr-5 py-1 rounded-[4px] border appearance-none cursor-pointer focus:outline-hidden transition-colors ${
                            stage.status === 'current'
                              ? 'bg-[#FDF5E8] text-[#DD5B00] border-[#DD5B00]/40'
                              : stage.status === 'completed'
                              ? 'bg-[#EDF6EF] text-[#0F7B6C] border-[#0F7B6C]/40'
                              : 'bg-[#F6F5F4] text-[#615D59] border-[#E6E6E6]'
                          }`}
                        >
                          <option value="upcoming">⏳ Akan Datang</option>
                          <option value="current">🔥 Sedang Berjalan</option>
                          <option value="completed">✓ Selesai</option>
                        </select>
                        <span className="absolute right-1.5 pointer-events-none text-[8px] text-[#9B9A97]">▼</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStage(idx, 'up')}
                        className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[#9B9A97] hover:text-[#000000] hover:bg-[#EFEFED] disabled:opacity-20 transition-colors"
                        title="Pindah ke Atas"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={() => handleMoveStage(idx, 'down')}
                        className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[#9B9A97] hover:text-[#000000] hover:bg-[#EFEFED] disabled:opacity-20 transition-colors"
                        title="Pindah ke Bawah"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <div className="w-[1px] h-3 bg-[#E6E6E6] mx-0.5" />
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[#9B9A97] hover:text-[#EB5757] hover:bg-[#FBEBEA] transition-colors"
                        title="Hapus Tahap"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider mb-1 block">
                      Nama Tahapan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Pendaftaran & Pengumpulan Berkas"
                      value={stage.title}
                      onChange={e => handleUpdateStage(idx, 'title', e.target.value)}
                      className="w-full text-xs font-semibold text-[#000000] placeholder:text-[#9B9A97] px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden transition-all shadow-2xs"
                    />
                  </div>

                  {/* Dates & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#615D59] flex items-center gap-1">
                        <Calendar size={11} className="text-[#0075DE]" />
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={stage.start_date ? stage.start_date.split('T')[0] : ''}
                        onChange={e => handleUpdateStage(idx, 'start_date', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#615D59] flex items-center gap-1">
                        <Calendar size={11} className="text-[#615D59]" />
                        Tanggal Selesai (opsional)
                      </label>
                      <input
                        type="date"
                        value={stage.end_date ? stage.end_date.split('T')[0] : ''}
                        onChange={e => handleUpdateStage(idx, 'end_date', e.target.value || null)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#615D59] flex items-center gap-1">
                        <MapPin size={11} className="text-[#0075DE]" />
                        Platform / Lokasi
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Portal Raih / Zoom"
                        value={stage.location_or_link ?? ''}
                        onChange={e => handleUpdateStage(idx, 'location_or_link', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden transition-colors"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#615D59] flex items-center gap-1">
                      <FileText size={11} className="text-[#615D59]" />
                      Rincian Deskripsi Kegiatan
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Jelaskan instruksi, berkas yang harus diunggah, atau mekanisme alur tahap ini..."
                      value={stage.description ?? ''}
                      onChange={e => handleUpdateStage(idx, 'description', e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden transition-colors resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sticky Bottom Save Bar */}
          <div className="pt-4 flex items-center justify-between">
            <Button
              variant="bordered"
              className="rounded-full text-xs font-semibold border-border"
              onPress={() => router.push('/dashboard')}
            >
              Kembali ke Dashboard
            </Button>
            <Button
              className="bg-[#0075DE] hover:bg-[#005BAB] text-white rounded-full font-bold text-xs px-6 h-11 shadow-sm"
              startContent={<Save size={16} />}
              isLoading={isSaving}
              onPress={handleSave}
              id="save-timeline-main-btn"
            >
              Simpan Semua Perubahan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
