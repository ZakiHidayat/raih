'use client';

// ============================================================
// RAIH — Participant Competition Registration Page
// Design System: Notion (Warm canvas #F6F5F4, #FFFFFF card, 1px #E6E6E6 hairline border)
// Dynamic form adapting to organizer's custom requirements & form settings
// ============================================================
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, addToast } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  FileText,
  Trophy,
  Shield,
  Upload,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Layers,
} from '@/components/ui/icons';
import { competitionRepo, registrationRepo } from '@/lib/repositories/local';
import { useAuthStore } from '@/lib/stores/auth';
import type { CompetitionWithDetails, CompetitionFormSettings, CustomFormField } from '@/types';

interface TeamMemberDraft {
  name: string;
  email: string;
  role: string;
}

export default function CompetitionRegistrationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [comp, setComp] = useState<CompetitionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');

  // Form State: Participation
  const [participationType, setParticipationType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberDraft[]>([
    { name: '', email: '', role: 'Anggota 1' },
  ]);

  // Personal Info (prefilled from auth user if available)
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [institution, setInstitution] = useState(user?.location || '');
  const [major, setMajor] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Required Documents (dynamically shown based on organizer settings)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [pitchVideoUrl, setPitchVideoUrl] = useState('');

  // Dynamic Custom Responses (for organizer's custom_fields)
  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va_bca' | 'va_mandiri'>('qris');
  const [paymentProofFile, setPaymentProofFile] = useState<string | null>(null);

  // Agreement & Errors
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      const data = await competitionRepo.getById(Number(params.id));
      if (!data) {
        setIsLoading(false);
        return;
      }
      setComp(data);

      const fs = data.form_settings;
      if (fs) {
        if (!fs.allow_individual && fs.allow_team) {
          setParticipationType('team');
        } else if (fs.allow_individual && !fs.allow_team) {
          setParticipationType('individual');
        } else if (data.comp_type === 'team') {
          setParticipationType('team');
        }

        // Initialize custom responses with first select options or empty string
        if (fs.custom_fields && fs.custom_fields.length > 0) {
          const initRes: Record<string, string> = {};
          fs.custom_fields.forEach(cf => {
            if (cf.field_type === 'select' && cf.options && cf.options.length > 0) {
              initRes[cf.id] = cf.options[0];
            } else {
              initRes[cf.id] = '';
            }
          });
          setCustomResponses(initRes);
        }
      }

      setIsLoading(false);
    }
    load();
  }, [params?.id]);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name);
      if (!email) setEmail(user.email);
      if (!institution && user.location) setInstitution(user.location);
    }
  }, [user, fullName, email, institution]);

  const fs: CompetitionFormSettings = comp?.form_settings ?? {
    allow_individual: true,
    allow_team: true,
    min_team_members: 2,
    max_team_members: 4,
    require_ktm: true,
    require_surat_aktif: false,
    require_twibbon: false,
    require_proposal: false,
    require_pitch_video: false,
    require_statement_letter: false,
    custom_fields: [],
  };

  const maxAdditionalMembers = Math.max(1, (fs.max_team_members || 4) - 1);
  const minRequiredAdditionalMembers = Math.max(0, (fs.min_team_members || 2) - 1);

  const addTeamMember = () => {
    if (teamMembers.length >= maxAdditionalMembers) {
      addToast({
        title: `Maksimal ${fs.max_team_members || 4} orang dalam 1 tim (1 Ketua + ${maxAdditionalMembers} Anggota)`,
        color: 'warning',
      });
      return;
    }
    setTeamMembers(prev => [...prev, { name: '', email: '', role: `Anggota ${prev.length + 1}` }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMemberDraft, value: string) => {
    setTeamMembers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSimulateUpload = (key: string, defaultName: string) => {
    setUploadedFiles(prev => ({ ...prev, [key]: defaultName }));
    addToast({ title: `${defaultName} berhasil diunggah`, color: 'success' });
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleAutoFill = () => {
    // Fill personal info from user store or realistic student profile
    const name = user?.name || 'Ariel Pratama';
    const mail = user?.email || 'ariel.pratama@itb.ac.id';
    const univ = user?.location || 'Institut Teknologi Bandung';

    setFullName(name);
    setEmail(mail);
    setWhatsapp('081298765432');
    setInstitution(univ);
    setMajor('Teknik Informatika');
    setIdNumber('13521045');

    // Auto attach verified documents from profile repository
    const autoDocs: Record<string, string> = {};
    if (fs.require_ktm) autoDocs['ktm'] = 'KTM_Terverifikasi_ITB_13521045.pdf';
    if (fs.require_surat_aktif) autoDocs['surat_aktif'] = 'Surat_Mahasiswa_Aktif_ITB_2026.pdf';
    if (fs.require_twibbon) autoDocs['twibbon'] = 'Bukti_Twibbon_Poster_Instagram.png';
    if (fs.require_proposal) autoDocs['proposal'] = 'Draft_Proposal_Karya_Inovatif.pdf';
    if (fs.require_statement_letter) autoDocs['statement_letter'] = 'Surat_Pernyataan_Orisinalitas_Signed.pdf';

    if (fs.require_pitch_video && !pitchVideoUrl) {
      setPitchVideoUrl('https://youtu.be/raih-pitch-demo');
    }

    setUploadedFiles(prev => ({ ...prev, ...autoDocs }));
    setErrors({});

    addToast({
      title: '⚡ Auto-Fill Berhasil!',
      description: 'Data diri & berkas terverifikasi dari akun Anda berhasil diisi otomatis.',
      color: 'success',
    });
  };

  const handleCustomResponse = (fieldId: string, val: string) => {
    setCustomResponses(prev => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi';
    if (!email.trim()) errs.email = 'Email aktif wajib diisi';
    if (!whatsapp.trim()) errs.whatsapp = 'Nomor WhatsApp wajib diisi untuk koordinasi';
    if (!institution.trim()) errs.institution = 'Asal instansi / universitas wajib diisi';

    // Format & Team validation
    if (participationType === 'team') {
      if (!teamName.trim()) errs.teamName = 'Nama tim wajib diisi';
      if (teamMembers.length < minRequiredAdditionalMembers) {
        errs.teamMembers = `Organizer mensyaratkan minimal ${fs.min_team_members || 2} orang dalam tim (tambahkan minimal ${minRequiredAdditionalMembers} anggota)`;
      }
      // Check if added members have name
      for (let i = 0; i < minRequiredAdditionalMembers; i++) {
        if (teamMembers[i] && !teamMembers[i].name.trim()) {
          errs.teamMembers = `Nama anggota tim #${i + 1} wajib diisi`;
          break;
        }
      }
    }

    // Required documents according to organizer settings
    if (fs.require_ktm && !uploadedFiles['ktm']) {
      errs['ktm'] = 'Kartu identitas (KTM / Pelajar) wajib diunggah sesuai syarat penyelenggara';
    }
    if (fs.require_surat_aktif && !uploadedFiles['surat_aktif']) {
      errs['surat_aktif'] = 'Surat keterangan aktif wajib diunggah sesuai syarat penyelenggara';
    }
    if (fs.require_twibbon && !uploadedFiles['twibbon']) {
      errs['twibbon'] = 'Bukti upload twibbon/poster wajib diunggah sesuai syarat penyelenggara';
    }
    if (fs.require_proposal && !uploadedFiles['proposal']) {
      errs['proposal'] = 'Proposal / naskah karya (PDF) wajib diunggah sesuai syarat penyelenggara';
    }
    if (fs.require_pitch_video && !pitchVideoUrl.trim()) {
      errs['pitch_video'] = 'Tautan link video pitch wajib diisi sesuai syarat penyelenggara';
    }
    if (fs.require_statement_letter && !uploadedFiles['statement_letter']) {
      errs['statement_letter'] = 'Surat pernyataan orisinalitas bermaterai wajib diunggah sesuai syarat penyelenggara';
    }

    // Custom fields validation
    if (fs.custom_fields && fs.custom_fields.length > 0) {
      for (const cf of fs.custom_fields) {
        if (cf.is_mandatory) {
          const val = customResponses[cf.id];
          if (!val || !val.trim()) {
            errs[cf.id] = `Kolom "${cf.field_name}" wajib diisi sesuai permintaan penyelenggara`;
          }
        }
      }
    }

    // Payment validation
    const regFee = comp?.registration_fee ?? 0;
    if (regFee > 0 && !paymentProofFile) {
      errs.payment = 'Harap unggah bukti transfer pendaftaran';
    }

    // Integrity agreement
    if (!agreed) {
      errs.agreed = 'Anda harus menyetujui pakta integritas dan ketentuan kompetisi';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      addToast({
        title: 'Harap penuhi semua berkas & kolom formulir yang diminta organizer',
        color: 'danger',
      });
      return;
    }

    if (!comp) return;

    setIsSubmitting(true);
    try {
      await registrationRepo.create({
        competition_id: comp.id,
        user_id: user?.id ?? 1,
        team_id: participationType === 'team' ? Date.now() : null,
        status: 'approved',
      });

      const uniqueCode = `RAIH-${comp.id}-${Date.now().toString().slice(-4)}`;
      setRegistrationCode(uniqueCode);
      setIsSuccess(true);

      addToast({
        title: '🎉 Pendaftaran Berhasil!',
        description: 'Anda telah resmi terdaftar sesuai kriteria yang diminta oleh organizer.',
        color: 'success',
      });
    } catch {
      addToast({ title: 'Gagal memproses pendaftaran', color: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <Clock size={32} className="mx-auto text-[#0075DE] animate-spin" />
        <p className="text-xs text-[#615D59]">Memuat formulir pendaftaran kompetisi...</p>
      </div>
    );
  }

  if (!comp) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <p className="text-sm font-bold text-[#000000]">Kompetisi tidak ditemukan</p>
        <Link
          href="/home"
          className="text-xs text-[#0075DE] hover:underline inline-block font-semibold"
        >
          ← Kembali ke Katalog Publik
        </Link>
      </div>
    );
  }

  const isFree = (comp.registration_fee ?? 0) === 0;
  const adminFee = isFree ? 0 : 5000;
  const totalFee = (comp.registration_fee ?? 0) + adminFee;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* ── Top Bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/competitions/${comp.id}`)}
          className="w-8 h-8 rounded-md border border-[#E6E6E6] bg-white flex items-center justify-center text-[#615D59] hover:text-[#000000] hover:bg-[#F6F5F4] transition-colors shadow-2xs"
          title="Kembali ke Detail Lomba"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#000000] tracking-tight">Formulir Pendaftaran Peserta</h1>
          <p className="text-xs text-[#615D59]">
            Lengkapi data dan berkas sesuai dengan persyaratan yang telah ditentukan oleh pihak penyelenggara
          </p>
        </div>
      </div>

      {/* ── Success Registration State (E-Ticket) ─────────── */}
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-xs space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#EDF6EF] text-[#0F7B6C] border border-[#0F7B6C]/20 flex items-center justify-center mx-auto shadow-2xs">
            <Check size={32} />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-[4px] bg-[#EDF6EF] text-[#0F7B6C] border border-[#0F7B6C]/20">
              ✓ Pendaftaran Terverifikasi & Resmi
            </span>
            <h2 className="text-lg font-bold text-[#000000]">Selamat, Pendaftaran Anda Telah Diterima!</h2>
            <p className="text-xs text-[#615D59] leading-relaxed">
              Seluruh data pendaftaran dan berkas persyaratan yang diminta oleh organizer telah tercatat rapi di sistem Raih.
            </p>
          </div>

          {/* Digital E-Ticket Pass */}
          <div className="max-w-md mx-auto bg-[#F6F5F4] border border-[#E6E6E6] rounded-lg p-5 text-left space-y-3.5 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0075DE] text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Tiket Peserta Resmi
            </div>

            <div className="border-b border-[#E6E6E6] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#615D59]">
                {comp.category?.name ?? 'Kategori Umum'}
              </span>
              <h3 className="text-sm font-bold text-[#000000] line-clamp-1 mt-0.5">{comp.title}</h3>
              <p className="text-[10px] text-[#615D59] mt-0.5">
                Diselenggarakan oleh: {comp.organizer?.organization_name ?? 'Penyelenggara Lomba'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#9B9A97] block font-medium">Nomor Registrasi:</span>
                <span className="font-mono font-bold text-[#0075DE] text-xs">{registrationCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9A97] block font-medium">Format Kepesertaan:</span>
                <span className="font-semibold text-[#31302E]">
                  {participationType === 'team' ? `Tim: ${teamName || 'Kelompok'}` : 'Individu (Solo)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9A97] block font-medium">Nama Peserta / Ketua:</span>
                <span className="font-semibold text-[#31302E]">{fullName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9A97] block font-medium">Asal Instansi:</span>
                <span className="font-semibold text-[#31302E] truncate block">{institution}</span>
              </div>
            </div>

            {/* Custom Field Summary */}
            {fs.custom_fields && fs.custom_fields.length > 0 && (
              <div className="pt-2.5 border-t border-[#E6E6E6] space-y-1">
                <span className="text-[10px] font-semibold text-[#615D59] uppercase block tracking-wider">
                  Jawaban Formulir Khusus:
                </span>
                {fs.custom_fields.map(cf => (
                  <div key={cf.id} className="text-[11px] flex justify-between text-[#31302E]">
                    <span className="text-[#615D59] truncate max-w-[150px]">{cf.field_name}:</span>
                    <span className="font-medium truncate max-w-[180px]">{customResponses[cf.id] || '-'}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-[#E6E6E6] flex items-center justify-between text-[11px] text-[#615D59]">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-[#0075DE]" />
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="text-[10px] font-semibold text-[#0F7B6C] bg-white px-2 py-0.5 rounded border border-[#E6E6E6]">
                Status: Lolos Administrasi
              </span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Button
              className="w-full sm:w-auto bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-semibold rounded-full h-9 px-5 shadow-2xs"
              onPress={() => router.push(`/competitions/${comp.id}`)}
              startContent={<Calendar size={14} />}
            >
              Lihat Timeline & Alur Lomba
            </Button>
            <Button
              variant="bordered"
              className="w-full sm:w-auto border-[#E6E6E6] hover:bg-[#F6F5F4] text-[#31302E] text-xs font-medium rounded-full h-9 px-5"
              onPress={() => router.push('/activity')}
            >
              Buka Riwayat Pendaftaran
            </Button>
            {participationType === 'team' && (
              <Button
                variant="bordered"
                className="w-full sm:w-auto border-[#E6E6E6] hover:bg-[#F6F5F4] text-[#31302E] text-xs font-medium rounded-full h-9 px-5"
                onPress={() => router.push('/teammates')}
                startContent={<Users size={14} className="text-[#0075DE]" />}
              >
                Cari Tambahan Anggota
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        /* ── Dynamic Registration Form ───────────────────────── */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Competition Snapshot Card */}
          <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/20 flex items-center justify-center shrink-0">
                <Trophy size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/20">
                    {comp.category?.name ?? 'Kategori Umum'}
                  </span>
                  <span className="text-[10px] text-[#615D59] flex items-center gap-1 font-medium">
                    <Calendar size={11} className="text-[#9B9A97]" />
                    Batas Pendaftaran: {new Date(comp.registration_deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-[#000000] line-clamp-1">{comp.title}</h2>
                <p className="text-[11px] text-[#615D59] mt-0.5">
                  Penyelenggara: {comp.organizer?.organization_name ?? 'Penyelenggara Terverifikasi'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E6E6E6]">
              <span className="text-[10px] text-[#9B9A97] block">Biaya Registrasi:</span>
              <span className="text-xs font-bold text-[#000000]">
                {isFree ? 'Gratis (Free Entry)' : `Rp ${comp.registration_fee.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>

          {/* Organizer Notice Banner */}
          <div className="p-3 bg-[#EBF4FC]/40 border border-[#0075DE]/20 rounded-lg flex items-center gap-2.5 text-xs text-[#0075DE]">
            <SlidersHorizontal size={15} className="shrink-0" />
            <span>
              Formulir ini dikonfigurasi khusus oleh <strong>{comp.organizer?.organization_name ?? 'penyelenggara'}</strong>. Harap isi data dan lampirkan berkas yang telah ditentukan.
            </span>
          </div>

          {/* ── Auto-Fill Quick Action (Feedback Grid Solution) ───────── */}
          <div className="bg-[#EDF6EF] border border-[#0F7B6C]/30 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#0F7B6C]/10 text-[#0F7B6C] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F7B6C]">
                    Fitur Praktis: Auto-Fill Profil & Berkas Tersimpan
                  </span>
                  <span className="text-[9px] font-bold bg-[#0F7B6C] text-white px-1.5 py-0.2 rounded-full uppercase">
                    1-Klik Siap
                  </span>
                </div>
                <p className="text-[11px] text-[#31302E] mt-0.5">
                  Isi data diri (nama, kontak, universitas) dan lampirkan KTM serta berkas resmi tersimpan dari akun Anda secara otomatis.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0F7B6C] hover:bg-[#0c6256] text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs"
            >
              <Sparkles size={13} />
              <span>Gunakan Auto-Fill</span>
            </button>
          </div>

          {/* Section 1: Format Partisipasi (Sesuai Settingan Organizer) */}
          <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3.5 shadow-2xs">
            <div className="border-b border-[#E6E6E6] pb-2">
              <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-[#0075DE]" />
                1. Format Partisipasi Peserta
              </h3>
              <p className="text-[11px] text-[#615D59]">
                {fs.allow_individual && fs.allow_team
                  ? 'Penyelenggara mengizinkan pendaftaran individu maupun tim kelompok.'
                  : fs.allow_team
                  ? `Penyelenggara mewajibkan format Tim (${fs.min_team_members || 2} s/d ${fs.max_team_members || 4} orang).`
                  : 'Penyelenggara menetapkan lomba ini khusus untuk peserta Individu (Solo).'}
              </p>
            </div>

            {/* If only team allowed */}
            {!fs.allow_individual && fs.allow_team ? (
              <div className="p-3 rounded-lg bg-[#F6F5F4] border border-[#0075DE]/30 flex items-center gap-2 text-xs">
                <span className="text-base">👥</span>
                <div>
                  <span className="font-bold text-[#000000] block">Format Wajib: Tim (Kelompok)</span>
                  <span className="text-[11px] text-[#615D59]">
                    Ukuran tim: minimal {fs.min_team_members || 2} orang, maksimal {fs.max_team_members || 4} orang (termasuk ketua).
                  </span>
                </div>
              </div>
            ) : fs.allow_individual && !fs.allow_team ? (
              /* If only individual allowed */
              <div className="p-3 rounded-lg bg-[#F6F5F4] border border-[#0075DE]/30 flex items-center gap-2 text-xs">
                <span className="text-base">👤</span>
                <div>
                  <span className="font-bold text-[#000000] block">Format Wajib: Individu (Solo)</span>
                  <span className="text-[11px] text-[#615D59]">
                    Perlombaan ini bersifat perseorangan tanpa pendaftaran tim.
                  </span>
                </div>
              </div>
            ) : (
              /* Both allowed */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    participationType === 'individual'
                      ? 'border-[#0075DE] bg-[#EBF4FC]/20 ring-1 ring-[#0075DE]'
                      : 'border-[#E6E6E6] bg-white hover:border-[#C4C4C0]'
                  }`}
                >
                  <input
                    type="radio"
                    name="participation_type"
                    value="individual"
                    checked={participationType === 'individual'}
                    onChange={() => setParticipationType('individual')}
                    className="mt-0.5 text-[#0075DE] focus:ring-[#0075DE]"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#000000] block">Individu (Solo)</span>
                    <span className="text-[11px] text-[#615D59] block leading-relaxed">
                      Mendaftar secara mandiri tanpa anggota tim untuk kategori perlombaan tunggal.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    participationType === 'team'
                      ? 'border-[#0075DE] bg-[#EBF4FC]/20 ring-1 ring-[#0075DE]'
                      : 'border-[#E6E6E6] bg-white hover:border-[#C4C4C0]'
                  }`}
                >
                  <input
                    type="radio"
                    name="participation_type"
                    value="team"
                    checked={participationType === 'team'}
                    onChange={() => setParticipationType('team')}
                    className="mt-0.5 text-[#0075DE] focus:ring-[#0075DE]"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#000000] block">Tim (Kelompok)</span>
                    <span className="text-[11px] text-[#615D59] block leading-relaxed">
                      Mendaftar sebagai kelompok ({fs.min_team_members || 2} hingga {fs.max_team_members || 4} orang) dengan 1 orang sebagai ketua tim.
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Team Details (when team format is active) */}
            {participationType === 'team' && (
              <div className="mt-3 p-3.5 bg-[#F6F5F4] border border-[#E6E6E6] rounded-lg space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                    Nama Tim <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Nusantara AI Innovator"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    className="w-full text-xs font-semibold text-[#000000] px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden"
                  />
                  {errors.teamName && <p className="text-[10px] text-rose-500 mt-1">{errors.teamName}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
                      Anggota Tim Tambahan (Ketua + {teamMembers.length} Anggota = {teamMembers.length + 1} Orang)
                    </label>
                    <button
                      type="button"
                      onClick={addTeamMember}
                      disabled={teamMembers.length >= maxAdditionalMembers}
                      className="text-[11px] font-semibold text-[#0075DE] hover:text-[#005BAB] disabled:opacity-40 flex items-center gap-1"
                    >
                      <Plus size={12} />
                      Tambah Anggota (Maks. {fs.max_team_members || 4})
                    </button>
                  </div>

                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-[4px] border border-[#E6E6E6]">
                      <span className="w-5 h-5 rounded-full bg-[#EBF4FC] text-[#0075DE] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 2}
                      </span>
                      <input
                        type="text"
                        placeholder={`Nama Anggota ${idx + 1}`}
                        value={member.name}
                        onChange={e => updateTeamMember(idx, 'name', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 rounded-[4px] border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE]"
                      />
                      <input
                        type="email"
                        placeholder="Email Anggota"
                        value={member.email}
                        onChange={e => updateTeamMember(idx, 'email', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 rounded-[4px] border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE]"
                      />
                      {teamMembers.length > minRequiredAdditionalMembers && (
                        <button
                          type="button"
                          onClick={() => removeTeamMember(idx)}
                          className="text-[#9B9A97] hover:text-rose-500 p-1 transition-colors"
                          title="Hapus Anggota"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  {errors.teamMembers && <p className="text-[10px] text-rose-500">{errors.teamMembers}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Data Diri Peserta / Ketua */}
          <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3.5 shadow-2xs">
            <div className="border-b border-[#E6E6E6] pb-2 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-[#0075DE]" />
                  2. Data Diri {participationType === 'team' ? 'Ketua Tim' : 'Peserta'}
                </h3>
                <p className="text-[11px] text-[#615D59]">Informasi kontak resmi untuk notifikasi dan koordinasi alur perlombaan</p>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[11px] font-semibold text-[#0F7B6C] bg-[#EDF6EF] hover:bg-[#d8eedb] border border-[#0F7B6C]/20 px-2.5 py-1 rounded-[4px] inline-flex items-center gap-1 transition-colors shrink-0"
                title="Isi otomatis data diri dari profil tersimpan"
              >
                <Sparkles size={11} />
                <span>Auto-Fill</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama sesuai kartu identitas"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full text-xs font-semibold text-[#000000] px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden"
                />
                {errors.fullName && <p className="text-[10px] text-rose-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                  Email Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="alamat@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold text-[#000000] px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden"
                />
                {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full text-xs font-semibold text-[#000000] px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden"
                />
                {errors.whatsapp && <p className="text-[10px] text-rose-500 mt-1">{errors.whatsapp}</p>}
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                  Asal Instansi / Universitas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Institut Teknologi Bandung"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  className="w-full text-xs font-semibold text-[#000000] px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden"
                />
                {errors.institution && <p className="text-[10px] text-rose-500 mt-1">{errors.institution}</p>}
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                  Program Studi / Jurusan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Teknik Informatika / Desain Komunikasi Visual"
                  value={major}
                  onChange={e => setMajor(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block mb-1">
                  NIM / NISN / No. Identitas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 13521099"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Berkas Persyaratan (Disesuaikan dengan settingan Organizer) */}
          <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3.5 shadow-2xs">
            <div className="border-b border-[#E6E6E6] pb-2">
              <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                <Upload size={14} className="text-[#0075DE]" />
                3. Berkas & Dokumen yang Diwajibkan Organizer
              </h3>
              <p className="text-[11px] text-[#615D59]">
                Penyelenggara menentukan daftar dokumen berikut sebagai persyaratan wajib pendaftaran
              </p>
            </div>

            <div className="space-y-3">
              {/* KTM Upload */}
              {fs.require_ktm && (
                <div className="p-3 bg-[#F6F5F4]/60 border border-[#E6E6E6] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#000000] block">
                        Kartu Identitas (KTM / Pelajar / KTP) <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] text-[#615D59]">Format PDF, JPG, atau PNG (Maks. 5 MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('ktm', 'KTM_Identitas_Resmi.pdf')}
                      className="text-xs px-3 py-1.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-semibold transition-colors shadow-2xs"
                    >
                      {uploadedFiles['ktm'] ? 'Ganti File' : 'Unggah Kartu Identitas'}
                    </button>
                  </div>
                  {uploadedFiles['ktm'] && (
                    <div className="text-[11px] text-[#0F7B6C] flex items-center gap-1 font-medium bg-[#EDF6EF] px-2 py-1 rounded">
                      <Check size={12} /> Terunggah: {uploadedFiles['ktm']}
                    </div>
                  )}
                  {errors['ktm'] && <p className="text-[10px] text-rose-500">{errors['ktm']}</p>}
                </div>
              )}

              {/* Surat Aktif Upload */}
              {fs.require_surat_aktif && (
                <div className="p-3 bg-[#F6F5F4]/60 border border-[#E6E6E6] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#000000] block">
                        Surat Keterangan Aktif Mahasiswa/Siswa <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] text-[#615D59]">Surat resmi bertanda tangan pimpinan fakultas/sekolah</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('surat_aktif', 'Surat_Keterangan_Aktif_Dekanat.pdf')}
                      className="text-xs px-3 py-1.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-semibold transition-colors shadow-2xs"
                    >
                      {uploadedFiles['surat_aktif'] ? 'Ganti File' : 'Unggah Surat Aktif'}
                    </button>
                  </div>
                  {uploadedFiles['surat_aktif'] && (
                    <div className="text-[11px] text-[#0F7B6C] flex items-center gap-1 font-medium bg-[#EDF6EF] px-2 py-1 rounded">
                      <Check size={12} /> Terunggah: {uploadedFiles['surat_aktif']}
                    </div>
                  )}
                  {errors['surat_aktif'] && <p className="text-[10px] text-rose-500">{errors['surat_aktif']}</p>}
                </div>
              )}

              {/* Twibbon Upload */}
              {fs.require_twibbon && (
                <div className="p-3 bg-[#F6F5F4]/60 border border-[#E6E6E6] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#000000] block">
                        Bukti Upload Twibbon / Share Poster <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] text-[#615D59]">Screenshot publikasi di feed/story Instagram</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('twibbon', 'Bukti_Share_Twibbon_Poster.png')}
                      className="text-xs px-3 py-1.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-semibold transition-colors shadow-2xs"
                    >
                      {uploadedFiles['twibbon'] ? 'Ganti File' : 'Unggah Bukti Share'}
                    </button>
                  </div>
                  {uploadedFiles['twibbon'] && (
                    <div className="text-[11px] text-[#0F7B6C] flex items-center gap-1 font-medium bg-[#EDF6EF] px-2 py-1 rounded">
                      <Check size={12} /> Terunggah: {uploadedFiles['twibbon']}
                    </div>
                  )}
                  {errors['twibbon'] && <p className="text-[10px] text-rose-500">{errors['twibbon']}</p>}
                </div>
              )}

              {/* Proposal Upload */}
              {fs.require_proposal && (
                <div className="p-3 bg-[#F6F5F4]/60 border border-[#E6E6E6] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#000000] block">
                        Proposal / Naskah Karya / Abstrak (Format PDF) <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] text-[#615D59]">Dokumen draft rancangan ide solusi tim (Maks. 20 MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('proposal', 'Proposal_Karya_Inovasi_Tim.pdf')}
                      className="text-xs px-3 py-1.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-semibold transition-colors shadow-2xs"
                    >
                      {uploadedFiles['proposal'] ? 'Ganti File' : 'Unggah Proposal PDF'}
                    </button>
                  </div>
                  {uploadedFiles['proposal'] && (
                    <div className="text-[11px] text-[#0F7B6C] flex items-center gap-1 font-medium bg-[#EDF6EF] px-2 py-1 rounded">
                      <Check size={12} /> Terunggah: {uploadedFiles['proposal']}
                    </div>
                  )}
                  {errors['proposal'] && <p className="text-[10px] text-rose-500">{errors['proposal']}</p>}
                </div>
              )}

              {/* Pitch Video URL */}
              {fs.require_pitch_video && (
                <div className="p-3 bg-[#F6F5F4]/60 border border-[#E6E6E6] rounded-lg space-y-1.5">
                  <label className="text-xs font-bold text-[#000000] block">
                    Tautan Link Video Pitching / Presentasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtu.be/... atau link Google Drive (akses publik/unlisted)"
                    value={pitchVideoUrl}
                    onChange={e => setPitchVideoUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden"
                  />
                  {errors['pitch_video'] && <p className="text-[10px] text-rose-500">{errors['pitch_video']}</p>}
                </div>
              )}

              {/* Statement Letter Upload */}
              {fs.require_statement_letter && (
                <div className="p-3 bg-[#F6F5F4]/60 border border-[#E6E6E6] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#000000] block">
                        Surat Pernyataan Orisinalitas & Pakta Integritas (Bermaterai) <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] text-[#615D59]">Ditandatangani di atas materai Rp 10.000</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('statement_letter', 'Surat_Orisinalitas_Bermaterai.pdf')}
                      className="text-xs px-3 py-1.5 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE] font-semibold transition-colors shadow-2xs"
                    >
                      {uploadedFiles['statement_letter'] ? 'Ganti File' : 'Unggah Surat Orisinalitas'}
                    </button>
                  </div>
                  {uploadedFiles['statement_letter'] && (
                    <div className="text-[11px] text-[#0F7B6C] flex items-center gap-1 font-medium bg-[#EDF6EF] px-2 py-1 rounded">
                      <Check size={12} /> Terunggah: {uploadedFiles['statement_letter']}
                    </div>
                  )}
                  {errors['statement_letter'] && <p className="text-[10px] text-rose-500">{errors['statement_letter']}</p>}
                </div>
              )}

              {/* If no documents required */}
              {!fs.require_ktm && !fs.require_surat_aktif && !fs.require_twibbon && !fs.require_proposal && !fs.require_pitch_video && !fs.require_statement_letter && (
                <div className="p-4 text-center text-xs text-[#615D59] bg-[#F6F5F4] rounded-lg border border-[#E6E6E6]">
                  Tidak ada dokumen prasyarat berkas yang diminta organizer pada tahap pendaftaran awal ini.
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Formulir Khusus dari Organizer (Custom Fields Builder Output) */}
          {fs.custom_fields && fs.custom_fields.length > 0 && (
            <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3.5 shadow-2xs">
              <div className="border-b border-[#E6E6E6] pb-2">
                <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#DD5B00]" />
                  4. Formulir Khusus dari Penyelenggara ({fs.custom_fields.length} Kolom)
                </h3>
                <p className="text-[11px] text-[#615D59]">
                  Pertanyaan khusus yang ditetapkan oleh panitia pengelola kompetisi ini
                </p>
              </div>

              <div className="space-y-3.5">
                {fs.custom_fields.map((field, idx) => (
                  <div key={field.id || idx} className="space-y-1">
                    <label className="text-xs font-semibold text-[#000000] block">
                      {field.field_name}{' '}
                      {field.is_mandatory && <span className="text-rose-500">*</span>}
                    </label>

                    {/* Text field */}
                    {field.field_type === 'text' && (
                      <input
                        type="text"
                        placeholder={field.placeholder || 'Ketikkan jawaban Anda...'}
                        value={customResponses[field.id] || ''}
                        onChange={e => handleCustomResponse(field.id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden"
                      />
                    )}

                    {/* Textarea field */}
                    {field.field_type === 'textarea' && (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder || 'Tuliskan penjelasan rinci...'}
                        value={customResponses[field.id] || ''}
                        onChange={e => handleCustomResponse(field.id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden resize-none"
                      />
                    )}

                    {/* Select dropdown */}
                    {field.field_type === 'select' && (
                      <select
                        value={customResponses[field.id] || ''}
                        onChange={e => handleCustomResponse(field.id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden cursor-pointer"
                      >
                        {field.options && field.options.map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* URL link */}
                    {field.field_type === 'url' && (
                      <input
                        type="url"
                        placeholder={field.placeholder || 'https://...'}
                        value={customResponses[field.id] || ''}
                        onChange={e => handleCustomResponse(field.id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white hover:border-[#C4C4C0] focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] focus:outline-hidden"
                      />
                    )}

                    {/* File upload field */}
                    {field.field_type === 'file' && (
                      <div className="flex items-center justify-between p-2.5 bg-[#F6F5F4] rounded-[4px] border border-[#E6E6E6]">
                        <span className="text-[11px] text-[#615D59]">
                          {customResponses[field.id] ? `Terunggah: ${customResponses[field.id]}` : 'Format Dokumen / Gambar'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCustomResponse(field.id, `${field.field_name.slice(0, 15)}_Upload.pdf`)}
                          className="text-xs px-2.5 py-1 rounded bg-white border border-[#E6E6E6] hover:border-[#0075DE] font-semibold"
                        >
                          {customResponses[field.id] ? 'Ganti' : 'Pilih Berkas'}
                        </button>
                      </div>
                    )}

                    {field.help_text && (
                      <p className="text-[10px] text-[#615D59]">{field.help_text}</p>
                    )}

                    {errors[field.id] && (
                      <p className="text-[10px] text-rose-500">{errors[field.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Biaya & Pembayaran */}
          <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3.5 shadow-2xs">
            <div className="border-b border-[#E6E6E6] pb-2">
              <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                <Ticket size={14} className="text-[#0075DE]" />
                5. Rincian Biaya & Pembayaran
              </h3>
              <p className="text-[11px] text-[#615D59]">Kalkulasi resmi pendaftaran peserta kompetisi</p>
            </div>

            <div className="bg-[#F6F5F4] p-3.5 rounded-lg border border-[#E6E6E6] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#615D59]">
                <span>Biaya Pendaftaran ({comp.title})</span>
                <span className="font-semibold text-[#000000]">
                  {isFree ? 'Rp 0 (Gratis)' : `Rp ${comp.registration_fee.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#615D59]">
                <span>Biaya Administrasi & Sistem Terintegrasi Raih</span>
                <span className="font-semibold text-[#000000]">
                  {isFree ? 'Rp 0' : `Rp ${adminFee.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E6E6E6] flex justify-between items-center text-sm font-bold text-[#000000]">
                <span>Total Pembayaran</span>
                <span className="text-[#0075DE]">
                  {isFree ? 'Gratis (Rp 0)' : `Rp ${totalFee.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>

            {!isFree && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
                  Pilih Saluran Pembayaran
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'qris', label: 'QRIS', sub: 'Instant (BCA, GoPay, OVO)' },
                    { id: 'va_bca', label: 'BCA Virtual Account', sub: 'Otomatis 24 Jam' },
                    { id: 'va_mandiri', label: 'Mandiri VA', sub: 'Konfirmasi Otomatis' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-[4px] border text-left transition-all ${
                        paymentMethod === m.id
                          ? 'border-[#0075DE] bg-[#EBF4FC]/20 ring-1 ring-[#0075DE]'
                          : 'border-[#E6E6E6] bg-white hover:border-[#C4C4C0]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#000000] block">{m.label}</span>
                      <span className="text-[10px] text-[#9B9A97] block truncate">{m.sub}</span>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-white border border-[#E6E6E6] rounded-lg flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#000000] block">
                      {paymentMethod === 'qris' ? 'Scan Kode QRIS Nasional' : 'Nomor Virtual Account'}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0075DE] block">
                      {paymentMethod === 'qris' ? 'NMID: ID102030405060' : '8801 2948 1029 4821'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentProofFile('Bukti_Transfer_Pendaftaran_Raih.png');
                      addToast({ title: 'Bukti pembayaran berhasil diunggah', color: 'success' });
                    }}
                    className="text-xs px-3 py-1.5 rounded-[4px] bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/20 hover:bg-[#0075DE] hover:text-white font-semibold transition-colors"
                  >
                    {paymentProofFile ? 'Bukti Terunggah ✓' : 'Unggah Bukti Bayar'}
                  </button>
                </div>
                {errors.payment && <p className="text-[10px] text-rose-500">{errors.payment}</p>}
              </div>
            )}
          </div>

          {/* Section 6: Pernyataan & Kirim */}
          <div className="bg-white border border-[#E6E6E6] rounded-lg p-4 space-y-3.5 shadow-2xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-[#0075DE] focus:ring-[#0075DE]"
              />
              <span className="text-xs text-[#31302E] leading-relaxed">
                Saya menyatakan bahwa seluruh data yang diisikan adalah benar dan valid, seluruh berkas yang dilampirkan orisinal, serta berkomitmen mengikuti seluruh tahapan jadwal alur kompetisi sesuai ketentuan penyelenggara <strong>{comp.organizer?.organization_name ?? 'kompetisi'}</strong>.
              </span>
            </label>
            {errors.agreed && <p className="text-[10px] text-rose-500">{errors.agreed}</p>}

            <div className="pt-2 border-t border-[#E6E6E6] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#0F7B6C]">
                <Shield size={14} />
                <span>Data terenkripsi dan terlindungi di Workspace Raih</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="bordered"
                  className="flex-1 sm:flex-none border-[#E6E6E6] text-xs font-medium text-[#31302E] rounded-full h-10 px-5 hover:bg-[#F6F5F4]"
                  onPress={() => router.push(`/competitions/${comp.id}`)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="flex-1 sm:flex-none bg-[#0075DE] hover:bg-[#005BAB] text-white text-xs font-semibold rounded-full h-10 px-6 shadow-2xs"
                  startContent={!isSubmitting && <Check size={14} />}
                >
                  Kirim Pendaftaran Resmi
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
