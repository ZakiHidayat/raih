// ============================================================
// RAIH — Mock Data: Registrations, Payments, Notifications, XP, etc.
// ============================================================
import type {
  Registration, Payment, SavedCompetition, Review,
  Notification, XpTransaction, Certificate, SearchHistory,
  CompetitionStatusLog, TeammateMatch
} from '@/types';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

// ── Registrations (user_id: 1 = Ariel) ───────────────────────
export const mockRegistrations: Registration[] = [
  { id: 1, competition_id: 1, user_id: null, team_id: 1, status: 'approved', registered_at: daysAgo(25) },
  { id: 2, competition_id: 3, user_id: null, team_id: 2, status: 'pending', registered_at: daysAgo(10) },
  { id: 3, competition_id: 20, user_id: null, team_id: 3, status: 'approved', registered_at: daysAgo(80) },
  { id: 4, competition_id: 22, user_id: 1, team_id: null, status: 'approved', registered_at: daysAgo(110) },
  { id: 5, competition_id: 5, user_id: 1, team_id: null, status: 'pending', registered_at: daysAgo(2) },
  // User 2 (Siti) registrations
  { id: 6, competition_id: 4, user_id: null, team_id: 4, status: 'approved', registered_at: daysAgo(15) },
  { id: 7, competition_id: 9, user_id: null, team_id: 5, status: 'pending', registered_at: daysAgo(1) },
  // User 3 (Bagas)
  { id: 8, competition_id: 6, user_id: 3, team_id: null, status: 'approved', registered_at: daysAgo(5) },
  { id: 9, competition_id: 21, user_id: null, team_id: 6, status: 'approved', registered_at: daysAgo(130) },
];

// ── Payments ──────────────────────────────────────────────────
export const mockPayments: Payment[] = [
  { id: 1, registration_id: 1, amount: 5000, method: 'qris', status: 'success', transaction_id: 'TXN-001-HIMSI', paid_at: daysAgo(25) },
  { id: 2, registration_id: 2, amount: 80000, method: 'virtual_account', status: 'pending', transaction_id: null, paid_at: null },
  { id: 3, registration_id: 3, amount: 5000, method: 'e_wallet', status: 'success', transaction_id: 'TXN-003-HACK24', paid_at: daysAgo(80) },
  { id: 4, registration_id: 4, amount: 5000, method: 'qris', status: 'success', transaction_id: 'TXN-004-HACK24', paid_at: daysAgo(110) },
  { id: 5, registration_id: 5, amount: 5000, method: 'qris', status: 'pending', transaction_id: null, paid_at: null },
  { id: 6, registration_id: 6, amount: 30000, method: 'e_wallet', status: 'success', transaction_id: 'TXN-006-UIUX', paid_at: daysAgo(15) },
];

// ── Saved Competitions (user_id: 1 = Ariel) ──────────────────
export const mockSavedCompetitions: SavedCompetition[] = [
  { user_id: 1, competition_id: 2, saved_at: daysAgo(5) },
  { user_id: 1, competition_id: 6, saved_at: daysAgo(3) },
  { user_id: 1, competition_id: 8, saved_at: daysAgo(1) },
  { user_id: 2, competition_id: 1, saved_at: daysAgo(7) },
  { user_id: 2, competition_id: 10, saved_at: daysAgo(2) },
  { user_id: 3, competition_id: 7, saved_at: daysAgo(4) },
  { user_id: 3, competition_id: 11, saved_at: daysAgo(1) },
];

// ── Reviews ───────────────────────────────────────────────────
export const mockReviews: Review[] = [
  { id: 1, user_id: 1, organizer_id: 10, competition_id: 1, rating: 5, comment: 'Penyelenggaraan sangat profesional! Panitia responsif, hadiah sesuai janji, dan pengalaman hackathon yang sangat berkesan. Pasti ikut lagi tahun depan!', created_at: daysAgo(20) },
  { id: 2, user_id: 3, organizer_id: 10, competition_id: 1, rating: 5, comment: 'Mantap! Problemnya menantang tapi fair. Website pendaftaran juga mudah digunakan.', created_at: daysAgo(18) },
  { id: 3, user_id: 2, organizer_id: 11, competition_id: 2, rating: 4, comment: 'Lomba yang bagus dan terpercaya karena diselenggarakan Kemendikbud. Proses seleksi transparan.', created_at: daysAgo(15) },
  { id: 4, user_id: 1, organizer_id: 12, competition_id: 21, rating: 5, comment: 'Astra selalu konsisten dalam penyelenggaraan. Mentoring dari profesional sangat bernilai!', created_at: daysAgo(80) },
  { id: 5, user_id: 5, organizer_id: 13, competition_id: 4, rating: 4, comment: 'Kompetisi UI/UX yang seru. Brief-nya jelas dan jurinya memberikan feedback yang konstruktif.', created_at: daysAgo(10) },
  { id: 6, user_id: 4, organizer_id: 14, competition_id: 5, rating: 3, comment: 'Servernya sempat down saat perlombaan berlangsung, tapi panitia cepat menangani. Overall masih oke.', created_at: daysAgo(8) },
  { id: 7, user_id: 3, organizer_id: 14, competition_id: 22, rating: 4, comment: 'Hackfest Telkom selalu jadi benchmark kompetisi programming terbaik. Soal-soalnya original dan fair.', created_at: daysAgo(90) },
];

