// ============================================================
// RAIH — Local (In-Memory) Repository Implementations
// TODO [SUPABASE MIGRATION]: Replace this file's implementations
//   with Supabase client queries. Each method maps 1:1 to a
//   Supabase table query using the same schema.
//   Example migration for CompetitionRepository.getAll():
//     const { data } = await supabase.from('competitions').select('*');
// ============================================================
import type {
  Competition, CompetitionWithDetails, Category, CategoryScope, CompetitionStatus,
  Registration, RegistrationWithDetails, Payment, SavedCompetition, Review,
  Notification, XpTransaction, Certificate, SearchHistory, User, UserWithProfiles,
  ParticipantProfile, OrganizerProfile, Interest, TeammateMatch, CompetitionTimelineItem,
  CompetitionFormSettings
} from '@/types';
import type {
  CompetitionRepository, CompetitionFilters, UserRepository, RegistrationRepository,
  PaymentRepository, SavedCompetitionRepository, ReviewRepository, NotificationRepository,
  XpRepository, CategoryRepository, InterestRepository, CertificateRepository,
  SearchHistoryRepository, TeammateRepository
} from './interfaces';
import {
  mockCompetitions, mockCompetitionRequirements, mockCompetitionTimelines,
  mockUsers, mockParticipantProfiles, mockOrganizerProfiles,
  mockCategories, mockInterests as mockInterestData,
  mockRegistrations, mockPayments, mockSavedCompetitions, mockReviews,
  mockNotifications, mockXpTransactions, mockCertificates, mockSearchHistory,
  mockTeammateMatches
} from '@/data/mock';

// ── Utility: simulate async delay ────────────────────────────
const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

// ── Local state (persisted to localStorage in browser) ────────
// TODO [SUPABASE MIGRATION]: Remove these in-memory stores; all state will live in Supabase
let _competitions = [...mockCompetitions];
let _timelines = [...mockCompetitionTimelines];
let _users = [...mockUsers];
let _registrations = [...mockRegistrations];
let _payments = [...mockPayments];
let _saved = [...mockSavedCompetitions];
let _reviews = [...mockReviews];
let _notifications = [...mockNotifications];
let _xpTransactions = [...mockXpTransactions];
let _certificates = [...mockCertificates];
let _searchHistory = [...mockSearchHistory];
let _teammatematches = [...mockTeammateMatches];

