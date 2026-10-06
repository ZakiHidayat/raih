// ============================================================
// RAIH — Mock Data: Interests & Categories
// ============================================================
import type { Interest, Category } from '@/types';

export const mockInterests: Interest[] = [
  { id: 1, name: 'Pemrograman & IT', icon: '💻' },
  { id: 2, name: 'Desain & Kreatif', icon: '🎨' },
  { id: 3, name: 'Bisnis & Startup', icon: '🚀' },
  { id: 4, name: 'Sains & Riset', icon: '🔬' },
  { id: 5, name: 'Matematika & Logika', icon: '📐' },
  { id: 6, name: 'Penulisan & Jurnalistik', icon: '✍️' },
  { id: 7, name: 'Seni & Fotografi', icon: '📸' },
  { id: 8, name: 'Debat & Public Speaking', icon: '🎙️' },
  { id: 9, name: 'Lingkungan & Sosial', icon: '🌱' },
  { id: 10, name: 'Robotika & Hardware', icon: '🤖' },
  { id: 11, name: 'Film & Multimedia', icon: '🎬' },
  { id: 12, name: 'Olahraga & Esports', icon: '🏆' },
  { id: 13, name: 'Ekonomi & Keuangan', icon: '💰' },
  { id: 14, name: 'Kesehatan & Medis', icon: '🏥' },
  { id: 15, name: 'Pertanian & Pangan', icon: '🌾' },
  { id: 16, name: 'Hukum & Kebijakan', icon: '⚖️' },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'Lomba Pemrograman', scope: 'akademik' },
  { id: 2, name: 'Hackathon', scope: 'non_akademik' },
  { id: 3, name: 'Kompetisi Desain UI/UX', scope: 'nasional' },
  { id: 4, name: 'Business Plan Competition', scope: 'nasional' },
  { id: 5, name: 'Olimpiade Matematika', scope: 'akademik' },
  { id: 6, name: 'Lomba Karya Tulis Ilmiah', scope: 'akademik' },
  { id: 7, name: 'Kompetisi Riset & Inovasi', scope: 'internasional' },
  { id: 8, name: 'Lomba Fotografi', scope: 'non_akademik' },
  { id: 9, name: 'Debat Nasional', scope: 'nasional' },
  { id: 10, name: 'Kompetisi Film Pendek', scope: 'non_akademik' },
  { id: 11, name: 'Lomba Robotika', scope: 'akademik' },
  { id: 12, name: 'Startup Competition', scope: 'internasional' },
  { id: 13, name: 'Kompetisi Data Science', scope: 'nasional' },
  { id: 14, name: 'Olimpiade Fisika', scope: 'akademik' },
  { id: 15, name: 'Kompetisi Esports', scope: 'non_akademik' },
];
