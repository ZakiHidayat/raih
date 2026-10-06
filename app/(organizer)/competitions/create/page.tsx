'use client';

// ============================================================
// RAIH — Create Competition Page (4-Step Wizard / Stepper)
// Design System: Notion (design.md)
// MingCute Icons & Rich Organizer Registration Form Settings Builder
// ============================================================
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Select, SelectItem, RadioGroup, Radio, addToast } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Trophy, Calendar, CalendarFill, FileText, FileTextFill, Eye,
  Plus, Trash2, ArrowUp, ArrowDown, Sparkles, SparklesFill, Layers, Clock, MapPin, GripVertical,
  Users, Award, Shield, Ticket, SlidersHorizontal, Settings, Upload, CheckCircle2, CheckCircleFill
} from '@/components/ui/icons';
import { competitionRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import { mockCategories } from '@/data/mock';
import type { CompType, TimelineStatus, CompetitionFormSettings, CustomFormField } from '@/types';

const steps = [
  { id: 1, label: 'Info Dasar', icon: FileText, iconFill: FileTextFill },
  { id: 2, label: 'Timeline & Alur', icon: Calendar, iconFill: CalendarFill },
  { id: 3, label: 'Syarat & Form Peserta', icon: SlidersHorizontal, iconFill: SlidersHorizontal },
  { id: 4, label: 'Review & Terbitkan', icon: Eye, iconFill: Eye },
];

export interface TimelineStageDraft {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: TimelineStatus;
  location_or_link?: string;
}

interface FormData {
  title: string;
  description: string;
  category_id: string;
  comp_type: CompType;
  registration_fee: string;
  prize_info: string;
  registration_deadline: string;
  start_date: string;
  end_date: string;
}

const defaultForm: FormData = {
  title: '',
  description: '',
  category_id: '',
  comp_type: 'both',
  registration_fee: '0',
  prize_info: '',
  registration_deadline: '',
  start_date: '',
  end_date: '',
};

export default function CreateCompetitionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [timelineStages, setTimelineStages] = useState<TimelineStageDraft[]>([]);
  const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);
  const [dragOverStageIndex, setDragOverStageIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Settings State (configured by organizer for participants)
  const [formSettings, setFormSettings] = useState<CompetitionFormSettings>({
    allow_individual: true,
    allow_team: true,
    min_team_members: 2,
    max_team_members: 4,
    require_ktm: true,
    require_surat_aktif: false,
    require_twibbon: false,
    require_proposal: true,
    require_pitch_video: false,
    require_statement_letter: true,
    custom_fields: [
      {
        id: 'cf_track_default',
        field_name: 'Pilihan Subtema / Track Lomba',
        field_type: 'select',
        options: ['Track Inovasi Digital', 'Track Keberlanjutan Lingkungan', 'Track Solusi Sosial'],
        placeholder: 'Pilih Track',
        help_text: 'Fokus kategori inovasi yang akan dibangun tim peserta.',
        is_mandatory: true,
      },
    ],
  });

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
    setTimelineStages(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(draggedStageIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
    setDraggedStageIndex(null);
    setDragOverStageIndex(null);
  };

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'comp_type') {
        const val = value as CompType;
        setFormSettings(fs => ({
          ...fs,
          allow_individual: val === 'individual' || val === 'both',
          allow_team: val === 'team' || val === 'both',
        }));
      }
      return next;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const applyPreset = (presetName: string) => {
    const today = new Date();
    let cursor = new Date(today);

    const presetsMap: Record<string, Array<{ title: string; description: string; days: number; location: string }>> = {
      Hackathon: [
        { title: 'Pendaftaran & Submit Ide', description: 'Registrasi tim dan pengunggahan proposal ide', days: 14, location: 'Portal Raih' },
        { title: 'Pengumuman 20 Tim Finalis', description: 'Pengumuman tim terbaik yang lolos ke hackathon', days: 2, location: 'Email & Website' },
        { title: 'Technical Meeting Peserta', description: 'Briefing teknis aturan dan API', days: 1, location: 'Zoom Meeting' },
        { title: 'Hackathon 48 Jam', description: 'Pengerjaan prototype solusi fungsional', days: 2, location: 'Discord' },
        { title: 'Pitching Finalis & Awarding', description: 'Presentasi dan pengumuman pemenang', days: 1, location: 'Live Zoom' },
      ],
      LKTI: [
        { title: 'Pendaftaran & Pengumpulan Abstrak', description: 'Pengiriman naskah abstrak ilmiah', days: 14, location: 'Portal Raih' },
        { title: 'Pengumuman Lolos Abstrak', description: 'Daftar peserta yang berhak lanjut ke Full Paper', days: 3, location: 'Email' },
        { title: 'Pengumpulan Full Paper', description: 'Unggah naskah lengkap karya tulis ilmiah', days: 20, location: 'Upload Raih' },
        { title: 'Penjurian Dewan Juri', description: 'Review naskah oleh dewan pakar', days: 7, location: 'Panel Juri' },
        { title: 'Presentasi & Penganugerahan', description: 'Presentasi finalis dan gala dinner juara', days: 2, location: 'Auditorium / Online' },
      ],
      Desain: [
        { title: 'Pendaftaran & Problem Brief', description: 'Registrasi dan pembagian studi kasus', days: 10, location: 'Drive Briefing' },
        { title: 'Submission Prototype Figma', description: 'Pengumpulan link Figma dan case study PDF', days: 14, location: 'Portal Raih' },
        { title: 'Design Showcase & Awarding', description: 'Demo prototype produk di depan dewan juri', days: 1, location: 'Zoom Meeting' },
      ],
    };

    const template = presetsMap[presetName] || presetsMap.Hackathon;
    const stages: TimelineStageDraft[] = template.map((st, idx) => {
      const startStr = cursor.toISOString().split('T')[0];
      cursor = new Date(cursor.getTime() + st.days * 86400000);
      const endStr = st.days > 1 ? cursor.toISOString().split('T')[0] : '';
      return {
        id: Date.now() + idx,
        title: st.title,
        description: st.description,
        start_date: startStr,
        end_date: endStr,
        status: idx === 0 ? 'current' : 'upcoming',
        location_or_link: st.location,
      };
    });

    setTimelineStages(stages);
    if (stages.length > 0 && !form.registration_deadline) {
      update('registration_deadline', `${stages[0].end_date || stages[0].start_date}T23:59`);
    }
  };

  const addStage = () => {
    const today = new Date().toISOString().split('T')[0];
    const newStage: TimelineStageDraft = {
      id: Date.now(),
      title: '',
      description: '',
      start_date: today,
      end_date: '',
      status: 'upcoming',
      location_or_link: '',
    };
    setTimelineStages(prev => [...prev, newStage]);
  };

  const updateStage = (index: number, field: keyof TimelineStageDraft, value: any) => {
    setTimelineStages(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeStage = (index: number) => {
    setTimelineStages(prev => prev.filter((_, i) => i !== index));
  };

  const moveStage = (index: number, dir: 'up' | 'down') => {
    setTimelineStages(prev => {
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  // Custom Field Helpers for Step 3
  const addCustomField = (preset?: Partial<CustomFormField>) => {
    const newField: CustomFormField = {
      id: `cf_${Date.now()}`,
      field_name: preset?.field_name || '',
      field_type: preset?.field_type || 'text',
      options: preset?.options || ['Pilihan 1', 'Pilihan 2'],
      placeholder: preset?.placeholder || '',
      help_text: preset?.help_text || '',
      is_mandatory: preset?.is_mandatory ?? true,
    };
    setFormSettings(prev => ({
      ...prev,
      custom_fields: [...(prev.custom_fields || []), newField],
    }));
  };

  const updateCustomField = (index: number, updates: Partial<CustomFormField>) => {
    setFormSettings(prev => {
      const list = [...(prev.custom_fields || [])];
      list[index] = { ...list[index], ...updates };
      return { ...prev, custom_fields: list };
    });
  };

  const removeCustomField = (index: number) => {
    setFormSettings(prev => ({
      ...prev,
      custom_fields: (prev.custom_fields || []).filter((_, i) => i !== index),
    }));
  };

  const validateStep1 = () => {
    const errs: Partial<FormData> = {};
    if (!form.title.trim()) errs.title = 'Judul kompetisi wajib diisi';
    if (!form.description.trim()) errs.description = 'Deskripsi wajib diisi';
    if (!form.category_id) errs.category_id = 'Pilih kategori';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Partial<FormData> = {};
    if (!form.registration_deadline) errs.registration_deadline = 'Batas pendaftaran wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    if (!formSettings.allow_individual && !formSettings.allow_team) {
      addToast({ title: 'Pilih minimal satu format partisipasi (Individu atau Tim)', color: 'warning' });
      return false;
    }
    if (formSettings.allow_team) {
      const min = formSettings.min_team_members || 1;
      const max = formSettings.max_team_members || 1;
      if (min > max) {
        addToast({ title: 'Jumlah minimal anggota tidak boleh lebih besar dari maksimal', color: 'warning' });
        return false;
      }
    }
    // Check custom fields
    if (formSettings.custom_fields && formSettings.custom_fields.length > 0) {
      for (const cf of formSettings.custom_fields) {
        if (!cf.field_name.trim()) {
          addToast({ title: 'Harap beri judul/nama pada semua kolom pertanyaan kustom', color: 'warning' });
          return false;
        }
      }
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 1 && timelineStages.length === 0) {
      applyPreset('Hackathon');
    }
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(prev => Math.min(prev + 1, 4));
  };

  const goBack = () => {
    if (step > 1) setStep(prev => prev - 1);
    else router.back();
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const stagesPayload = timelineStages.map((s, idx) => ({
        title: s.title || `Tahap ${idx + 1}`,
        description: s.description || null,
        start_date: s.start_date || new Date().toISOString(),
        end_date: s.end_date || null,
        status: s.status,
        order: idx + 1,
        location_or_link: s.location_or_link || null,
      }));

      await competitionRepo.create({
        organizer_id: user.id,
        category_id: form.category_id ? Number(form.category_id) : null,
        title: form.title,
        description: form.description,
        comp_type: form.comp_type,
        registration_fee: Number(form.registration_fee),
        prize_info: form.prize_info || null,
        registration_deadline: form.registration_deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: 'published',
        is_featured: false,
        banner_image: null,
      }, stagesPayload, formSettings);

      addToast({
        title: '🎉 Kompetisi & Form Pendaftaran Berhasil Dibuat!',
        description: 'Kompetisimu dan formulir pendaftaran peserta sudah aktif.',
        color: 'success',
      });
      router.push('/dashboard');
    } catch {
      addToast({ title: 'Gagal membuat kompetisi', color: 'danger' });
    }
    setIsSubmitting(false);
  };

  const selectedCategory = mockCategories.find(c => c.id.toString() === form.category_id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="w-8 h-8 rounded-md border border-[#E6E6E6] bg-white flex items-center justify-center text-[#615D59] hover:text-[#000000] shadow-2xs">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Buat Kompetisi Baru</h1>
          <p className="text-xs text-[#615D59]">Langkah {step} dari {steps.length} • Pengaturan Publikasi & Formulir Pendaftaran</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const active = step === s.id;
          const Icon = active && s.iconFill ? s.iconFill : s.icon;
          const done = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 flex-1 ${active ? 'text-[#0075DE]' : done ? 'text-[#1AAE39]' : 'text-[#A39E98]'}`}>
                <div className={`w-6 h-6 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? 'bg-[#1AAE39] text-white' : active ? 'bg-[#0075DE] text-white' : 'bg-white border border-[#E6E6E6]'
                }`}>
                  {done ? <Check size={12} /> : <Icon size={12} />}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full transition-all ${done ? 'bg-[#1AAE39]' : 'bg-[#E6E6E6]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* ── STEP 1: Info Dasar ─────────────────────────── */}
          {step === 1 && (
            <div className="p-6 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs space-y-4">
              <Input
                id="create-title"
                label="Judul Kompetisi"
                placeholder="e.g. Hackathon AI for Social Good 2025"
                value={form.title}
                onValueChange={v => update('title', v)}
                isInvalid={!!errors.title}
                errorMessage={errors.title}
                classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
              />
              <Textarea
                id="create-description"
                label="Deskripsi"
                placeholder="Jelaskan tentang kompetisi ini, tema, ketentuan, dan hal penting lainnya..."
                value={form.description}
                onValueChange={v => update('description', v)}
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                minRows={4}
                classNames={{ inputWrapper: 'rounded-[4px] border-[#E6E6E6]' }}
              />
              <Select
                id="create-category"
                label="Kategori"
                placeholder="Pilih kategori kompetisi"
                selectedKeys={form.category_id ? [form.category_id] : []}
                onSelectionChange={(keys) => update('category_id', [...keys][0]?.toString() ?? '')}
                isInvalid={!!errors.category_id}
                errorMessage={errors.category_id}
                classNames={{ trigger: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
              >
                {mockCategories.map(cat => (
                  <SelectItem key={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </Select>

              <div>
                <p className="text-xs font-semibold text-[#31302E] mb-2">Tipe Kompetisi</p>
                <RadioGroup
                  value={form.comp_type}
                  onValueChange={v => update('comp_type', v)}
                  orientation="horizontal"
                  classNames={{ wrapper: 'gap-3' }}
                >
                  {[
                    { value: 'individual', label: 'Individu', emoji: '👤' },
                    { value: 'team', label: 'Tim', emoji: '👥' },
                    { value: 'both', label: 'Keduanya', emoji: '🔀' },
                  ].map(opt => (
                    <Radio
                      key={opt.value}
                      value={opt.value}
                      classNames={{
                        base: `cursor-pointer rounded-[4px] border px-3 py-2 transition-all flex-1 ${form.comp_type === opt.value ? 'border-[#0075DE] bg-[#EBF4FC]' : 'border-[#E6E6E6] bg-white'}`,
                        label: 'text-xs font-medium',
                      }}
                    >
                      <span className="text-base">{opt.emoji}</span> {opt.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="create-fee"
                  label="Biaya Pendaftaran (Rp)"
                  placeholder="0 untuk gratis"
                  type="number"
                  value={form.registration_fee}
                  onValueChange={v => update('registration_fee', v)}
                  startContent={<span className="text-[#A39E98] text-xs flex-shrink-0">Rp</span>}
                  classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
                  description="Biaya admin Rp 5.000 akan ditambahkan"
                />
                <Input
                  id="create-prize"
                  label="Info Hadiah (opsional)"
                  placeholder="e.g. Juara 1: Rp 10.000.000"
                  value={form.prize_info}
                  onValueChange={v => update('prize_info', v)}
                  classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: Timeline & Alur ────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
                <p className="text-xs text-[#0075DE] font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <Calendar size={14} /> Atur Jadwal & Alur Timeline Kompetisi
                </p>
                <p className="text-xs text-[#615D59] mt-1 leading-relaxed">
                  Tentukan tanggal utama dan susun tahapan lomba yang akan dilihat peserta di halaman detail kompetisi.
                </p>
              </div>

              {/* Tanggal Utama */}
              <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3 shadow-2xs">
                <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
                  Tanggal Kunci Kompetisi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    id="create-deadline"
                    label="Batas Pendaftaran"
                    type="datetime-local"
                    value={form.registration_deadline}
                    onValueChange={v => update('registration_deadline', v)}
                    isInvalid={!!errors.registration_deadline}
                    errorMessage={errors.registration_deadline}
                    classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
                  />
                  <Input
                    id="create-start"
                    label="Tanggal Mulai (opsional)"
                    type="datetime-local"
                    value={form.start_date}
                    onValueChange={v => update('start_date', v)}
                    classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
                  />
                  <Input
                    id="create-end"
                    label="Tanggal Selesai (opsional)"
                    type="datetime-local"
                    value={form.end_date}
                    onValueChange={v => update('end_date', v)}
                    classNames={{ inputWrapper: 'rounded-[4px] h-10 border-[#E6E6E6]' }}
                  />
                </div>
              </div>

              {/* Dynamic Timeline Stages Builder */}
              <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={14} className="text-[#0075DE]" />
                      Rincian Alur Tahapan ({timelineStages.length})
                    </h3>
                    <p className="text-[11px] text-[#615D59]">
                      Tahapan ini akan tampil sebagai timeline interaktif bagi calon peserta
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#EBF4FC] text-[#0075DE] font-semibold text-xs rounded-full h-7 px-3 border border-[#0075DE]/20"
                    startContent={<Plus size={13} />}
                    onPress={addStage}
                  >
                    Tambah Tahap
                  </Button>
                </div>

                {/* Template Autofill */}
                <div className="bg-[#F6F5F4] border border-[#E6E6E6] rounded-md p-2.5 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-[#31302E] font-medium flex items-center gap-1">
                    <Sparkles size={13} className="text-[#DD5B00]" />
                    Pilih Template Cepat:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['Hackathon', 'LKTI', 'Desain'].map(tpl => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => applyPreset(tpl)}
                        className="text-xs px-2.5 py-1 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-medium transition-all shadow-2xs"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stages List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#615D59] px-0.5">
                    <span className="flex items-center gap-1.5">
                      <GripVertical size={13} className="text-[#9B9A97]" />
                      <span>Tahan & geser tombol titik untuk mengatur urutan alur secara bebas</span>
                    </span>
                    <span className="text-[10px] text-[#9B9A97] font-medium">Total {timelineStages.length} Tahapan</span>
                  </div>

                  {timelineStages.length === 0 ? (
                    <div className="border border-dashed border-[#E6E6E6] rounded-lg p-8 text-center bg-[#FDFDFD] space-y-2">
                      <Clock size={28} className="mx-auto text-[#9B9A97]" />
                      <p className="text-xs font-semibold text-[#31302E]">Belum ada tahapan timeline</p>
                      <p className="text-[11px] text-[#615D59]">Pilih template di atas atau klik Tambah Tahap untuk mulai menyusun alur</p>
                      <button
                        type="button"
                        onClick={addStage}
                        className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-[4px] bg-[#0075DE] text-white hover:bg-[#005BAB] transition-colors"
                      >
                        + Tambah Tahapan Pertama
                      </button>
                    </div>
                  ) : (
                    timelineStages.map((stage, idx) => (
                      <div
                        key={stage.id}
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
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
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

                            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold text-[#31302E] bg-[#F6F5F4] border border-[#E6E6E6] shrink-0">
                              Tahap {idx + 1}
                            </span>

                            <div className="relative inline-flex items-center">
                              <select
                                value={stage.status}
                                onChange={e => updateStage(idx, 'status', e.target.value as TimelineStatus)}
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
                              onClick={() => moveStage(idx, 'up')}
                              className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[#9B9A97] hover:text-[#000000] hover:bg-[#EFEFED] disabled:opacity-20 transition-colors"
                              title="Pindahkan ke atas"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === timelineStages.length - 1}
                              onClick={() => moveStage(idx, 'down')}
                              className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[#9B9A97] hover:text-[#000000] hover:bg-[#EFEFED] disabled:opacity-20 transition-colors"
                              title="Pindahkan ke bawah"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <div className="w-[1px] h-3 bg-[#E6E6E6] mx-0.5" />
                            <button
                              type="button"
                              onClick={() => removeStage(idx)}
                              className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[#9B9A97] hover:text-[#EB5757] hover:bg-[#FBEBEA] transition-colors"
                              title="Hapus tahap alur ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider mb-1 block">
                            Nama Tahapan
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Pengumuman 20 Tim Finalis & Technical Meeting"
                            value={stage.title}
                            onChange={e => updateStage(idx, 'title', e.target.value)}
                            className="w-full text-xs font-semibold text-[#000000] placeholder:text-[#9B9A97] px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden transition-all shadow-2xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-[#615D59] flex items-center gap-1">
                              <Calendar size={11} className="text-[#0075DE]" />
                              Tanggal Mulai
                            </label>
                            <input
                              type="date"
                              value={stage.start_date ? stage.start_date.split('T')[0] : ''}
                              onChange={e => updateStage(idx, 'start_date', e.target.value)}
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
                              onChange={e => updateStage(idx, 'end_date', e.target.value)}
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
                              onChange={e => updateStage(idx, 'location_or_link', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-[#615D59] flex items-center gap-1">
                            <FileText size={11} className="text-[#615D59]" />
                            Rincian Deskripsi Kegiatan
                          </label>
                          <input
                            type="text"
                            placeholder="Deskripsi singkat kegiatan alur alokasi tahap ini..."
                            value={stage.description}
                            onChange={e => updateStage(idx, 'description', e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden transition-colors"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Syarat & Formulir Peserta (Organizer Custom Builder) ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white border border-[#E6E6E6] shadow-2xs">
                <p className="text-xs text-[#0075DE] font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <SlidersHorizontal size={14} /> Atur Syarat & Formulir Pendaftaran Peserta
                </p>
                <p className="text-xs text-[#615D59] mt-1 leading-relaxed">
                  Tentukan data apa saja yang wajib diisi dan diunggah peserta saat mendaftar. Formulir di sisi peserta akan beradaptasi secara otomatis mengikuti pengaturan ini.
                </p>
              </div>

              {/* 1. Aturan Format Kepesertaan */}
              <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3.5 shadow-2xs">
                <div className="border-b border-[#E6E6E6] pb-2">
                  <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-[#0075DE]" />
                    1. Format & Batasan Anggota
                  </h3>
                  <p className="text-[11px] text-[#615D59]">
                    Tentukan format kepesertaan yang diizinkan mendaftar
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formSettings.allow_individual
                        ? 'border-[#0075DE] bg-[#EBF4FC]/30 ring-1 ring-[#0075DE]'
                        : 'border-[#E6E6E6] bg-white hover:border-[#C4C4C0]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formSettings.allow_individual}
                      onChange={e => setFormSettings(prev => ({ ...prev, allow_individual: e.target.checked }))}
                      className="mt-0.5 rounded text-[#0075DE] focus:ring-[#0075DE]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#000000] block">Izinkan Individu (Solo)</span>
                      <span className="text-[11px] text-[#615D59] block leading-relaxed">
                        Peserta dapat mendaftar sendiri tanpa anggota tim.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formSettings.allow_team
                        ? 'border-[#0075DE] bg-[#EBF4FC]/30 ring-1 ring-[#0075DE]'
                        : 'border-[#E6E6E6] bg-white hover:border-[#C4C4C0]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formSettings.allow_team}
                      onChange={e => setFormSettings(prev => ({ ...prev, allow_team: e.target.checked }))}
                      className="mt-0.5 rounded text-[#0075DE] focus:ring-[#0075DE]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#000000] block">Izinkan Tim (Kelompok)</span>
                      <span className="text-[11px] text-[#615D59] block leading-relaxed">
                        Peserta mendaftar sebagai delegasi kelompok dengan ketua & anggota.
                      </span>
                    </div>
                  </label>
                </div>

                {formSettings.allow_team && (
                  <div className="p-3 bg-[#F6F5F4] border border-[#E6E6E6] rounded-md grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                        Jumlah Minimal Anggota Tim
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formSettings.min_team_members ?? 2}
                        onChange={e => setFormSettings(prev => ({ ...prev, min_team_members: Number(e.target.value) }))}
                        className="w-full text-xs font-semibold px-3 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white focus:outline-hidden focus:border-[#0075DE]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                        Jumlah Maksimal Anggota Tim
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={formSettings.max_team_members ?? 4}
                        onChange={e => setFormSettings(prev => ({ ...prev, max_team_members: Number(e.target.value) }))}
                        className="w-full text-xs font-semibold px-3 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white focus:outline-hidden focus:border-[#0075DE]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Checklist Berkas Wajib dari Peserta */}
              <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3.5 shadow-2xs">
                <div className="border-b border-[#E6E6E6] pb-2">
                  <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-[#0075DE]" />
                    2. Berkas & Dokumen yang Diminta dari Peserta
                  </h3>
                  <p className="text-[11px] text-[#615D59]">
                    Centang berkas yang wajib diunggah oleh calon peserta pada saat mendaftar
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      key: 'require_ktm',
                      label: 'Kartu Identitas (KTM / Pelajar)',
                      desc: 'Wajib mengunggah scan foto kartu tanda mahasiswa/pelajar resmi.',
                    },
                    {
                      key: 'require_surat_aktif',
                      label: 'Surat Keterangan Siswa/Mahasiswa Aktif',
                      desc: 'Surat pernyataan bertanda tangan dekanat/sekolah bahwa peserta masih aktif.',
                    },
                    {
                      key: 'require_twibbon',
                      label: 'Bukti Upload Twibbon / Share Poster',
                      desc: 'Screenshot bukti publikasi dan tagar kompetisi di media sosial.',
                    },
                    {
                      key: 'require_proposal',
                      label: 'Proposal / Naskah Karya / Abstrak (PDF)',
                      desc: 'Pengunggahan file draft ide, karya tulis, atau executive summary.',
                    },
                    {
                      key: 'require_pitch_video',
                      label: 'Tautan Video Pitching / Presentasi',
                      desc: 'Link video YouTube unlisted atau Google Drive perkenalan ide/tim.',
                    },
                    {
                      key: 'require_statement_letter',
                      label: 'Surat Pernyataan Orisinalitas (Bermaterai)',
                      desc: 'Pernyataan orisinalitas ide belum pernah menjadi juara lomba lain.',
                    },
                  ].map(doc => {
                    const isChecked = !!(formSettings as any)[doc.key];
                    return (
                      <label
                        key={doc.key}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#0075DE] bg-[#EBF4FC]/25 ring-1 ring-[#0075DE]'
                            : 'border-[#E6E6E6] bg-white hover:border-[#C4C4C0]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => setFormSettings(prev => ({ ...prev, [doc.key]: e.target.checked }))}
                          className="mt-0.5 rounded text-[#0075DE] focus:ring-[#0075DE]"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-[#000000] block">{doc.label}</span>
                          <span className="text-[11px] text-[#615D59] block leading-tight">{doc.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Custom Form Fields Builder */}
              <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#DD5B00]" />
                      3. Pertanyaan & Kolom Kustom Khusus Lomba ({formSettings.custom_fields?.length || 0})
                    </h3>
                    <p className="text-[11px] text-[#615D59]">
                      Tambahkan pertanyaan khusus yang spesifik untuk cabang perlombaan Anda
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#EBF4FC] text-[#0075DE] font-semibold text-xs rounded-full h-7 px-3 border border-[#0075DE]/20"
                    startContent={<Plus size={13} />}
                    onPress={() => addCustomField()}
                  >
                    Tambah Kolom
                  </Button>
                </div>

                {/* Quick Presets */}
                <div className="bg-[#F6F5F4] border border-[#E6E6E6] rounded-md p-2.5 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-[#31302E] font-medium flex items-center gap-1">
                    <Sparkles size={13} className="text-[#0075DE]" />
                    Preset Pertanyaan Cepat:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => addCustomField({
                        field_name: 'Pilihan Subtema / Track Lomba',
                        field_type: 'select',
                        options: ['Track Inovasi 1', 'Track Inovasi 2', 'Track Inovasi 3'],
                        placeholder: 'Pilih Track',
                        help_text: 'Pilih subtema cabang lomba yang diikuti tim.',
                      })}
                      className="text-xs px-2 py-0.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-medium transition-all shadow-2xs"
                    >
                      + Track/Subtema
                    </button>
                    <button
                      type="button"
                      onClick={() => addCustomField({
                        field_name: 'Tautan Repository GitHub / GitLab Tim',
                        field_type: 'url',
                        placeholder: 'https://github.com/...',
                        help_text: 'Tautan source code prototype proyek.',
                      })}
                      className="text-xs px-2 py-0.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-medium transition-all shadow-2xs"
                    >
                      + Link GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => addCustomField({
                        field_name: 'Handle Akun CP (Codeforces / LeetCode)',
                        field_type: 'text',
                        placeholder: 'Username profil kontes',
                        help_text: 'Digunakan dewan juri untuk verifikasi track record pendaftar.',
                      })}
                      className="text-xs px-2 py-0.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-medium transition-all shadow-2xs"
                    >
                      + Handle CP
                    </button>
                    <button
                      type="button"
                      onClick={() => addCustomField({
                        field_name: 'Nama Lengkap & NIP Dosen Pembimbing',
                        field_type: 'text',
                        placeholder: 'Dr. Nama Dosen, M.Kom (NIP: ...)',
                        help_text: 'Dosen yang menandatangani lembar pengesahan tim.',
                      })}
                      className="text-xs px-2 py-0.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-medium transition-all shadow-2xs"
                    >
                      + Dosen Pembimbing
                    </button>
                  </div>
                </div>

                {/* Custom Fields List */}
                <div className="space-y-3">
                  {(!formSettings.custom_fields || formSettings.custom_fields.length === 0) ? (
                    <div className="border border-dashed border-[#E6E6E6] rounded-lg p-6 text-center bg-[#FDFDFD] space-y-1.5">
                      <SlidersHorizontal size={24} className="mx-auto text-[#9B9A97]" />
                      <p className="text-xs font-semibold text-[#31302E]">Belum ada pertanyaan kustom khusus</p>
                      <p className="text-[11px] text-[#615D59]">Gunakan tombol di atas jika membutuhkan data spesifik dari peserta lomba</p>
                    </div>
                  ) : (
                    formSettings.custom_fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="bg-white border border-[#E6E6E6] hover:border-[#C4C4C0] rounded-lg p-3.5 space-y-3 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold text-[#31302E] bg-[#F6F5F4] border border-[#E6E6E6]">
                              Kolom #{idx + 1}
                            </span>
                            <label className="flex items-center gap-1.5 text-xs text-[#31302E] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.is_mandatory}
                                onChange={e => updateCustomField(idx, { is_mandatory: e.target.checked })}
                                className="rounded text-[#0075DE] focus:ring-[#0075DE]"
                              />
                              <span className="font-semibold text-[11px]">Wajib Diisi (Mandatory)</span>
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomField(idx)}
                            className="text-[#9B9A97] hover:text-rose-500 p-1 transition-colors"
                            title="Hapus Kolom Pertanyaan"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
                              Label / Pertanyaan Formulir <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Contoh: Pilihan Subtema / Link Figma / Pengalaman..."
                              value={field.field_name}
                              onChange={e => updateCustomField(idx, { field_name: e.target.value })}
                              className="w-full text-xs font-semibold px-3 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white focus:outline-hidden focus:border-[#0075DE]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
                              Tipe Input
                            </label>
                            <select
                              value={field.field_type}
                              onChange={e => updateCustomField(idx, { field_type: e.target.value as any })}
                              className="w-full text-xs px-2.5 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white focus:outline-hidden focus:border-[#0075DE]"
                            >
                              <option value="text">Teks Singkat</option>
                              <option value="textarea">Paragraf / Teks Panjang</option>
                              <option value="select">Pilihan Ganda / Dropdown</option>
                              <option value="url">Tautan Web / URL</option>
                              <option value="file">Unggah Berkas File</option>
                            </select>
                          </div>
                        </div>

                        {field.field_type === 'select' && (
                          <div className="space-y-1 p-2.5 bg-[#F6F5F4] rounded-[4px] border border-[#E6E6E6]">
                            <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
                              Daftar Pilihan (Pisahkan dengan tanda koma)
                            </label>
                            <input
                              type="text"
                              placeholder="Contoh: AI Medis, AI Edukasi, AI Lingkungan"
                              value={field.options?.join(', ') ?? ''}
                              onChange={e => updateCustomField(idx, {
                                options: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                              })}
                              className="w-full text-xs px-3 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white focus:outline-hidden focus:border-[#0075DE]"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
                              Contoh Teks / Placeholder
                            </label>
                            <input
                              type="text"
                              placeholder="Contoh isi kolom..."
                              value={field.placeholder ?? ''}
                              onChange={e => updateCustomField(idx, { placeholder: e.target.value })}
                              className="w-full text-xs px-3 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white focus:outline-hidden focus:border-[#0075DE]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
                              Petunjuk Bantuan (Help Text)
                            </label>
                            <input
                              type="text"
                              placeholder="Keterangan singkat petunjuk pengisian..."
                              value={field.help_text ?? ''}
                              onChange={e => updateCustomField(idx, { help_text: e.target.value })}
                              className="w-full text-xs px-3 py-1.5 rounded-[4px] border border-[#E6E6E6] bg-white focus:outline-hidden focus:border-[#0075DE]"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review & Terbitkan ─────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Review Header Banner */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={14} className="text-[#0075DE]" />
                    Ringkasan & Konfirmasi Publikasi
                  </h2>
                  <p className="text-[11px] text-[#615D59]">
                    Periksa kembali data kompetisi, alur timeline, serta syarat formulir pendaftaran sebelum diterbitkan
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-[4px] bg-[#EDF6EF] text-[#0F7B6C] border border-[#0F7B6C]/20 flex items-center gap-1">
                  <Check size={12} />
                  Siap Dipublikasikan
                </span>
              </div>

              {/* Competition Header Card */}
              <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 shadow-2xs space-y-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-[#EBF4FC] border border-[#0075DE]/20 text-[#0075DE] flex items-center justify-center shrink-0 shadow-2xs">
                    <Trophy size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/20">
                        {selectedCategory?.name ?? 'Kategori Umum'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#F6F5F4] text-[#615D59] border border-[#E6E6E6]">
                        {form.comp_type === 'individual' ? '👤 Individu' : form.comp_type === 'team' ? '👥 Tim' : '👤/👥 Individu & Tim'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#000000] leading-snug">
                      {form.title || 'Judul Kompetisi Belum Diisi'}
                    </h3>
                    <p className="text-xs text-[#615D59] mt-1 leading-relaxed line-clamp-3">
                      {form.description || 'Belum ada deskripsi yang dimasukkan.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notion Properties Database Sheet */}
              <div className="bg-white border border-[#E6E6E6] rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-[#F6F5F4] px-4 py-2 border-b border-[#E6E6E6] flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#615D59]">
                    Informasi & Ketentuan Kompetisi
                  </span>
                  <span className="text-[10px] text-[#9B9A97]">6 Properti</span>
                </div>
                <div className="divide-y divide-[#E6E6E6]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center px-4 py-2.5 hover:bg-[#F6F5F4]/40 transition-colors text-xs">
                    <div className="flex items-center gap-2 text-[#615D59] font-medium">
                      <Layers size={13} className="text-[#9B9A97]" />
                      <span>Kategori</span>
                    </div>
                    <div className="sm:col-span-2 mt-1 sm:mt-0 flex items-center sm:justify-end">
                      <span className="font-semibold text-[#000000] px-2 py-0.5 rounded-[4px] bg-[#F6F5F4] border border-[#E6E6E6]">
                        {selectedCategory?.name ?? '-'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center px-4 py-2.5 hover:bg-[#F6F5F4]/40 transition-colors text-xs">
                    <div className="flex items-center gap-2 text-[#615D59] font-medium">
                      <Users size={13} className="text-[#9B9A97]" />
                      <span>Format Partisipasi</span>
                    </div>
                    <div className="sm:col-span-2 mt-1 sm:mt-0 flex items-center sm:justify-end">
                      <span className="font-semibold text-[#000000]">
                        {formSettings.allow_individual && formSettings.allow_team
                          ? `Individu & Tim (${formSettings.min_team_members}-${formSettings.max_team_members} orang)`
                          : formSettings.allow_team
                          ? `Hanya Tim (${formSettings.min_team_members}-${formSettings.max_team_members} orang)`
                          : 'Hanya Individu (Solo)'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center px-4 py-2.5 hover:bg-[#F6F5F4]/40 transition-colors text-xs">
                    <div className="flex items-center gap-2 text-[#615D59] font-medium">
                      <Ticket size={13} className="text-[#9B9A97]" />
                      <span>Biaya Pendaftaran</span>
                    </div>
                    <div className="sm:col-span-2 mt-1 sm:mt-0 flex items-center sm:justify-end">
                      <span className={`font-semibold px-2 py-0.5 rounded-[4px] ${
                        Number(form.registration_fee) === 0
                          ? 'bg-[#EDF6EF] text-[#0F7B6C] border border-[#0F7B6C]/20'
                          : 'text-[#000000]'
                      }`}>
                        {Number(form.registration_fee) === 0 ? 'Gratis (Free Entry)' : `Rp ${Number(form.registration_fee).toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center px-4 py-2.5 hover:bg-[#F6F5F4]/40 transition-colors text-xs">
                    <div className="flex items-center gap-2 text-[#615D59] font-medium">
                      <Award size={13} className="text-[#9B9A97]" />
                      <span>Hadiah & Penghargaan</span>
                    </div>
                    <div className="sm:col-span-2 mt-1 sm:mt-0 flex items-center sm:justify-end">
                      <span className="font-bold text-[#DD5B00] bg-[#FDF5E8] border border-[#DD5B00]/30 px-2.5 py-0.5 rounded-[4px]">
                        {form.prize_info ? (!isNaN(Number(form.prize_info)) ? `Rp ${Number(form.prize_info).toLocaleString('id-ID')}` : form.prize_info) : 'Sertifikat & Penghargaan'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center px-4 py-2.5 hover:bg-[#F6F5F4]/40 transition-colors text-xs">
                    <div className="flex items-center gap-2 text-[#615D59] font-medium">
                      <Calendar size={13} className="text-[#9B9A97]" />
                      <span>Batas Pendaftaran</span>
                    </div>
                    <div className="sm:col-span-2 mt-1 sm:mt-0 flex items-center sm:justify-end">
                      <span className="font-semibold text-[#000000]">
                        {form.registration_deadline ? new Date(form.registration_deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settingan Form Peserta Card */}
              <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6E6E6]">
                  <h3 className="text-xs font-bold text-[#000000] flex items-center gap-1.5 uppercase tracking-wider">
                    <SlidersHorizontal size={14} className="text-[#0075DE]" />
                    Syarat Formulir & Berkas Peserta
                  </h3>
                  <span className="text-[10px] text-[#9B9A97]">Sesuai Settingan Penyelenggara</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-[#615D59] block mb-1">Dokumen Wajib:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formSettings.require_ktm && (
                        <span className="px-2 py-0.5 rounded bg-[#F6F5F4] border border-[#E6E6E6] text-[#31302E] text-[11px]">
                          ✓ Kartu Identitas / KTM
                        </span>
                      )}
                      {formSettings.require_surat_aktif && (
                        <span className="px-2 py-0.5 rounded bg-[#F6F5F4] border border-[#E6E6E6] text-[#31302E] text-[11px]">
                          ✓ Surat Keterangan Aktif
                        </span>
                      )}
                      {formSettings.require_twibbon && (
                        <span className="px-2 py-0.5 rounded bg-[#F6F5F4] border border-[#E6E6E6] text-[#31302E] text-[11px]">
                          ✓ Bukti Twibbon / Share
                        </span>
                      )}
                      {formSettings.require_proposal && (
                        <span className="px-2 py-0.5 rounded bg-[#F6F5F4] border border-[#E6E6E6] text-[#31302E] text-[11px]">
                          ✓ Proposal / Abstrak Karya
                        </span>
                      )}
                      {formSettings.require_pitch_video && (
                        <span className="px-2 py-0.5 rounded bg-[#F6F5F4] border border-[#E6E6E6] text-[#31302E] text-[11px]">
                          ✓ Video Pitching / Presentasi
                        </span>
                      )}
                      {formSettings.require_statement_letter && (
                        <span className="px-2 py-0.5 rounded bg-[#F6F5F4] border border-[#E6E6E6] text-[#31302E] text-[11px]">
                          ✓ Surat Pernyataan Orisinalitas
                        </span>
                      )}
                    </div>
                  </div>

                  {formSettings.custom_fields && formSettings.custom_fields.length > 0 && (
                    <div className="pt-2 border-t border-[#E6E6E6]/60">
                      <span className="text-[11px] font-semibold text-[#615D59] block mb-1">Kolom Pertanyaan Khusus ({formSettings.custom_fields.length}):</span>
                      <div className="space-y-1">
                        {formSettings.custom_fields.map((cf, idx) => (
                          <div key={cf.id || idx} className="flex items-center justify-between text-[11px] bg-[#F6F5F4]/60 p-1.5 rounded border border-[#E6E6E6]">
                            <span className="font-medium text-[#000000]">{cf.field_name}</span>
                            <span className="text-[10px] text-[#615D59] font-mono">
                              [{cf.field_type}] {cf.is_mandatory ? '• Wajib' : '• Opsional'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Stages Preview */}
              {timelineStages.length > 0 && (
                <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E6E6E6]">
                    <h3 className="text-xs font-bold text-[#000000] flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar size={14} className="text-[#0075DE]" />
                      Susunan Alur & Timeline Lomba ({timelineStages.length} Tahap)
                    </h3>
                    <span className="text-[10px] text-[#9B9A97] font-medium">Urutan alur yang telah diatur</span>
                  </div>
                  <div className="space-y-2">
                    {timelineStages.map((st, i) => (
                      <div
                        key={st.id || i}
                        className="flex items-start gap-3 p-2.5 rounded-[4px] bg-[#F6F5F4]/60 border border-[#E6E6E6] hover:bg-white hover:border-[#C4C4C0] transition-colors"
                      >
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-white border border-[#E6E6E6] text-[#000000] font-bold text-[11px] shrink-0 mt-0.5 shadow-2xs">
                          Tahap {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="font-semibold text-xs text-[#000000]">{st.title || `Tahap ${i + 1}`}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${
                              st.status === 'current'
                                ? 'bg-[#FDF5E8] text-[#DD5B00] border-[#DD5B00]/40'
                                : st.status === 'completed'
                                ? 'bg-[#EDF6EF] text-[#0F7B6C] border-[#0F7B6C]/40'
                                : 'bg-[#F6F5F4] text-[#615D59] border-[#E6E6E6]'
                            }`}>
                              {st.status === 'current' ? '🔥 Sedang Berjalan' : st.status === 'completed' ? '✓ Selesai' : '⏳ Akan Datang'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#615D59] mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} className="text-[#9B9A97]" />
                              {st.start_date ? new Date(st.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                              {st.end_date ? ` — ${new Date(st.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                            </span>
                            {st.location_or_link && (
                              <span className="flex items-center gap-1">
                                <MapPin size={11} className="text-[#0075DE]" />
                                {st.location_or_link}
                              </span>
                            )}
                          </div>
                          {st.description && (
                            <p className="text-[11px] text-[#615D59] mt-1 leading-relaxed bg-white/70 p-1.5 rounded-[4px] border border-[#E6E6E6]/60">
                              {st.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notion Callout Alert */}
              <div className="p-3.5 rounded-lg bg-[#EDF6EF] border border-[#0F7B6C]/25 text-[#0F7B6C] flex items-start gap-2.5">
                <Check size={16} className="mt-0.5 text-[#0F7B6C] shrink-0" />
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold block text-[#0F7B6C]">Publikasi Instan & Formulir Terintegrasi</span>
                  <span className="text-[#0F7B6C]/90">
                    Setelah menekan tombol "Publikasikan Kompetisi!", peserta dapat langsung mendaftar sesuai dengan berkas dan pertanyaan kustom yang telah Anda rancang di atas.
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t border-[#E6E6E6]">
        {step > 1 && (
          <Button
            variant="bordered"
            className="flex-1 rounded-full h-10 border-[#E6E6E6] text-xs font-medium text-[#31302E] hover:bg-[#F6F5F4]"
            onPress={goBack}
            startContent={<ArrowLeft size={14} />}
          >
            Kembali
          </Button>
        )}
        {step < 4 ? (
          <Button
            className="flex-1 bg-[#0075DE] hover:bg-[#005BAB] text-white rounded-full h-10 text-xs font-semibold shadow-2xs"
            onPress={goNext}
            endContent={<ArrowRight size={14} />}
            id={`create-step-${step}-next`}
          >
            Selanjutnya
          </Button>
        ) : (
          <Button
            className="flex-1 bg-[#0075DE] hover:bg-[#005BAB] text-white rounded-full h-10 text-xs font-semibold shadow-2xs"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            endContent={!isSubmitting && <Check size={14} />}
            id="create-competition-submit"
          >
            Publikasikan Kompetisi!
          </Button>
        )}
      </div>
    </div>
  );
}