// ── Competition Form Settings Storage & Presets ───────────────
let _formSettings: Record<number, CompetitionFormSettings> = {
  1: {
    allow_individual: false,
    allow_team: true,
    min_team_members: 2,
    max_team_members: 4,
    require_ktm: true,
    require_surat_aktif: false,
    require_twibbon: true,
    require_proposal: true,
    require_pitch_video: false,
    require_statement_letter: true,
    custom_fields: [
      {
        id: 'cf_hackathon_track',
        field_name: 'Pilihan Sub-tema / Track AI',
        field_type: 'select',
        options: ['AI untuk Pendidikan', 'AI untuk Kesehatan Rakyat', 'AI untuk Ketahanan Pangan', 'Smart Governance'],
        is_mandatory: true,
        placeholder: 'Pilih Track',
        help_text: 'Fokus inovasi yang akan dibangun tim Anda.'
      },
      {
        id: 'cf_github_org',
        field_name: 'Link Repository GitHub Tim / Portofolio',
        field_type: 'url',
        is_mandatory: false,
        placeholder: 'https://github.com/...',
        help_text: 'Tautan ke GitHub tim atau showcase portofolio proyek sebelumnya.'
      },
      {
        id: 'cf_ai_tools',
        field_name: 'Rencana Teknologi & Model AI yang Digunakan',
        field_type: 'textarea',
        is_mandatory: true,
        placeholder: 'Contoh: Next.js, FastAPI, Llama-3 fine-tuned, Whisper API...',
        help_text: 'Jelaskan stack teknologi yang akan dipakai selama 48 jam hackathon.'
      }
    ]
  },
  2: {
    allow_individual: true,
    allow_team: true,
    min_team_members: 1,
    max_team_members: 3,
    require_ktm: true,
    require_surat_aktif: true,
    require_twibbon: false,
    require_proposal: true,
    require_pitch_video: false,
    require_statement_letter: true,
    custom_fields: [
      {
        id: 'cf_lkti_subtema',
        field_name: 'Subtema Karya Tulis Ilmiah',
        field_type: 'select',
        options: [
          'Transformasi Digital di Sektor Pendidikan',
          'Ketahanan Pangan & Teknologi Pertanian',
          'Energi Terbarukan & Lingkungan Hidup'
        ],
        is_mandatory: true,
        placeholder: 'Pilih Subtema',
        help_text: 'Pilih subtema yang relevan dengan topik riset karya tulis Anda.'
      },
      {
        id: 'cf_dosen_pembimbing',
        field_name: 'Nama & NIP Dosen Pembimbing',
        field_type: 'text',
        is_mandatory: true,
        placeholder: 'Dr. Nama Dosen, M.Kom (NIP: 1980...)',
        help_text: 'Dosen pembimbing yang mengesahkan lembar pengesahan LKTI.'
      }
    ]
  },
  3: {
    allow_individual: false,
    allow_team: true,
    min_team_members: 3,
    max_team_members: 5,
    require_ktm: true,
    require_surat_aktif: false,
    require_twibbon: true,
    require_proposal: true,
    require_pitch_video: true,
    require_statement_letter: true,
    custom_fields: [
      {
        id: 'cf_astra_focus',
        field_name: 'Pilar Inovasi Bisnis Astra',
        field_type: 'select',
        options: ['Automotive & Mobility Solution', 'Financial Technology Inclusion', 'Agribusiness & Green Economy', 'Heavy Equipment & Mining Future'],
        is_mandatory: true,
        placeholder: 'Pilih Pilar Bisnis',
      },
      {
        id: 'cf_pitch_deck_link',
        field_name: 'Link Video Pitch (YouTube/Drive unlisted)',
        field_type: 'url',
        is_mandatory: true,
        placeholder: 'https://youtu.be/... atau link Google Drive',
        help_text: 'Video perkenalan tim dan elevator pitch ide bisnis (maks 3 menit).'
      }
    ]
  },
  4: {
    allow_individual: false,
    allow_team: true,
    min_team_members: 2,
    max_team_members: 3,
    require_ktm: true,
    require_surat_aktif: false,
    require_twibbon: false,
    require_proposal: false,
    require_pitch_video: false,
    require_statement_letter: true,
    custom_fields: [
      {
        id: 'cf_figma_profile',
        field_name: 'Link Portofolio Figma / Dribbble / Behance Tim',
        field_type: 'url',
        is_mandatory: true,
        placeholder: 'https://behance.net/... atau figma.com/@...',
        help_text: 'Tautan portofolio desain UI/UX anggota tim.'
      }
    ]
  },
  5: {
    allow_individual: true,
    allow_team: false,
    min_team_members: 1,
    max_team_members: 1,
    require_ktm: true,
    require_surat_aktif: false,
    require_twibbon: false,
    require_proposal: false,
    require_pitch_video: false,
    require_statement_letter: false,
    custom_fields: [
      {
        id: 'cf_cp_handle',
        field_name: 'Handle Codeforces / LeetCode / AtCoder',
        field_type: 'text',
        is_mandatory: true,
        placeholder: 'Username akun competitive programming',
        help_text: 'Digunakan panitia untuk seeding pembagian room kontes.'
      }
    ]
  }
};

function getDefaultFormSettings(comp: Competition): CompetitionFormSettings {
  const isIndividual = comp.comp_type === 'individual' || comp.comp_type === 'both';
  const isTeam = comp.comp_type === 'team' || comp.comp_type === 'both';
  return {
    allow_individual: isIndividual,
    allow_team: isTeam,
    min_team_members: isTeam ? 2 : 1,
    max_team_members: isTeam ? 4 : 1,
    require_ktm: true,
    require_surat_aktif: false,
    require_twibbon: false,
    require_proposal: false,
    require_pitch_video: false,
    require_statement_letter: false,
    custom_fields: [],
  };
}

