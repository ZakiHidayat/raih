// ============================================================
// RAIH — TypeScript Types
// Source of truth: src/assets/reference/raih_schema.sql
// 1:1 mapping with database schema
// ============================================================

// ── users ──────────────────────────────────────────────────
export type UserRole = 'participant' | 'organizer' | 'admin';
export type AuthProvider = 'email' | 'google' | 'apple';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string | null;
  phone: string | null;
  role: UserRole;
  auth_provider: AuthProvider;
  profile_photo: string | null;
  gender: string | null;
  birth_date: string | null; // ISO date string
  education_level: string | null;
  location: string | null;
  is_verified: boolean;
  created_at: string; // ISO datetime
  updated_at: string;
}

// ── participant_profiles ────────────────────────────────────
export interface ParticipantProfile {
  user_id: number; // PK & FK → users.id
  bio: string | null;
  skills: string | null; // comma-separated or JSON string
  cv_url: string | null;
  xp_points: number;
  level: number;
  competitions_joined: number;
  competitions_won: number;
}

// ── organizer_profiles ──────────────────────────────────────
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface OrganizerProfile {
  user_id: number; // PK & FK → users.id
  organization_name: string;
  organization_type: string | null;
  website: string | null;
  verification_status: VerificationStatus;
  rating_avg: number;
}

// ── interests ───────────────────────────────────────────────
export interface Interest {
  id: number;
  name: string;
  icon: string | null; // emoji or icon URL
}

// ── user_interests ──────────────────────────────────────────
export interface UserInterest {
  user_id: number;
  interest_id: number;
}

// ── categories ──────────────────────────────────────────────
export type CategoryScope = 'akademik' | 'non_akademik' | 'nasional' | 'internasional';

export interface Category {
  id: number;
  name: string;
  scope: CategoryScope | null;
}

// ── competitions ─────────────────────────────────────────────
export type CompType = 'individual' | 'team' | 'both';
export type CompetitionStatus = 'draft' | 'published' | 'closed' | 'completed';

export interface Competition {
  id: number;
  organizer_id: number;       // FK → organizer_profiles.user_id
  category_id: number | null; // FK → categories.id
  title: string;
  description: string | null;
  comp_type: CompType | null;
  registration_fee: number;   // decimal
  prize_info: string | null;
  registration_deadline: string; // ISO datetime
  start_date: string | null;
  end_date: string | null;
  status: CompetitionStatus;
  is_featured: boolean;
  banner_image: string | null;
  created_at: string;
}

// ── competition_requirements ─────────────────────────────────
export interface CompetitionRequirement {
  id: number;
  competition_id: number; // FK → competitions.id
  requirement_name: string;
  is_mandatory: boolean;
}

export interface CustomFormField {
  id: string;
  field_name: string;
  field_type: 'text' | 'textarea' | 'select' | 'url' | 'file';
  options?: string[]; // For select dropdown options
  is_mandatory: boolean;
  placeholder?: string;
  help_text?: string;
}

export interface CompetitionFormSettings {
  allow_individual: boolean;
  allow_team: boolean;
  min_team_members?: number;
  max_team_members?: number;
  require_ktm: boolean;
  require_surat_aktif: boolean;
  require_twibbon: boolean;
  require_proposal: boolean;
  require_pitch_video: boolean;
  require_statement_letter: boolean;
  custom_fields?: CustomFormField[];
}

// ── competition_timelines ──────────────────────────────────
export type TimelineStatus = 'completed' | 'current' | 'upcoming';

export interface CompetitionTimelineItem {
  id: number;
  competition_id: number; // FK → competitions.id
  title: string;
  description?: string | null;
  start_date: string; // ISO date or YYYY-MM-DD
  end_date?: string | null; // ISO date or YYYY-MM-DD
  status: TimelineStatus;
  order: number;
  location_or_link?: string | null;
}


// ── teams ────────────────────────────────────────────────────
export interface Team {
  id: number;
  competition_id: number; // FK → competitions.id
  team_name: string;
  leader_id: number;      // FK → users.id
}

// ── team_members ─────────────────────────────────────────────
export interface TeamMember {
  team_id: number;    // FK → teams.id
  user_id: number;    // FK → users.id
  role_in_team: string | null;
}

// ── registrations ────────────────────────────────────────────
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Registration {
  id: number;
  competition_id: number; // FK → competitions.id
  user_id: number | null; // FK → users.id (individual)
  team_id: number | null; // FK → teams.id (team)
  status: RegistrationStatus;
  registered_at: string;
}

