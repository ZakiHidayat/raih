'use client';

// ============================================================
// RAIH — Notion Multi-Role Login Portal
// Design System: Notion (design.md: ex-auth-form-card)
// Centralized Role Portal for Peserta, Penyelenggara, and Superadmin
// ============================================================
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addToast } from '@heroui/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Sparkles } from '@/components/ui/icons';
import { useAuthStore } from '@/lib/stores/auth';

type PortalRole = 'participant' | 'organizer' | 'admin';

interface RolePortalConfig {
  id: PortalRole;
  label: string;
  icon: string;
  name: string;
  badge: string;
  badgeClass: string;
  accentColor: string;
  description: string;
  defaultEmail: string;
  demoUser: string;
  destination: string;
}

const rolePortals: RolePortalConfig[] = [
  {
    id: 'participant',
    label: 'Peserta',
    icon: '🎓',
    name: 'Portal Peserta',
    badge: 'Mahasiswa & Siswa',
    badgeClass: 'bg-[#EBF4FC] text-[#0075DE] border-[#0075DE]/20',
    accentColor: '#0075DE',
    description: 'Eksplorasi kompetisi, isi form pendaftaran dinamis, dan cari rekan tim.',
    defaultEmail: 'ariel@example.com',
    demoUser: 'Ariel Pratama',
    destination: '/home',
  },
  {
    id: 'organizer',
    label: 'Penyelenggara',
    icon: '🏛️',
    name: 'Portal Penyelenggara',
    badge: 'Organizer Lomba',
    badgeClass: 'bg-[#213183]/10 text-[#213183] border-[#213183]/20',
    accentColor: '#213183',
    description: 'Publikasi kompetisi, atur form syarat pendaftaran, dan verifikasi berkas peserta.',
    defaultEmail: 'himsi@ugm.ac.id',
    demoUser: 'Admin HIMSI UGM',
    destination: '/dashboard',
  },
  {
    id: 'admin',
    label: 'Super Admin',
    icon: '🛡️',
    name: 'Portal Super Admin',
    badge: 'Kurator Platform',
    badgeClass: 'bg-[#FDF5E8] text-[#DD5B00] border-[#DD5B00]/20',
    accentColor: '#DD5B00',
    description: 'Verifikasi legalitas institusi, kurasi lomba kurator, dan kelola peran pengguna.',
    defaultEmail: 'admin@raih.id',
    demoUser: 'Super Admin Raih',
    destination: '/admin',
  },
];