// ── Helper: generate fallback timeline if none configured ────
function generateDefaultTimeline(comp: Competition): CompetitionTimelineItem[] {
  const deadline = new Date(comp.registration_deadline);
  const now = new Date();
  const startDate = comp.start_date ? new Date(comp.start_date) : new Date(deadline.getTime() + 7 * 86400000);
  const endDate = comp.end_date ? new Date(comp.end_date) : new Date(startDate.getTime() + 2 * 86400000);

  const isRegClosed = now > deadline;
  const isStarted = now >= startDate;
  const isEnded = now > endDate;

  return [
    {
      id: comp.id * 1000 + 1,
      competition_id: comp.id,
      order: 1,
      title: 'Pendaftaran & Pengumpulan Berkas',
      description: 'Pendaftaran resmi peserta dan verifikasi data administrasi kompetisi.',
      start_date: comp.created_at || new Date(deadline.getTime() - 14 * 86400000).toISOString(),
      end_date: comp.registration_deadline,
      status: isRegClosed ? 'completed' : 'current',
      location_or_link: 'Portal Raih',
    },
    {
      id: comp.id * 1000 + 2,
      competition_id: comp.id,
      order: 2,
      title: 'Technical Meeting & Pembekalan',
      description: 'Penjelasan tata tertib pelaksanaan lomba dan sesi tanya jawab bersama juri.',
      start_date: new Date(startDate.getTime() - 2 * 86400000).toISOString(),
      end_date: null,
      status: isStarted ? 'completed' : isRegClosed ? 'current' : 'upcoming',
      location_or_link: 'Online Meeting',
    },
    {
      id: comp.id * 1000 + 3,
      competition_id: comp.id,
      order: 3,
      title: 'Pelaksanaan Lomba & Penjurian',
      description: 'Tahap inti kompetisi dan proses penilaian oleh dewan juri.',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: isEnded ? 'completed' : isStarted ? 'current' : 'upcoming',
      location_or_link: 'Daring / Luring',
    },
    {
      id: comp.id * 1000 + 4,
      competition_id: comp.id,
      order: 4,
      title: 'Pengumuman Pemenang & Penyerahan Hadiah',
      description: 'Pengumuman juara lomba dan distribusi sertifikat serta hadiah.',
      start_date: new Date(endDate.getTime() + 86400000).toISOString(),
      end_date: null,
      status: isEnded ? 'completed' : 'upcoming',
      location_or_link: 'Portal Raih',
    },
  ];
}

// ── Helper: enrich competition ────────────────────────────────
function enrichCompetition(comp: Competition, userId?: number): CompetitionWithDetails {
  const category = mockCategories.find(c => c.id === comp.category_id);
  const organizerUser = _users.find(u => u.id === comp.organizer_id);
  const organizerProfile = mockOrganizerProfiles.find(o => o.user_id === comp.organizer_id);
  const requirements = mockCompetitionRequirements.filter(r => r.competition_id === comp.id);
  const participantCount = _registrations.filter(r => r.competition_id === comp.id).length;
  const isSaved = userId ? _saved.some(s => s.user_id === userId && s.competition_id === comp.id) : false;
  const userReg = userId ? _registrations.find(r => r.competition_id === comp.id && r.user_id === userId) : undefined;

  let timeline = _timelines
    .filter(t => t.competition_id === comp.id)
    .sort((a, b) => a.order - b.order);

  if (timeline.length === 0) {
    timeline = generateDefaultTimeline(comp);
  }

  const formSettings = _formSettings[comp.id] ?? getDefaultFormSettings(comp);

  return {
    ...comp,
    category,
    organizer: organizerProfile ? { ...organizerProfile, user: organizerUser } : undefined,
    requirements,
    timeline,
    form_settings: formSettings,
    participant_count: participantCount,
    is_saved: isSaved,
    user_registration: userReg,
  };
}

