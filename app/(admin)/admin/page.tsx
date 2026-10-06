'use client';

// ============================================================
// RAIH — Notion Platform Administrator Dashboard
// Design System: Notion (design.md)
// ============================================================
import React, { useState } from 'react';
import Link from 'next/link';
import { addToast } from '@heroui/react';
import {
  Shield,
  Users,
  Trophy,
  Check,
  CheckCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  Eye,
  Trash2,
  ExternalLink,
  Layers,
  Award,
} from '@/components/ui/icons';
import { mockUsers, mockOrganizerProfiles } from '@/data/mock/users';
import { mockCompetitions } from '@/data/mock/competitions';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'organizers' | 'competitions' | 'users'>('organizers');
  const [organizers, setOrganizers] = useState(mockOrganizerProfiles);
  const [competitions, setCompetitions] = useState(mockCompetitions);
  const [usersList, setUsersList] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'participant' | 'organizer' | 'admin'>('all');

  const handleVerifyOrg = (userId: number) => {
    setOrganizers(prev =>
      prev.map(o => (o.user_id === userId ? { ...o, verification_status: 'verified' as const } : o))
    );
    addToast({ title: 'Organizer berhasil diverifikasi ✓', color: 'success' });
  };

  const handleRejectOrg = (userId: number) => {
    setOrganizers(prev =>
      prev.map(o => (o.user_id === userId ? { ...o, verification_status: 'rejected' as const } : o))
    );
    addToast({ title: 'Permohonan verifikasi ditolak', color: 'danger' });
  };

  const toggleFeaturedComp = (compId: number) => {
    setCompetitions(prev =>
      prev.map(c => (c.id === compId ? { ...c, is_featured: !c.is_featured } : c))
    );
    addToast({ title: 'Status unggulan lomba diperbarui', color: 'success' });
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const pendingOrgCount = organizers.filter(o => o.verification_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* ── Document Title ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E6E6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🛡️</span>
            <h1 className="text-xl font-bold tracking-tight text-[#000000]">
              Panel Administrator Platform
            </h1>
          </div>
          <p className="text-xs text-[#615D59]">
            Pusat kendali ekosistem Raih — verifikasi penyelenggara, moderasi lomba, dan tata kelola 3 role pengguna
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-[4px] bg-[#EDF6EF] text-[#0F7B6C] border border-[#0F7B6C]/20 flex items-center gap-1">
            <Check size={12} />
            <span>Sistem Operasional Normal</span>
          </span>
        </div>
      </div>

      {/* ── Metric Snapshot Cards ───────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E6E6E6] rounded-lg p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
            Total Pengguna
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#000000]">{usersList.length}</span>
            <span className="text-[10px] text-[#0F7B6C] font-semibold">Aktif</span>
          </div>
          <p className="text-[10px] text-[#9B9A97]">Peserta, Organizer, & Admin</p>
        </div>

        <div className="bg-white border border-[#E6E6E6] rounded-lg p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
            Penyelenggara
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#213183]">{organizers.length}</span>
            {pendingOrgCount > 0 && (
              <span className="text-[10px] text-[#DD5B00] font-bold bg-[#FDF5E8] px-1 rounded">
                {pendingOrgCount} Pending
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#9B9A97]">Himpunan, Kampus & Perusahaan</p>
        </div>

        <div className="bg-white border border-[#E6E6E6] rounded-lg p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
            Kompetisi Terbit
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#0075DE]">{competitions.length}</span>
            <span className="text-[10px] text-[#0075DE] font-semibold">Live</span>
          </div>
          <p className="text-[10px] text-[#9B9A97]">100% Menggunakan Alur Timeline</p>
        </div>

        <div className="bg-white border border-[#E6E6E6] rounded-lg p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-semibold text-[#615D59] uppercase tracking-wider block">
            Ekosistem Role
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#000000]">3 Role</span>
            <span className="text-[10px] text-[#0F7B6C] font-semibold">Terpisah</span>
          </div>
          <p className="text-[10px] text-[#9B9A97]">Peserta • Organizer • Admin</p>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-[#E6E6E6] pb-2">
        <button
          onClick={() => setActiveTab('organizers')}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'organizers'
              ? 'bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/20'
              : 'text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000]'
          }`}
        >
          <Shield size={13} />
          <span>Verifikasi Penyelenggara ({organizers.length})</span>
          {pendingOrgCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#DD5B00] text-white text-[9px] font-bold flex items-center justify-center">
              {pendingOrgCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('competitions')}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'competitions'
              ? 'bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/20'
              : 'text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000]'
          }`}
        >
          <Trophy size={13} />
          <span>Moderasi Lomba ({competitions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'users'
              ? 'bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/20'
              : 'text-[#615D59] hover:bg-[#EAE8E4] hover:text-[#000000]'
          }`}
        >
          <Users size={13} />
          <span>Direktori 3 Role Pengguna ({usersList.length})</span>
        </button>
      </div>

      {/* ── TAB 1: Verifikasi Penyelenggara ───────────────── */}
      {activeTab === 'organizers' && (
        <div className="bg-white border border-[#E6E6E6] rounded-lg overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-[#F6F5F4] border-b border-[#E6E6E6] flex items-center justify-between">
            <span className="text-xs font-bold text-[#000000] uppercase tracking-wider">
              Daftar Permohonan Legalitas Penyelenggara
            </span>
            <span className="text-[11px] text-[#615D59]">
              Verifikasi diperlukan sebelum organizer dapat menerbitkan lomba
            </span>
          </div>

          <div className="divide-y divide-[#E6E6E6]">
            {organizers.map(org => {
              const u = mockUsers.find(user => user.id === org.user_id);
              const isVerified = org.verification_status === 'verified';
              const isPending = org.verification_status === 'pending';

              return (
                <div key={org.user_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F6F5F4]/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EBF4FC] border border-[#0075DE]/20 text-[#0075DE] flex items-center justify-center font-bold text-sm shrink-0">
                      {org.organization_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold text-[#000000]">{org.organization_name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#F6F5F4] border border-[#E6E6E6] text-[#615D59]">
                          {org.organization_type}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${
                          isVerified
                            ? 'bg-[#EDF6EF] text-[#0F7B6C] border-[#0F7B6C]/20'
                            : isPending
                            ? 'bg-[#FDF5E8] text-[#DD5B00] border-[#DD5B00]/30'
                            : 'bg-[#FBEBEA] text-[#EB5757] border-[#EB5757]/20'
                        }`}>
                          {isVerified ? '✓ Terverifikasi' : isPending ? '⏳ Menunggu Persetujuan' : '✕ Ditolak'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#615D59] mt-1">
                        Kontak: {u?.email ?? '-'} • {u?.location ?? 'Indonesia'} • Website: {org.website || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleVerifyOrg(org.user_id)}
                          className="px-3 py-1.5 rounded-[4px] bg-[#0F7B6C] text-white hover:bg-[#0c6558] text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Setujui Verifikasi
                        </button>
                        <button
                          onClick={() => handleRejectOrg(org.user_id)}
                          className="px-3 py-1.5 rounded-[4px] border border-[#EB5757]/40 text-[#EB5757] hover:bg-[#FBEBEA] text-xs font-semibold transition-colors"
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#9B9A97]">Selesai ditinjau</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: Moderasi Kompetisi ────────────────────── */}
      {activeTab === 'competitions' && (
        <div className="bg-white border border-[#E6E6E6] rounded-lg overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-[#F6F5F4] border-b border-[#E6E6E6] flex items-center justify-between">
            <span className="text-xs font-bold text-[#000000] uppercase tracking-wider">
              Daftar Kompetisi Aktif
            </span>
            <span className="text-[11px] text-[#615D59]">
              Kelola status featured untuk tampil di halaman utama
            </span>
          </div>

          <div className="divide-y divide-[#E6E6E6]">
            {competitions.map(comp => (
              <div key={comp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F6F5F4]/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F6F5F4] border border-[#E6E6E6] text-[#0075DE] flex items-center justify-center shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#EBF4FC] text-[#0075DE] border border-[#0075DE]/20">
                        ID #{comp.id}
                      </span>
                      {comp.is_featured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#FDF5E8] text-[#DD5B00] border border-[#DD5B00]/30 flex items-center gap-1">
                          <Sparkles size={10} />
                          Featured
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#EDF6EF] text-[#0F7B6C] font-semibold border border-[#0F7B6C]/20">
                        {comp.status}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-[#000000]">{comp.title}</h3>
                    <p className="text-[11px] text-[#615D59] mt-0.5">
                      Biaya: {comp.registration_fee === 0 ? 'Gratis' : `Rp ${comp.registration_fee.toLocaleString('id-ID')}`} • Batas: {new Date(comp.registration_deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleFeaturedComp(comp.id)}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold border transition-colors ${
                      comp.is_featured
                        ? 'bg-[#FDF5E8] text-[#DD5B00] border-[#DD5B00]/40 hover:bg-[#fdeed6]'
                        : 'bg-white text-[#31302E] border-[#E6E6E6] hover:border-[#0075DE] hover:text-[#0075DE]'
                    }`}
                  >
                    {comp.is_featured ? '⭐ Batalkan Featured' : '⭐ Jadikan Featured'}
                  </button>

                  <Link
                    href={`/competitions/${comp.id}`}
                    target="_blank"
                    className="p-1.5 rounded-[4px] border border-[#E6E6E6] hover:bg-[#F6F5F4] text-[#615D59] hover:text-[#000000] transition-colors"
                    title="Buka Halaman Lomba"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: Direktori 3 Role Pengguna ─────────────── */}
      {activeTab === 'users' && (
        <div className="bg-white border border-[#E6E6E6] rounded-lg overflow-hidden shadow-2xs space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#E6E6E6]">
            <div>
              <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
                Direktori Pengguna Platform Raih
              </h3>
              <p className="text-[11px] text-[#615D59]">
                Pemisahan akun berdasarkan 3 peran resmi sistem
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Role filter buttons */}
              {(['all', 'participant', 'organizer', 'admin'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-[4px] font-semibold border transition-colors ${
                    roleFilter === r
                      ? 'bg-[#0075DE] text-white border-[#0075DE]'
                      : 'bg-white text-[#615D59] border-[#E6E6E6] hover:bg-[#F6F5F4]'
                  }`}
                >
                  {r === 'all' ? 'Semua' : r === 'participant' ? '🎓 Peserta' : r === 'organizer' ? '🏛️ Organizer' : '🛡️ Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-[#9B9A97]" />
            <input
              type="text"
              placeholder="Cari nama atau email pengguna..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-[4px] border border-[#E6E6E6] bg-white focus:outline-hidden focus:border-[#0075DE]"
            />
          </div>

          <div className="divide-y divide-[#E6E6E6] border border-[#E6E6E6] rounded-lg overflow-hidden">
            {filteredUsers.map(u => (
              <div key={u.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-[#F6F5F4]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    u.role === 'admin'
                      ? 'bg-[#DD5B00] text-white'
                      : u.role === 'organizer'
                      ? 'bg-[#213183] text-white'
                      : 'bg-[#0075DE] text-white'
                  }`}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#000000]">{u.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-[4px] border ${
                        u.role === 'admin'
                          ? 'bg-[#FDF5E8] text-[#DD5B00] border-[#DD5B00]/30'
                          : u.role === 'organizer'
                          ? 'bg-[#EBF4FC] text-[#213183] border-[#213183]/20'
                          : 'bg-[#EDF6EF] text-[#0F7B6C] border-[#0F7B6C]/20'
                      }`}>
                        {u.role === 'admin' ? '🛡️ Admin Platform' : u.role === 'organizer' ? '🏛️ Organizer' : '🎓 Peserta'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#615D59]">{u.email} • {u.location || 'Indonesia'}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#9B9A97]">
                  <span>ID #{u.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