// ── Notifications (user_id: 1 = Ariel) ───────────────────────
export const mockNotifications: Notification[] = [
  { id: 1, user_id: 1, type: 'deadline_reminder', title: 'Deadline Mendekat!', message: 'Astra Young Leaders 2025 — Pendaftaran ditutup dalam 7 hari lagi. Segera lengkapi dokumen kamu!', is_read: false, sent_at: daysAgo(0) },
  { id: 2, user_id: 1, type: 'registration_status', title: 'Pendaftaran Disetujui 🎉', message: 'Selamat! Pendaftaranmu untuk HIMSI Hackathon 2025 telah disetujui. Persiapkan timmu!', is_read: false, sent_at: daysAgo(0) },
  { id: 3, user_id: 1, type: 'recommendation', title: 'Kompetisi Untukmu 💡', message: 'Berdasarkan minatmu di Pemrograman, kami rekomendasikan: Data Science Competition — Analytics for Indonesia 2025.', is_read: true, sent_at: daysAgo(2) },
  { id: 4, user_id: 1, type: 'system', title: 'XP +100 Earned! ⭐', message: 'Kamu mendapatkan 100 XP karena berhasil mendaftar kompetisi pertamamu. Level up mendekat!', is_read: true, sent_at: daysAgo(5) },
  { id: 5, user_id: 1, type: 'deadline_reminder', title: 'Hackfest Telkom 2025', message: 'Deadline pendaftaran Hackfest Telkom 2025 tinggal 5 hari. Daftar sekarang!', is_read: true, sent_at: daysAgo(3) },
];

// ── XP Transactions (user_id: 1 = Ariel) ─────────────────────
export const mockXpTransactions: XpTransaction[] = [
  { id: 1, user_id: 1, competition_id: 22, xp_earned: 500, reason: 'Menyelesaikan kompetisi Hackfest Telkom 2024', created_at: daysAgo(95) },
  { id: 2, user_id: 1, competition_id: 20, xp_earned: 300, reason: 'Berpartisipasi di Hackathon Kemendikbud 2024', created_at: daysAgo(53) },
  { id: 3, user_id: 1, competition_id: null, xp_earned: 100, reason: 'Mendaftar akun Raih pertama kali', created_at: daysAgo(110) },
  { id: 4, user_id: 1, competition_id: null, xp_earned: 150, reason: 'Melengkapi profil dengan skills dan foto', created_at: daysAgo(100) },
  { id: 5, user_id: 1, competition_id: 1, xp_earned: 200, reason: 'Mendaftar HIMSI Hackathon 2025', created_at: daysAgo(25) },
  { id: 6, user_id: 3, competition_id: null, xp_earned: 300, reason: 'Meraih juara 2 Data Science Competition 2024', created_at: daysAgo(150) },
];

// ── Certificates (user_id: 1 = Ariel) ────────────────────────
export const mockCertificates: Certificate[] = [
  { id: 1, user_id: 1, competition_id: 22, certificate_url: '/mock-certificates/cert-hackfest2024.pdf', issued_at: daysAgo(90) },
  { id: 2, user_id: 1, competition_id: 20, certificate_url: '/mock-certificates/cert-hackathon2024.pdf', issued_at: daysAgo(50) },
  { id: 3, user_id: 3, competition_id: 22, certificate_url: '/mock-certificates/cert-bagas-hackfest.pdf', issued_at: daysAgo(90) },
  { id: 4, user_id: 3, competition_id: 21, certificate_url: '/mock-certificates/cert-bagas-astra2024.pdf', issued_at: daysAgo(85) },
];

// ── Search History (user_id: 1 = Ariel) ──────────────────────
export const mockSearchHistory: SearchHistory[] = [
  { id: 1, user_id: 1, keyword: 'hackathon 2025', searched_at: daysAgo(1) },
  { id: 2, user_id: 1, keyword: 'data science competition', searched_at: daysAgo(2) },
  { id: 3, user_id: 1, keyword: 'programming gratis', searched_at: daysAgo(3) },
  { id: 4, user_id: 1, keyword: 'LKTI mahasiswa', searched_at: daysAgo(5) },
  { id: 5, user_id: 1, keyword: 'lomba UI/UX', searched_at: daysAgo(7) },
];

// ── Competition Status Log ────────────────────────────────────
export const mockCompetitionStatusLogs: CompetitionStatusLog[] = [
  { id: 1, registration_id: 1, status: 'approved', progress_percent: 75, updated_at: daysAgo(20) },
  { id: 2, registration_id: 3, status: 'completed', progress_percent: 100, updated_at: daysAgo(50) },
  { id: 3, registration_id: 4, status: 'completed', progress_percent: 100, updated_at: daysAgo(95) },
];

// ── Teammate Matches (user_id: 1 = Ariel) ────────────────────
export const mockTeammateMatches: TeammateMatch[] = [
  { id: 1, user_id: 1, matched_user_id: 2, compatibility_score: 92.5, matched_at: daysAgo(10) },
  { id: 2, user_id: 1, matched_user_id: 3, compatibility_score: 88.0, matched_at: daysAgo(12) },
  { id: 3, user_id: 1, matched_user_id: 5, compatibility_score: 76.5, matched_at: daysAgo(15) },
  { id: 4, user_id: 2, matched_user_id: 4, compatibility_score: 85.0, matched_at: daysAgo(8) },
];