// ── Helper: enrich user ───────────────────────────────────────
function enrichUser(user: User): UserWithProfiles {
  const participant_profile = mockParticipantProfiles.find(p => p.user_id === user.id);
  const organizer_profile = mockOrganizerProfiles.find(o => o.user_id === user.id);
  return { ...user, participant_profile, organizer_profile };
}

// ── Helper: enrich registration ───────────────────────────────
function enrichRegistration(reg: Registration): RegistrationWithDetails {
  const competition = _competitions.find(c => c.id === reg.competition_id);
  const payment = _payments.find(p => p.registration_id === reg.id);
  return { ...reg, competition, payment };
}

// ============================================================
// CompetitionRepository Implementation
// TODO [SUPABASE MIGRATION]: Replace with supabase.from('competitions')
// ============================================================
export const competitionRepo: CompetitionRepository = {
  async getAll() {
    await delay();
    return _competitions.filter(c => c.status !== 'draft');
  },
  async getById(id, userId?: number) {
    await delay();
    const comp = _competitions.find(c => c.id === id);
    return comp ? enrichCompetition(comp, userId) : null;
  },
  async getByCategory(categoryId) {
    await delay();
    return _competitions.filter(c => c.category_id === categoryId && c.status === 'published');
  },
  async getByScope(scope) {
    await delay();
    const catIds = mockCategories.filter(c => c.scope === scope).map(c => c.id);
    return _competitions.filter(c => catIds.includes(c.category_id!) && c.status === 'published');
  },
  async getByOrganizer(organizerId) {
    await delay();
    return _competitions.filter(c => c.organizer_id === organizerId);
  },
  async getByStatus(status) {
    await delay();
    return _competitions.filter(c => c.status === status);
  },
  async getFeatured() {
    await delay();
    return _competitions.filter(c => c.is_featured && c.status === 'published');
  },
  async getUpcomingDeadlines(days = 14) {
    await delay();
    const cutoff = new Date(Date.now() + days * 86400000);
    return _competitions.filter(c => {
      const dl = new Date(c.registration_deadline);
      return dl > new Date() && dl <= cutoff && c.status === 'published';
    }).sort((a, b) => new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime());
  },
  async getRecommendedFor(userId) {
    await delay();
    // Simple: based on user interests — return published comps not yet registered
    const userRegs = _registrations.filter(r => r.user_id === userId).map(r => r.competition_id);
    return _competitions.filter(c => c.status === 'published' && !userRegs.includes(c.id)).slice(0, 6);
  },
  async search(query, filters) {
    await delay();
    let results = _competitions.filter(c => c.status === 'published');
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(c => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (filters?.category_id) results = results.filter(c => c.category_id === filters.category_id);
    if (filters?.comp_type) results = results.filter(c => c.comp_type === filters.comp_type);
    if (filters?.is_free) results = results.filter(c => c.registration_fee === 0);
    return results;
  },
  async create(data, timeline, formSettings) {
    await delay();
    const newCompId = Date.now();
    const newComp = { ...data, id: newCompId, created_at: new Date().toISOString() };
    _competitions.push(newComp as Competition);

    if (timeline && timeline.length > 0) {
      timeline.forEach((item, index) => {
        _timelines.push({
          ...item,
          id: Date.now() + index + 1,
          competition_id: newCompId,
          order: item.order ?? index + 1,
          status: item.status ?? 'upcoming',
        });
      });
    }

    if (formSettings) {
      _formSettings[newCompId] = formSettings;
    } else {
      _formSettings[newCompId] = getDefaultFormSettings(newComp as Competition);
    }

    return newComp as Competition;
  },
  async update(id, data) {
    await delay();
    const idx = _competitions.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Competition not found');
    _competitions[idx] = { ..._competitions[idx], ...data };
    return _competitions[idx];
  },
  async delete(id) {
    await delay();
    _competitions = _competitions.filter(c => c.id !== id);
    _timelines = _timelines.filter(t => t.competition_id !== id);
    delete _formSettings[id];
  },
  async getTimeline(competitionId) {
    await delay();
    const comp = _competitions.find(c => c.id === competitionId);
    let items = _timelines
      .filter(t => t.competition_id === competitionId)
      .sort((a, b) => a.order - b.order);

    if (items.length === 0 && comp) {
      items = generateDefaultTimeline(comp);
    }
    return items;
  },
  async saveTimeline(competitionId, items) {
    await delay();
    // Remove existing items for this competition
    _timelines = _timelines.filter(t => t.competition_id !== competitionId);

    // Insert new/updated items
    const saved: CompetitionTimelineItem[] = items.map((item, idx) => ({
      id: item.id && item.id < 1000000000000 ? item.id : Date.now() + idx + 1,
      competition_id: competitionId,
      title: item.title,
      description: item.description ?? null,
      start_date: item.start_date,
      end_date: item.end_date ?? null,
      status: item.status,
      order: item.order ?? idx + 1,
      location_or_link: item.location_or_link ?? null,
    }));

    _timelines.push(...saved);
    return saved.sort((a, b) => a.order - b.order);
  },
  async updateTimelineItem(id, data) {
    await delay();
    const idx = _timelines.findIndex(t => t.id === id);
    if (idx === -1) {
      throw new Error('Timeline item not found');
    }
    _timelines[idx] = { ..._timelines[idx], ...data };
    return _timelines[idx];
  },
  async deleteTimelineItem(id) {
    await delay();
    _timelines = _timelines.filter(t => t.id !== id);
  },
  async getFormSettings(competitionId) {
    await delay();
    const comp = _competitions.find(c => c.id === competitionId);
    if (!comp) return null;
    return _formSettings[competitionId] ?? getDefaultFormSettings(comp);
  },
  async saveFormSettings(competitionId, settings) {
    await delay();
    _formSettings[competitionId] = settings;
    return _formSettings[competitionId];
  },
};

// ============================================================
// UserRepository Implementation
// TODO [SUPABASE MIGRATION]: Replace with supabase.from('users')
// ============================================================
export const userRepo: UserRepository = {
  async getAll() {
    await delay();
    return _users;
  },
  async getById(id) {
    await delay();
    const user = _users.find(u => u.id === id);
    return user ? enrichUser(user) : null;
  },
  async getByEmail(email) {
    await delay();
    return _users.find(u => u.email === email) ?? null;
  },
  async create(data) {
    await delay();
    const now = new Date().toISOString();
    const user = { ...data, id: Date.now(), created_at: now, updated_at: now };
    _users.push(user as User);
    return user as User;
  },
  async update(id, data) {
    await delay();
    const idx = _users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    _users[idx] = { ..._users[idx], ...data, updated_at: new Date().toISOString() };
    return _users[idx];
  },
  async updateParticipantProfile(userId, data) {
    await delay();
    const existing = mockParticipantProfiles.find(p => p.user_id === userId);
    if (!existing) throw new Error('Profile not found');
    Object.assign(existing, data);
    return existing;
  },
  async updateOrganizerProfile(userId, data) {
    await delay();
    const existing = mockOrganizerProfiles.find(o => o.user_id === userId);
    if (!existing) throw new Error('Profile not found');
    Object.assign(existing, data);
    return existing;
  },
  async getUserInterests(userId) {
    await delay();
    return mockInterestData; // simplified — return all for mock
  },
  async setUserInterests(userId, interestIds) {
    await delay();
    // In local impl, we just log
    console.log(`[mock] Set interests for user ${userId}:`, interestIds);
  },
  async searchParticipants(query, skills) {
    await delay();
    let results = _users.filter(u => u.role === 'participant');
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(u => u.name.toLowerCase().includes(q) || u.location?.toLowerCase().includes(q));
    }
    return results.map(enrichUser);
  },
};

