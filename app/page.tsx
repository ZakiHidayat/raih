// ============================================================
// RAIH — Root Page (Redirect to Onboarding)
// ============================================================
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/home');
}
