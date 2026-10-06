// ============================================================
// RAIH — Auth Store (Zustand with localStorage persistence)
// TODO [SUPABASE MIGRATION]: Replace mockAuth with Supabase Auth
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole } from '@/types';
import { mockUsers, mockParticipantProfiles, mockOrganizerProfiles } from '@/data/mock';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateProfile: (data: Partial<AuthUser>) => void;

  // For dev/demo: switch between participant/organizer/admin quickly
  switchToParticipant: () => void;
  switchToOrganizer: () => void;
  switchToAdmin: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// TODO [SUPABASE MIGRATION]: Replace with supabase.auth.signInWithPassword()
async function mockLogin(email: string): Promise<AuthUser | null> {
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  const participantProfile = mockParticipantProfiles.find(p => p.user_id === user.id);
  const organizerProfile = mockOrganizerProfiles.find(o => o.user_id === user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile_photo: user.profile_photo,
    location: user.location,
    education_level: user.education_level,
    participant_profile: participantProfile,
    organizer_profile: organizerProfile,
  };
}

const defaultUser: AuthUser = {
  id: mockUsers[0].id,
  name: mockUsers[0].name,
  email: mockUsers[0].email,
  role: mockUsers[0].role,
  profile_photo: mockUsers[0].profile_photo,
  location: mockUsers[0].location,
  education_level: mockUsers[0].education_level,
  participant_profile: mockParticipantProfiles[0],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      login: async (email, password) => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 600)); // simulate network

        // TODO [SUPABASE MIGRATION]: const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        let authUser = await mockLogin(email);

        // If not found in mock, create dynamic session for demo purposes
        if (!authUser && email && password) {
          authUser = {
            id: Date.now(),
            name: email.split('@')[0],
            email: email,
            role: email.includes('org') || email.includes('admin') ? 'organizer' : 'participant',
            profile_photo: null,
            participant_profile: {
              user_id: Date.now(),
              bio: 'Pengguna baru Raih',
              skills: 'Kompetisi, Desain',
              cv_url: null,
              xp_points: 150,
              level: 1,
              competitions_joined: 0,
              competitions_won: 0,
            },
          };
        }

        if (authUser) {
          set({ user: authUser, isAuthenticated: true, isLoading: false });
          return { success: true };
        }
        set({ isLoading: false });
        return { success: false, error: 'Email atau password tidak valid.' };
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 800));
        const authUser = await mockLogin('ariel@example.com');
        if (authUser) {
          set({ user: authUser, isAuthenticated: true, isLoading: false });
          return { success: true };
        }
        set({ isLoading: false });
        return { success: false, error: 'Google login gagal.' };
      },

      loginWithApple: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 800));
        const authUser = await mockLogin('ariel@example.com');
        if (authUser) {
          set({ user: authUser, isAuthenticated: true, isLoading: false });
          return { success: true };
        }
        set({ isLoading: false });
        return { success: false, error: 'Apple login gagal.' };
      },

      register: async (data) => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 800));
        const newId = Date.now();
        const newUser: AuthUser = {
          id: newId,
          name: data.name,
          email: data.email,
          role: data.role,
          profile_photo: null,
          participant_profile: data.role === 'participant' ? {
            user_id: newId,
            bio: 'Peserta aktif kompetisi di Raih',
            skills: 'Problem Solving, Teamwork',
            cv_url: null,
            xp_points: 100,
            level: 1,
            competitions_joined: 0,
            competitions_won: 0,
          } : undefined,
          organizer_profile: data.role === 'organizer' ? {
            user_id: newId,
            organization_name: data.name,
            organization_type: 'Komunitas / Institusi',
            website: null,
            verification_status: 'verified',
            rating_avg: 5.0,
          } : undefined,
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setRole: (role) => {
        const user = get().user;
        if (user) set({ user: { ...user, role } });
      },

      updateProfile: (data) => {
        const user = get().user;
        if (user) set({ user: { ...user, ...data } });
      },

      switchToParticipant: async () => {
        const authUser = await mockLogin('ariel@example.com');
        if (authUser) set({ user: authUser, isAuthenticated: true });
      },
      switchToOrganizer: async () => {
        const authUser = await mockLogin('himsi@ugm.ac.id');
        if (authUser) set({ user: authUser, isAuthenticated: true });
      },
      switchToAdmin: async () => {
        const authUser = await mockLogin('admin@raih.id');
        if (authUser) set({ user: authUser, isAuthenticated: true });
      },
    }),
    {
      name: 'raih-auth-session',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
