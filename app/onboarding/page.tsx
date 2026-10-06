'use client';

// ============================================================
// RAIH — Notion Getting Started Onboarding Document
// Design System: Notion (design.md)
// Modeled after Notion's iconic Getting Started page template
// ============================================================
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Trophy,
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Sparkles,
  Layers,
  Award,
} from '@/components/ui/icons';

export default function NotionOnboardingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/home');
  };

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

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-xs text-[#615D59] hover:text-[#000000] transition-colors"
          >
            Sudah punya akun? Masuk
          </Link>
          <button
            onClick={handleStart}
            className="px-3 py-1 text-xs font-medium rounded-full bg-white border border-[#E6E6E6] hover:bg-[#EFEFEF] text-[#31302E] transition-colors"
          >
            Lewati
          </button>
        </div>
      </header>

      {/* Main Notion Document */}
      <main className="max-w-3xl mx-auto w-full my-8 bg-white rounded-xl border border-[#E6E6E6] p-6 sm:p-12 shadow-xs">
        {/* Document Icon & Title */}
        <div className="mb-6">
          <div className="w-14 h-14 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] flex items-center justify-center text-3xl shadow-2xs mb-4">
            🚀
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#000000] mb-2">
            Selamat Datang di Raih
          </h1>
          <p className="text-sm text-[#615D59] leading-relaxed">
            Platform produktivitas dan database kompetisi terintegrasi di Indonesia. Cari lomba, bentuk tim impian, dan kelola portofolio prestasimu dalam satu workspace rapi.
          </p>
        </div>

        {/* Notion Callout Box */}
        <div className="p-4 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] flex items-start gap-3 text-xs text-[#31302E] mb-8">
          <span className="text-lg leading-none">💡</span>
          <div className="leading-relaxed">
            <strong className="text-[#000000] block mb-0.5">Panduan Memulai Cepat:</strong>
            Halaman ini memperkenalkan fitur inti Raih. Anda dapat langsung membuka workspace kompetisi atau menyesuaikan minat Anda terlebih dahulu.
          </div>
        </div>

        {/* 3 Core Blocks (Notion Style) */}
        <div className="space-y-4 mb-8">
          <div className="p-4 rounded-lg border border-[#E6E6E6] hover:border-[#0075DE]/40 transition-colors flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-[#62AEF0]/15 text-[#005BAB] flex items-center justify-center flex-shrink-0">
              <Search size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#000000] mb-1">
                1. Eksplorasi Database Kompetisi & Timeline Interaktif
              </h2>
              <p className="text-xs text-[#615D59] leading-relaxed">
                Filter lomba berdasarkan kategori (Hackathon, Desain, Riset, Bisnis), deadline, dan tingkat pendidikan dengan tampilan Galeri, Tabel, serta Timeline.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-[#E6E6E6] hover:border-[#0075DE]/40 transition-colors flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-[#D6B6F6]/25 text-[#391C57] flex items-center justify-center flex-shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#000000] mb-1">
                2. Cari Partner & Rekan Tim dengan Kecocokan AI
              </h2>
              <p className="text-xs text-[#615D59] leading-relaxed">
                Bentuk tim dengan komposisi ideal. Raih menghitung persentase kecocokan skill dan rekam jejak untuk memaksimalkan peluang juara.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-[#E6E6E6] hover:border-[#0075DE]/40 transition-colors flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-[#FF64C8]/15 text-[#B8117A] flex items-center justify-center flex-shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#000000] mb-1">
                3. Kumpulkan XP & Sertifikat Digital Terverifikasi
              </h2>
              <p className="text-xs text-[#615D59] leading-relaxed">
                Setiap keikutsertaan menyumbang XP untuk menaikkan level dan membuka lencana prestasi yang tersimpan otomatis di portofolio Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-6 border-t border-[#E6E6E6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#615D59]">
            Siap untuk memulai petualangan prestasimu?
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push('/interest-selection')}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-full bg-white border border-[#E6E6E6] hover:bg-[#F6F5F4] text-[#31302E] transition-colors"
            >
              Pilih Minat
            </button>
            <button
              onClick={handleStart}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>Buka Workspace Raih</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-[#A39E98] py-4">
        Raih Workspace • Sistem Produktivitas Kompetisi Mahasiswa & Pelajar
      </footer>
    </div>
  );
}
