// ============================================================
// RAIH — Repository Interfaces
// These abstractions allow swapping local → Supabase implementation
// ============================================================
import type {
  Competition, CompetitionWithDetails, Category, CategoryScope,
  CompetitionStatus, Registration, RegistrationWithDetails,
  Payment, SavedCompetition, Review, Notification, XpTransaction,
  Certificate, SearchHistory, User, UserWithProfiles, AuthUser,
  ParticipantProfile, OrganizerProfile, Interest, TeammateMatch,
  CompetitionRequirement, Team, TeamMember, CompetitionTimelineItem,
  CompetitionFormSettings
} from '@/types';

export type {
  Competition, CompetitionWithDetails, Category, CategoryScope,
  CompetitionStatus, Registration, RegistrationWithDetails,
  Payment, SavedCompetition, Review, Notification, XpTransaction,
  Certificate, SearchHistory, User, UserWithProfiles, AuthUser,
  ParticipantProfile, OrganizerProfile, Interest, TeammateMatch,
  CompetitionRequirement, Team, TeamMember, CompetitionTimelineItem,
  CompetitionFormSettings
};

// ── Competition Repository ────────────────────────────────────
export interface CompetitionRepository {
  getAll(): Promise<Competition[]>;
  getById(id: number, userId?: number): Promise<CompetitionWithDetails | null>;
  getByCategory(categoryId: number): Promise<Competition[]>;
  getByScope(scope: CategoryScope): Promise<Competition[]>;
  getByOrganizer(organizerId: number): Promise<Competition[]>;
  getByStatus(status: CompetitionStatus): Promise<Competition[]>;
  getFeatured(): Promise<Competition[]>;
  getUpcomingDeadlines(days?: number): Promise<Competition[]>;
  getRecommendedFor(userId: number): Promise<Competition[]>;
  search(query: string, filters?: CompetitionFilters): Promise<Competition[]>;
  create(
    data: Omit<Competition, 'id' | 'created_at'>,
    timeline?: Array<Omit<CompetitionTimelineItem, 'id' | 'competition_id'>>,
    formSettings?: CompetitionFormSettings
  ): Promise<Competition>;
  update(id: number, data: Partial<Competition>): Promise<Competition>;
  delete(id: number): Promise<void>;
  // Timeline methods
  getTimeline(competitionId: number): Promise<CompetitionTimelineItem[]>;
  saveTimeline(competitionId: number, items: Array<Omit<CompetitionTimelineItem, 'id' | 'competition_id'> & { id?: number }>): Promise<CompetitionTimelineItem[]>;
  updateTimelineItem(id: number, data: Partial<CompetitionTimelineItem>): Promise<CompetitionTimelineItem>;
  deleteTimelineItem(id: number): Promise<void>;
  // Form Settings methods
  getFormSettings(competitionId: number): Promise<CompetitionFormSettings | null>;
  saveFormSettings(competitionId: number, settings: CompetitionFormSettings): Promise<CompetitionFormSettings>;
}

export interface CompetitionFilters {
  category_id?: number;
  scope?: CategoryScope;
  status?: CompetitionStatus;
  comp_type?: string;
  is_free?: boolean;
  min_prize?: number;
  deadline_before?: string;
}

// ── User Repository ───────────────────────────────────────────
export interface UserRepository {
  getAll(): Promise<User[]>;
  getById(id: number): Promise<UserWithProfiles | null>;
  getByEmail(email: string): Promise<User | null>;
  create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
  updateParticipantProfile(userId: number, data: Partial<ParticipantProfile>): Promise<ParticipantProfile>;
  updateOrganizerProfile(userId: number, data: Partial<OrganizerProfile>): Promise<OrganizerProfile>;
  getUserInterests(userId: number): Promise<Interest[]>;
  setUserInterests(userId: number, interestIds: number[]): Promise<void>;
  searchParticipants(query: string, skills?: string[]): Promise<UserWithProfiles[]>;
}

// ── Registration Repository ───────────────────────────────────
export interface RegistrationRepository {
  getAll(): Promise<Registration[]>;
  getById(id: number): Promise<RegistrationWithDetails | null>;
  getByUser(userId: number): Promise<RegistrationWithDetails[]>;
  getByCompetition(competitionId: number): Promise<RegistrationWithDetails[]>;
  getOngoing(userId: number): Promise<RegistrationWithDetails[]>;
  getCompleted(userId: number): Promise<RegistrationWithDetails[]>;
  create(data: Omit<Registration, 'id' | 'registered_at'>): Promise<Registration>;
  updateStatus(id: number, status: Registration['status']): Promise<Registration>;
  delete(id: number): Promise<void>;
}

// ── Payment Repository ────────────────────────────────────────
export interface PaymentRepository {
  getByRegistration(registrationId: number): Promise<Payment | null>;
  create(data: Omit<Payment, 'id'>): Promise<Payment>;
  updateStatus(id: number, status: Payment['status'], transactionId?: string): Promise<Payment>;
}

// ── Saved Competition Repository ──────────────────────────────
export interface SavedCompetitionRepository {
  getByUser(userId: number): Promise<(SavedCompetition & { competition: Competition })[]>;
  save(userId: number, competitionId: number): Promise<SavedCompetition>;
  unsave(userId: number, competitionId: number): Promise<void>;
  isSaved(userId: number, competitionId: number): Promise<boolean>;
}

// ── Review Repository ─────────────────────────────────────────
export interface ReviewRepository {
  getAll(): Promise<Review[]>;
  getByOrganizer(organizerId: number): Promise<Review[]>;
  getByCompetition(competitionId: number): Promise<Review[]>;
  create(data: Omit<Review, 'id' | 'created_at'>): Promise<Review>;
  delete(id: number): Promise<void>;
}

// ── Notification Repository ───────────────────────────────────
export interface NotificationRepository {
  getByUser(userId: number): Promise<Notification[]>;
  getUnreadCount(userId: number): Promise<number>;
  markRead(id: number): Promise<void>;
  markAllRead(userId: number): Promise<void>;
  create(data: Omit<Notification, 'id' | 'sent_at'>): Promise<Notification>;
}

// ── XP Repository ─────────────────────────────────────────────
export interface XpRepository {
  getByUser(userId: number): Promise<XpTransaction[]>;
  addXp(userId: number, amount: number, reason: string, competitionId?: number): Promise<XpTransaction>;
  getUserXpTotal(userId: number): Promise<number>;
}

// ── Category Repository ───────────────────────────────────────
export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: number): Promise<Category | null>;
  getByScope(scope: CategoryScope): Promise<Category[]>;
}

// ── Interest Repository ───────────────────────────────────────
export interface InterestRepository {
  getAll(): Promise<Interest[]>;
  getById(id: number): Promise<Interest | null>;
}

// ── Certificate Repository ────────────────────────────────────
export interface CertificateRepository {
  getByUser(userId: number): Promise<Certificate[]>;
  getByCompetition(competitionId: number): Promise<Certificate[]>;
  create(data: Omit<Certificate, 'id' | 'issued_at'>): Promise<Certificate>;
}

// ── Search History Repository ─────────────────────────────────
export interface SearchHistoryRepository {
  getByUser(userId: number, limit?: number): Promise<SearchHistory[]>;
  add(userId: number, keyword: string): Promise<SearchHistory>;
  clear(userId: number): Promise<void>;
}

// ── Teammate Repository ───────────────────────────────────────
export interface TeammateRepository {
  getMatchesFor(userId: number): Promise<(TeammateMatch & { matchedUser: UserWithProfiles })[]>;
  findPotential(userId: number, skills?: string[]): Promise<UserWithProfiles[]>;
}