// ============================================================
// RegistrationRepository Implementation
// TODO [SUPABASE MIGRATION]: Replace with supabase.from('registrations')
// ============================================================
export const registrationRepo: RegistrationRepository = {
  async getAll() { await delay(); return _registrations; },
  async getById(id) {
    await delay();
    const reg = _registrations.find(r => r.id === id);
    return reg ? enrichRegistration(reg) : null;
  },
  async getByUser(userId) {
    await delay();
    return _registrations.filter(r => r.user_id === userId).map(enrichRegistration);
  },
  async getByCompetition(competitionId) {
    await delay();
    return _registrations.filter(r => r.competition_id === competitionId).map(enrichRegistration);
  },
  async getOngoing(userId) {
    await delay();
    const comp_ids_approved = _registrations
      .filter(r => r.user_id === userId && r.status === 'approved')
      .map(r => r.competition_id);
    const ongoingComps = _competitions.filter(c => comp_ids_approved.includes(c.id) && c.status === 'published');
    const regs = _registrations.filter(r => r.user_id === userId && ongoingComps.some(c => c.id === r.competition_id));
    return regs.map(enrichRegistration);
  },
  async getCompleted(userId) {
    await delay();
    const comp_ids = _registrations.filter(r => r.user_id === userId).map(r => r.competition_id);
    const completedComps = _competitions.filter(c => comp_ids.includes(c.id) && c.status === 'completed');
    const regs = _registrations.filter(r => r.user_id === userId && completedComps.some(c => c.id === r.competition_id));
    return regs.map(enrichRegistration);
  },
  async create(data) {
    await delay();
    const reg = { ...data, id: Date.now(), registered_at: new Date().toISOString() };
    _registrations.push(reg as Registration);
    return reg as Registration;
  },
  async updateStatus(id, status) {
    await delay();
    const reg = _registrations.find(r => r.id === id);
    if (!reg) throw new Error('Registration not found');
    reg.status = status;
    return reg;
  },
  async delete(id) {
    await delay();
    _registrations = _registrations.filter(r => r.id !== id);
  },
};

