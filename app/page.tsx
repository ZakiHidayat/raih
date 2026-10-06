'use client';

// ============================================================
// RAIH — Root Page (Session-aware Entrypoint)
// Directs unauthenticated users to /auth/login
// Directs active sessions to their respective workspace dashboard
// ============================================================
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

export default function RootPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, setHasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If hydration finished before mount
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHasHydrated(true);
    }
  }, [setHasHydrated]);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace('/auth/login');
    } else if (user.role === 'admin') {
      router.replace('/admin');
    } else if (user.role === 'organizer') {
      router.replace('/dashboard');
    } else {
      router.replace('/home');
    }
  }, [mounted, _hasHydrated, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-[#F6F5F4] flex flex-col items-center justify-center gap-3 select-none">
      <div className="w-9 h-9 rounded-lg bg-[#0075DE] text-white flex items-center justify-center font-bold text-base shadow-xs animate-pulse">
        R
      </div>
      <p className="text-xs text-[#615D59] font-medium">Memuat sesi Raih...</p>
    </div>
  );
}
