# 🏆 Raih — Platform Pencarian & Manajemen Kompetisi

Platform web berbasis Next.js untuk membantu pelajar, mahasiswa, dan masyarakat umum menemukan, mendaftar, dan mengelola partisipasi lomba/kompetisi di Indonesia.

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Node.js >= 18
- npm >= 9

### Langkah-langkah

```bash
# 1. Masuk ke folder project
cd raih-nextjs

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

**Demo login:**
- Peserta: `ariel@example.com` (password bebas)
- Organizer: `himsi@ugm.ac.id` (password bebas)

---

## 📁 Struktur Folder

```
raih-nextjs/
├── app/                          # Next.js App Router
│   ├── (participant)/            # Halaman peserta (route group)
│   │   ├── home/                 # Beranda peserta
│   │   ├── search/               # Pencarian & filter
│   │   ├── competitions/[id]/    # Detail kompetisi
│   │   ├── saved/                # Kompetisi tersimpan
│   │   ├── activity/             # Aktivitas lomba
│   │   ├── profile/              # Profil peserta
│   │   └── teammates/            # Cari rekan tim
│   ├── (organizer)/              # Halaman organizer (route group)
│   │   ├── dashboard/            # Dashboard organizer
│   │   ├── competitions/create/  # Buat kompetisi (wizard)
│   │   ├── participants/         # Manajemen peserta
│   │   └── analytics/            # Analitik & insight
│   ├── auth/
│   │   ├── login/                # Halaman login
│   │   └── register/             # Halaman daftar
│   ├── onboarding/               # 3-slide intro onboarding
│   ├── interest-selection/       # Pilih minat setelah daftar
│   ├── globals.css               # Global styles + HeroUI theme
│   ├── layout.tsx                # Root layout
│   └── providers.tsx             # HeroUI & context providers
│
├── types/
│   └── index.ts                  # TypeScript types (1:1 mapping ke SQL schema)
│
├── data/
│   └── mock/
│       ├── users.ts              # Mock data: users, profiles organizer
│       ├── interests.ts          # Mock data: interests, categories
│       ├── competitions.ts       # Mock data: competitions, requirements
│       ├── activity.ts           # Mock data: registrations, payments, XP, dll
│       └── index.ts              # Barrel export
│
├── lib/
│   ├── repositories/
│   │   ├── interfaces.ts         # Repository interfaces (abstraction layer)
│   │   └── local.ts              # Implementasi lokal (in-memory arrays)
│   └── stores/
│       └── auth.ts               # Zustand auth store
│
└── components/                   # Komponen reusable (tersedia untuk extension)
    ├── features/
    │   ├── competitions/
    │   ├── auth/
    │   ├── organizer/
    │   └── profile/
    ├── ui/
    └── layout/
```

---

## 🗄️ Struktur Data Lokal (Fase 1)

Data disimpan dalam array TypeScript di `data/mock/`. Setiap array berisi 15-20+ record realistis dan mengikuti relasi FK dari schema SQL (`src/assets/reference/raih_schema.sql`).

**Tabel yang diimplementasikan:**

| Mock File | Tabel SQL |
|---|---|
| `users.ts` | `users`, `participant_profiles`, `organizer_profiles` |
| `interests.ts` | `interests`, `categories` |
| `competitions.ts` | `competitions`, `competition_requirements` |
| `activity.ts` | `registrations`, `payments`, `saved_competitions`, `reviews`, `notifications`, `xp_transactions`, `certificates`, `search_history`, `teammate_matches` |

Semua operasi data (read, write) melewati **repository layer** di `lib/repositories/`. Ini memastikan UI tidak pernah langsung menyentuh mock data — cukup ganti implementasi repository untuk migrasi.

---

## 🔄 Langkah Migrasi ke Supabase (Fase 2)

### 1. Setup Supabase Project

```bash
# Install Supabase client
npm install @supabase/supabase-js
```

### 2. Isi Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Jalankan SQL Schema

Copy isi file `src/assets/reference/raih_schema.sql` dan jalankan di Supabase SQL Editor.

### 4. Buat Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 5. Ganti Implementasi Repository

Buat `lib/repositories/supabase.ts` dengan mengimplementasikan interface yang sama dari `interfaces.ts`:

```typescript
// Contoh: CompetitionRepository dengan Supabase
export const competitionRepo: CompetitionRepository = {
  async getAll() {
    const { data } = await supabase
      .from('competitions')
      .select('*')
      .neq('status', 'draft');
    return data ?? [];
  },
  // ... implementasikan semua method lainnya
};
```

### 6. Ganti Auth Store

Di `lib/stores/auth.ts`, ganti setiap mock auth dengan Supabase Auth:
- `login()` → `supabase.auth.signInWithPassword()`
- `loginWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: 'google' })`
- `register()` → `supabase.auth.signUp()`
- `logout()` → `supabase.auth.signOut()`

### 7. Cari Semua TODO Migration

```bash
grep -rn "TODO \[SUPABASE MIGRATION\]" lib/
```

Setiap baris `// TODO [SUPABASE MIGRATION]` menandai titik yang perlu diganti.

---

## 🎨 Design System

- **Primary color:** Raih Orange `#FF5D35`
- **Font:** Geist Sans (Next.js default)
- **UI Library:** HeroUI v3.2.x (Tailwind CSS v4)
- **Theme variables:** `app/globals.css`

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** HeroUI v3 + Tailwind CSS v4
- **Animation:** Framer Motion
- **State:** Zustand
- **Icons:** Lucide React
