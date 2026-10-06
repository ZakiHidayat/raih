'use client';

// ============================================================
// RAIH — Notion Interest Selection Document
// Design System: Notion (design.md)
// Featuring Notion Document layout, Sticker Palette & Streamline MingCute Icons
// ============================================================
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockInterests } from '@/data/mock';
import { useAuthStore } from '@/lib/stores/auth';
import { ArrowRight, CheckCircle, CheckCircleFill, Sparkles } from '@/components/ui/icons';

const stickerPalettes = [
  { bg: 'bg-[#62AEF0]/15', text: 'text-[#005BAB]', border: 'border-[#62AEF0]/40' },
  { bg: 'bg-[#D6B6F6]/25', text: 'text-[#391C57]', border: 'border-[#D6B6F6]/50' },
  { bg: 'bg-[#FF64C8]/15', text: 'text-[#B8117A]', border: 'border-[#FF64C8]/40' },
  { bg: 'bg-[#DD5B00]/15', text: 'text-[#793400]', border: 'border-[#DD5B00]/40' },
  { bg: 'bg-[#2A9D99]/15', text: 'text-[#0E5250]', border: 'border-[#2A9D99]/40' },
  { bg: 'bg-[#1AAE39]/15', text: 'text-[#0E6621]', border: 'border-[#1AAE39]/40' },
  { bg: 'bg-[#523410]/15', text: 'text-[#523410]', border: 'border-[#523410]/40' },
];

export default function NotionInterestSelectionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<number[]>([1, 2, 3]);

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    router.push('/home');
  };

  const canContinue = selected.length >= 3;

  return (
    <div className="min-h-screen bg-[#F6F5F4] text-[#000000] font-sans antialiased flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-3 border-b border-[#E6E6E6]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[#0075DE] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            R
          </div>
          <span className="font-semibold text-xs text-[#000000]">Raih Workspace</span>
        </div>

        <Link
          href="/home"
          className="text-xs text-[#615D59] hover:text-[#000000] transition-colors"
        >
          Lewati konfigurasi
        </Link>
      </header>

      {/* Main Notion Document */}
      <main className="max-w-2xl mx-auto w-full my-8 bg-white rounded-xl border border-[#E6E6E6] p-6 sm:p-10 shadow-xs">
        {/* Document Icon & Title */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] flex items-center justify-center text-2xl shadow-2xs mb-3">
            🎯
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#000000] mb-2">
            Pilih Minat & Kategori Kompetisi
          </h1>
          <p className="text-xs sm:text-sm text-[#615D59] leading-relaxed">
            Sesuaikan workspace Anda dengan memilih minimal <strong>3 topik minat</strong> untuk personalisasi rekomendasi lomba dan partner tim.
          </p>
        </div>

        {/* Notion Counter Pill */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] text-xs mb-6">
          <span className="text-[#31302E]">Status pemilihan topik:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-[4px] border ${
              canContinue
                ? 'bg-[#1AAE39]/10 text-[#0E6621] border-[#1AAE39]/30'
                : 'bg-[#DD5B00]/10 text-[#793400] border-[#DD5B00]/30'
            }`}
          >
            {selected.length} / 3 dipilih {canContinue ? '✓ Cukup' : '(Pilih minimal 3)'}
          </span>
        </div>

        {/* Interests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {mockInterests.map((interest, idx) => {
            const isSelected = selected.includes(interest.id);
            const palette = stickerPalettes[idx % stickerPalettes.length];

            return (
              <button
                key={interest.id}
                onClick={() => toggle(interest.id)}
                id={`interest-${interest.id}`}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? `${palette.bg} ${palette.border} ring-1 ring-[#0075DE]/40 shadow-2xs`
                    : 'bg-white border-[#E6E6E6] hover:bg-[#F6F5F4]'
                }`}
              >
                <span className="text-2xl flex-shrink-0 leading-none pt-0.5">
                  {interest.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold leading-tight ${
                        isSelected ? palette.text : 'text-[#000000]'
                      }`}
                    >
                      {interest.name}
                    </span>
                    {isSelected && (
                      <CheckCircleFill size={14} className="text-[#0075DE] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#615D59] line-clamp-1 mt-0.5">
                    Kategori & bidang kompetisi unggulan
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#E6E6E6] flex items-center justify-between">
          <p className="text-xs text-[#A39E98]">
            Pengaturan ini dapat diubah kapan saja di profil Anda.
          </p>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`px-5 py-2 text-xs font-semibold rounded-full inline-flex items-center gap-2 transition-colors ${
              canContinue
                ? 'bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs'
                : 'bg-[#E6E6E6] text-[#A39E98] cursor-not-allowed'
            }`}
          >
            <span>Simpan & Buka Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-[#A39E98] py-4">
        Raih Workspace • Sistem Produktivitas Kompetisi
      </footer>
    </div>
  );
}