// ============================================================
// Other Repositories (simplified local implementations)
// TODO [SUPABASE MIGRATION]: Replace each with supabase.from('<table>')
// ============================================================

export const paymentRepo: PaymentRepository = {
  async getByRegistration(registrationId) {
    await delay();
    return _payments.find(p => p.registration_id === registrationId) ?? null;
  },
  async create(data) {
    await delay();
    const payment = { ...data, id: Date.now() };
    _payments.push(payment as Payment);
    return payment as Payment;
  },
  async updateStatus(id, status, transactionId) {
    await delay();
    const payment = _payments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    payment.status = status;
    if (transactionId) payment.transaction_id = transactionId;
    if (status === 'success') payment.paid_at = new Date().toISOString();
    return payment;
  },
};

export const savedCompRepo: SavedCompetitionRepository = {
  async getByUser(userId) {
    await delay();
    return _saved
      .filter(s => s.user_id === userId)
      .map(s => ({ ...s, competition: _competitions.find(c => c.id === s.competition_id)! }))
      .filter(s => s.competition);
  },
  async save(userId, competitionId) {
    await delay();
    const existing = _saved.find(s => s.user_id === userId && s.competition_id === competitionId);
    if (existing) return existing;
    const saved = { user_id: userId, competition_id: competitionId, saved_at: new Date().toISOString() };
    _saved.push(saved);
    return saved;
  },
  async unsave(userId, competitionId) {
    await delay();
    _saved = _saved.filter(s => !(s.user_id === userId && s.competition_id === competitionId));
  },
  async isSaved(userId, competitionId) {
    await delay();
    return _saved.some(s => s.user_id === userId && s.competition_id === competitionId);
  },
};

export const reviewRepo: ReviewRepository = {
  async getAll() { await delay(); return _reviews; },
  async getByOrganizer(organizerId) {
    await delay();
    return _reviews.filter(r => r.organizer_id === organizerId);
  },
  async getByCompetition(competitionId) {
    await delay();
    return _reviews.filter(r => r.competition_id === competitionId);
  },
  async create(data) {
    await delay();
    const review = { ...data, id: Date.now(), created_at: new Date().toISOString() };
    _reviews.push(review as Review);
    return review as Review;
  },
  async delete(id) {
    await delay();
    _reviews = _reviews.filter(r => r.id !== id);
  },
};

