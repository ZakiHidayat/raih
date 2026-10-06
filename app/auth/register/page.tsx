'use client';

// ============================================================
// RAIH — Notion Sign Up Page
// Design System: Notion (design.md: ex-auth-form-card)
// ============================================================
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle } from '@/components/ui/icons';
import { useAuthStore } from '@/lib/stores/auth';
import type { UserRole } from '@/types';

export default function NotionRegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [role, setRole] = useState<UserRole>('participant');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!form.email) errs.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid';
    if (!form.password) errs.password = 'Kata sandi wajib diisi';
    else if (form.password.length < 8) errs.password = 'Kata sandi minimal 8 karakter';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Kata sandi konfirmasi tidak cocok';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    const res = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      role,
    });
    if (res.success) {
      if (role === 'participant') {
        router.push('/interest-selection');
      } else if (role === 'organizer') {
        router.push('/dashboard');
      } else {
        router.push('/admin');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F4] text-[#000000] font-sans antialiased flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2 border-b border-[#E6E6E6]">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[#0075DE] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            R
          </div>
          <span className="font-semibold text-xs text-[#000000]">Raih</span>
        </Link>

        <Link
          href="/auth/login"
          className="text-xs text-[#615D59] hover:text-[#000000] transition-colors"
        >
          Sudah punya akun? Masuk
        </Link>
      </header>

      {/* Main Notion Register Card */}
      <main className="max-w-lg mx-auto w-full my-8 bg-white rounded-xl border border-[#E6E6E6] p-6 sm:p-8 shadow-xs">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] flex items-center justify-center text-2xl mx-auto mb-3 shadow-2xs">
            📝
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
            Buat Akun Baru
          </h1>
          <p className="text-xs text-[#615D59] mt-1">
            Bergabunglah dengan ekosistem kompetisi Raih
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRole('participant')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              role === 'participant'
                ? 'bg-[#EBF4FC] border-[#0075DE] ring-1 ring-[#0075DE]'
                : 'bg-white border-[#E6E6E6] hover:bg-[#F6F5F4]'
            }`}
          >
            <span className="text-xs font-bold text-[#000000] block">🎓 Peserta</span>
            <span className="text-[10px] text-[#615D59] block mt-0.5 leading-tight">
              Cari & ikuti kompetisi
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole('organizer')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              role === 'organizer'
                ? 'bg-[#EBF4FC] border-[#0075DE] ring-1 ring-[#0075DE]'
                : 'bg-white border-[#E6E6E6] hover:bg-[#F6F5F4]'
            }`}
          >
            <span className="text-xs font-bold text-[#000000] block">🏛️ Organizer</span>
            <span className="text-[10px] text-[#615D59] block mt-0.5 leading-tight">
              Publikasi & kelola lomba
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              role === 'admin'
                ? 'bg-[#EBF4FC] border-[#0075DE] ring-1 ring-[#0075DE]'
                : 'bg-white border-[#E6E6E6] hover:bg-[#F6F5F4]'
            }`}
          >
            <span className="text-xs font-bold text-[#000000] block">🛡️ Admin</span>
            <span className="text-[10px] text-[#615D59] block mt-0.5 leading-tight">
              Kelola & moderasi platform
            </span>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#31302E] mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Ariel Pratama"
              className="w-full text-xs px-3 py-2 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000]"
            />
            {errors.name && <p className="text-[11px] text-[#DD5B00] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#31302E] mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@email.com"
              className="w-full text-xs px-3 py-2 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000]"
            />
            {errors.email && <p className="text-[11px] text-[#DD5B00] mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#31302E] mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 karakter"
                  className="w-full text-xs px-3 py-2 pr-9 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A39E98]"
                >
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-[#DD5B00] mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#31302E] mb-1">
                Ulangi Kata Sandi
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Ulangi kata sandi"
                className="w-full text-xs px-3 py-2 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000]"
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-[#DD5B00] mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
          >
            <span>{isLoading ? 'Mendaftarkan...' : 'Daftar Akun'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-center text-xs text-[#615D59] mt-6">
          Sudah memiliki akun?{' '}
          <Link href="/auth/login" className="text-[#0075DE] hover:underline font-medium">
            Masuk Sekarang
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-[#A39E98] py-4">
        Raih • Sistem Produktivitas Kompetisi
      </footer>
    </div>
  );
}