export default function NotionLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [activeRole, setActiveRole] = useState<PortalRole>('participant');
  const [email, setEmail] = useState('ariel@example.com');
  const [password, setPassword] = useState('password');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const currentPortal = rolePortals.find((p) => p.id === activeRole) || rolePortals[0];

  const handleRoleSelect = (roleId: PortalRole) => {
    setActiveRole(roleId);
    const target = rolePortals.find((p) => p.id === roleId);
    if (target) {
      setEmail(target.defaultEmail);
      setPassword('password');
      setErrors({});
    }
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Format email tidak valid';
    if (!password) errs.password = 'Password wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const res = await login(email, password);
    if (res.success) {
      const { user } = useAuthStore.getState();
      if (user?.role === 'admin') {
        router.push('/admin');
      } else if (user?.role === 'organizer') {
        router.push('/dashboard');
      } else {
        router.push('/home');
      }
    } else {
      addToast({
        title: 'Login Gagal',
        description: res.error ?? 'Email atau password salah',
        color: 'danger',
      });
    }
  };

  const handleInstantDemoLogin = async (targetEmail: string, destination: string) => {
    setEmail(targetEmail);
    setPassword('password');
    const res = await login(targetEmail, 'password');
    if (res.success) {
      router.push(destination);
    } else {
      addToast({
        title: 'Gagal Masuk Demo',
        description: 'Terjadi kendala saat mengautentikasi akun demo.',
        color: 'danger',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F4] text-[#000000] font-sans antialiased flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-3 border-b border-[#E6E6E6]">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[#0075DE] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            R
          </div>
          <span className="font-semibold text-xs text-[#000000]">Raih</span>
        </Link>

        <Link
          href="/auth/register"
          className="text-xs text-[#615D59] hover:text-[#000000] transition-colors"
        >
          Belum punya akun? Buat akun
        </Link>
      </header>

      {/* Main Notion Portal Card */}
      <main className="max-w-lg mx-auto w-full my-8 bg-white rounded-xl border border-[#E6E6E6] p-6 sm:p-8 shadow-xs">
        {/* Card Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] flex items-center justify-center text-2xl mx-auto mb-3 shadow-2xs">
            {currentPortal.icon}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
            Portal Masuk Raih
          </h1>
          <p className="text-xs text-[#615D59] mt-1">
            Pilih peran Anda untuk masuk ke platform
          </p>
        </div>

        {/* ── Role Selector Tabs ─────────────────────────── */}
        <div className="mb-6">
          <label className="block text-[11px] font-semibold text-[#615D59] uppercase tracking-wider mb-2">
            Pilih Peran Akun (Role Portal):
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6]">
            {rolePortals.map((portal) => {
              const isSelected = activeRole === portal.id;
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => handleRoleSelect(portal.id)}
                  className={`py-2 px-2 rounded-[5px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-white text-[#000000] shadow-xs border border-[#E6E6E6]'
                      : 'text-[#615D59] hover:text-[#000000] hover:bg-white/60'
                  }`}
                >
                  <span className="text-sm">{portal.icon}</span>
                  <span className="truncate">{portal.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active Role Card Preview & Demo ─────────────── */}
        <div className="p-3.5 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] mb-6">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
              <span>{currentPortal.icon}</span>
              <span>{currentPortal.name}</span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-[4px] font-semibold border ${currentPortal.badgeClass}`}
            >
              {currentPortal.badge}
            </span>
          </div>
          <p className="text-[11px] text-[#615D59] leading-relaxed mb-3">
            {currentPortal.description}
          </p>

          <button
            type="button"
            onClick={() =>
              handleInstantDemoLogin(currentPortal.defaultEmail, currentPortal.destination)
            }
            className="w-full py-2 px-3 rounded-[4px] bg-white border border-[#E6E6E6] hover:border-[#0075DE] text-xs font-semibold text-[#0075DE] hover:bg-[#EBF4FC]/40 transition-colors flex items-center justify-between shadow-2xs group"
          >
            <span className="flex items-center gap-1.5">
              <span>⚡ Masuk Cepat Demo:</span>
              <span className="font-normal text-[#31302E] truncate">{currentPortal.demoUser}</span>
            </span>
            <ArrowRight size={13} className="text-[#0075DE] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#E6E6E6]" />
          <span className="text-[11px] text-[#A39E98]">atau masukkan kredensial akun</span>
          <div className="flex-1 h-px bg-[#E6E6E6]" />
        </div>

        {/* ── Standard Credential Form ───────────────────── */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#31302E] mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full text-xs px-3 py-2 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000]"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-[#DD5B00] mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#31302E] mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2 pr-10 rounded-[4px] bg-white border border-[#E6E6E6] focus:outline-hidden focus:border-[#0075DE] focus:ring-1 focus:ring-[#0075DE] text-[#000000]"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A39E98] hover:text-[#31302E]"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-[#DD5B00] mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-full bg-[#0075DE] hover:bg-[#005BAB] text-white shadow-2xs inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Memuat...' : `Masuk ke ${currentPortal.name}`}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-center text-xs text-[#615D59] mt-6">
          Belum memiliki akun?{' '}
          <Link href="/auth/register" className="text-[#0075DE] hover:underline font-medium">
            Daftar Sekarang
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-[#A39E98] py-4">
        Raih • Portal Masuk Multi-Peran Terenkripsi
      </footer>
    </div>
  );
}