export const notificationRepo: NotificationRepository = {
  async getByUser(userId) {
    await delay();
    return _notifications.filter(n => n.user_id === userId).sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  },
  async getUnreadCount(userId) {
    await delay();
    return _notifications.filter(n => n.user_id === userId && !n.is_read).length;
  },
  async markRead(id) {
    await delay();
    const n = _notifications.find(n => n.id === id);
    if (n) n.is_read = true;
  },
  async markAllRead(userId) {
    await delay();
    _notifications.filter(n => n.user_id === userId).forEach(n => n.is_read = true);
  },
  async create(data) {
    await delay();
    const n = { ...data, id: Date.now(), sent_at: new Date().toISOString() };
    _notifications.push(n as Notification);
    return n as Notification;
  },
};

export const xpRepo: XpRepository = {
  async getByUser(userId) {
    await delay();
    return _xpTransactions.filter(x => x.user_id === userId);
  },
  async addXp(userId, amount, reason, competitionId) {
    await delay();
    const tx = { id: Date.now(), user_id: userId, competition_id: competitionId ?? null, xp_earned: amount, reason, created_at: new Date().toISOString() };
    _xpTransactions.push(tx as XpTransaction);
    return tx as XpTransaction;
  },
  async getUserXpTotal(userId) {
    await delay();
    return _xpTransactions.filter(x => x.user_id === userId).reduce((sum, x) => sum + x.xp_earned, 0);
  },
};

export const categoryRepo: CategoryRepository = {
  async getAll() { await delay(); return mockCategories; },
  async getById(id) { await delay(); return mockCategories.find(c => c.id === id) ?? null; },
  async getByScope(scope) { await delay(); return mockCategories.filter(c => c.scope === scope); },
};

export const interestRepo: InterestRepository = {
  async getAll() { await delay(); return mockInterestData; },
  async getById(id) { await delay(); return mockInterestData.find(i => i.id === id) ?? null; },
};

export const certificateRepo: CertificateRepository = {
  async getByUser(userId) { await delay(); return _certificates.filter(c => c.user_id === userId); },
  async getByCompetition(competitionId) { await delay(); return _certificates.filter(c => c.competition_id === competitionId); },
  async create(data) {
    await delay();
    const cert = { ...data, id: Date.now(), issued_at: new Date().toISOString() };
    _certificates.push(cert as Certificate);
    return cert as Certificate;
  },
};

export const searchHistoryRepo: SearchHistoryRepository = {
  async getByUser(userId, limit = 10) {
    await delay();
    return _searchHistory.filter(s => s.user_id === userId).sort((a, b) => new Date(b.searched_at).getTime() - new Date(a.searched_at).getTime()).slice(0, limit);
  },
  async add(userId, keyword) {
    await delay();
    const existing = _searchHistory.findIndex(s => s.user_id === userId && s.keyword === keyword);
    if (existing !== -1) _searchHistory.splice(existing, 1);
    const entry = { id: Date.now(), user_id: userId, keyword, searched_at: new Date().toISOString() };
    _searchHistory.unshift(entry as SearchHistory);
    return entry as SearchHistory;
  },
  async clear(userId) {
    await delay();
    _searchHistory = _searchHistory.filter(s => s.user_id !== userId);
  },
};

export const teammateRepo: TeammateRepository = {
  async getMatchesFor(userId) {
    await delay();
    return _teammatematches
      .filter(m => m.user_id === userId)
      .map(m => {
        const matchedUser = _users.find(u => u.id === m.matched_user_id);
        return matchedUser ? { ...m, matchedUser: enrichUser(matchedUser) } : null;
      })
      .filter(Boolean) as any;
  },
  async findPotential(userId, skills) {
    await delay();
    const results = _users.filter(u => u.role === 'participant' && u.id !== userId);
    return results.map(enrichUser);
  },
};