// ── registration_documents ───────────────────────────────────
export interface RegistrationDocument {
  id: number;
  registration_id: number;         // FK → registrations.id
  requirement_id: number | null;   // FK → competition_requirements.id
  file_url: string;
  uploaded_at: string;
}

// ── payments ─────────────────────────────────────────────────
export type PaymentMethod = 'qris' | 'e_wallet' | 'virtual_account';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
  id: number;
  registration_id: number; // FK → registrations.id
  amount: number;
  method: PaymentMethod | null;
  status: PaymentStatus;
  transaction_id: string | null;
  paid_at: string | null;
}

// ── featured_listings ────────────────────────────────────────
export interface FeaturedListing {
  id: number;
  competition_id: number; // FK → competitions.id
  organizer_id: number;   // FK → organizer_profiles.user_id
  start_date: string;
  end_date: string;
  price_paid: number;
}

// ── saved_competitions ───────────────────────────────────────
export interface SavedCompetition {
  user_id: number;        // FK → users.id
  competition_id: number; // FK → competitions.id
  saved_at: string;
}

// ── reviews ──────────────────────────────────────────────────
export interface Review {
  id: number;
  user_id: number;        // FK → users.id
  organizer_id: number;   // FK → organizer_profiles.user_id
  competition_id: number | null; // FK → competitions.id
  rating: number;         // 1-5
  comment: string | null;
  created_at: string;
}

// ── notifications ─────────────────────────────────────────────
export type NotificationType = 'deadline_reminder' | 'registration_status' | 'recommendation' | 'system';

export interface Notification {
  id: number;
  user_id: number; // FK → users.id
  type: NotificationType;
  title: string | null;
  message: string | null;
  is_read: boolean;
  sent_at: string;
}

// ── xp_transactions ──────────────────────────────────────────
export interface XpTransaction {
  id: number;
  user_id: number;              // FK → users.id
  competition_id: number | null; // FK → competitions.id
  xp_earned: number;
  reason: string | null;
  created_at: string;
}

// ── certificates ─────────────────────────────────────────────
export interface Certificate {
  id: number;
  user_id: number;        // FK → users.id
  competition_id: number; // FK → competitions.id
  certificate_url: string;
  issued_at: string;
}

// ── search_history ────────────────────────────────────────────
export interface SearchHistory {
  id: number;
  user_id: number; // FK → users.id
  keyword: string;
  searched_at: string;
}

// ── competition_status_log ────────────────────────────────────
export interface CompetitionStatusLog {
  id: number;
  registration_id: number; // FK → registrations.id
  status: string;
  progress_percent: number; // 0-100
  updated_at: string;
}

// ── teammate_matches ─────────────────────────────────────────
export interface TeammateMatch {
  id: number;
  user_id: number;         // FK → users.id
  matched_user_id: number; // FK → users.id
  compatibility_score: number; // decimal 0.00-100.00
  matched_at: string;
}

// ── admin_verification_logs ───────────────────────────────────
export type AdminDecision = 'verified' | 'rejected';

export interface AdminVerificationLog {
  id: number;
  organizer_id: number; // FK → organizer_profiles.user_id
  admin_id: number;     // FK → users.id
  decision: AdminDecision;
  notes: string | null;
  verified_at: string;
}

// ============================================================
// Joined / Enriched Types (for UI use — combine related tables)
// ============================================================

export interface CompetitionWithDetails extends Competition {
  category?: Category;
  organizer?: OrganizerProfile & { user?: User };
  requirements?: CompetitionRequirement[];
  timeline?: CompetitionTimelineItem[];
  form_settings?: CompetitionFormSettings;
  participant_count?: number;
  is_saved?: boolean;
  user_registration?: Registration;
}

export interface UserWithProfiles extends User {
  participant_profile?: ParticipantProfile;
  organizer_profile?: OrganizerProfile;
  interests?: Interest[];
}

export interface RegistrationWithDetails extends Registration {
  competition?: Competition;
  payment?: Payment;
  documents?: RegistrationDocument[];
  status_log?: CompetitionStatusLog[];
  team?: Team;
  team_name?: string;
}

// ── Auth State (for Context/Zustand) ─────────────────────────
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  profile_photo: string | null;
  location?: string | null;
  education_level?: string | null;
  participant_profile?: ParticipantProfile;
  organizer_profile?: OrganizerProfile;
}
