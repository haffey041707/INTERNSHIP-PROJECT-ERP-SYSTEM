import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default function Root() {
  redirect(getSession() ? '/dashboard' : '/login');
}
