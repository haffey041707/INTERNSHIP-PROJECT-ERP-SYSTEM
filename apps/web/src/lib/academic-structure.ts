import { db } from './db';
import { persistWorkspaceByInstitutionId } from './persistent-auth';

const DEFAULTS: Record<string, { className: string; grade: string; sections: string[] }> = {
  SCHOOL: { className: 'Grade 1', grade: '1', sections: ['1-A', '1-B'] },
  COLLEGE: { className: 'Year 1', grade: 'Y1', sections: ['Y1-A', 'Y1-B'] },
  UNIVERSITY: { className: 'Semester 1', grade: 'S1', sections: ['S1-A', 'S1-B'] },
  INSTITUTE: { className: 'Batch 1', grade: 'B1', sections: ['Batch 1-A', 'Batch 1-B'] },
};

export async function ensureStudentSections(institutionId: string) {
  const existing = await db.section.findMany({
    where: { institutionId },
    include: { schoolClass: { select: { name: true, grade: true } } },
    orderBy: { name: 'asc' },
  });
  if (existing.length > 0) return existing;

  const institution = await db.institution.findUnique({
    where: { id: institutionId },
    select: { type: true },
  });
  const defaults = DEFAULTS[institution?.type ?? 'SCHOOL'] ?? DEFAULTS.SCHOOL;

  const klass = await db.schoolClass.findFirst({
    where: { institutionId },
    orderBy: { grade: 'asc' },
  }) ?? await db.schoolClass.create({
    data: {
      institutionId,
      name: defaults.className,
      grade: defaults.grade,
    },
  });

  for (const section of defaults.sections) {
    await db.section.create({
      data: {
        institutionId,
        classId: klass.id,
        name: section,
        capacity: 40,
      },
    });
  }

  await persistWorkspaceByInstitutionId(institutionId);

  return db.section.findMany({
    where: { institutionId },
    include: { schoolClass: { select: { name: true, grade: true } } },
    orderBy: { name: 'asc' },
  });
}
