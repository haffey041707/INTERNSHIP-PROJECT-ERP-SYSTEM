import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getInstitutionSuiteForType } from '@/lib/institution-suites';

export async function requireCurrentInstitutionSuite(expectedHref?: string) {
  const session = getSession();
  if (!session) redirect('/login');

  const institution = await db.institution.findUnique({
    where: { id: session.institutionId },
    select: { type: true },
  });

  const suite = getInstitutionSuiteForType(institution?.type);
  if (expectedHref && suite.href !== expectedHref) redirect(suite.href);
  return suite;
}
