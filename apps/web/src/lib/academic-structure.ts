import { db } from './db';
import { getAcademicStructureDefaults, normalizeInstitutionType } from './institution-terminology';
import { persistWorkspaceByInstitutionId } from './persistent-auth';

async function getSections(institutionId: string) {
  return db.section.findMany({
    where: { institutionId },
    include: { schoolClass: { select: { name: true, grade: true } } },
    orderBy: { name: 'asc' },
  });
}

type SectionWithClass = Awaited<ReturnType<typeof getSections>>[number];

function isLegacySchoolStarter(type: string, sections: SectionWithClass[]) {
  if (normalizeInstitutionType(type) === 'SCHOOL' || sections.length === 0) return false;

  return sections.every((section) => (
    section.schoolClass.name === 'Grade 1' &&
    section.schoolClass.grade === '1' &&
    ['1-A', '1-B'].includes(section.name)
  ));
}

async function updateLegacyStarterSections(institutionId: string, type: string, sections: SectionWithClass[]) {
  if (!isLegacySchoolStarter(type, sections)) return false;

  const defaults = getAcademicStructureDefaults(type);
  const classIds = [...new Set(sections.map((section) => section.classId))];

  await db.schoolClass.updateMany({
    where: { institutionId, id: { in: classIds } },
    data: {
      name: defaults.className,
      grade: defaults.grade,
    },
  });

  for (const [index, section] of sections.entries()) {
    await db.section.update({
      where: { id: section.id },
      data: { name: defaults.sections[index] ?? defaults.sections[0] },
    });
  }

  await persistWorkspaceByInstitutionId(institutionId);
  return true;
}

export async function ensureStudentSections(institutionId: string) {
  const institution = await db.institution.findUnique({
    where: { id: institutionId },
    select: { type: true },
  });
  const type = institution?.type ?? 'SCHOOL';
  const defaults = getAcademicStructureDefaults(type);
  const existing = await getSections(institutionId);
  if (existing.length > 0) {
    const migrated = await updateLegacyStarterSections(institutionId, type, existing);
    return migrated ? getSections(institutionId) : existing;
  }

  const klass = await db.schoolClass.findFirst({
    where: { institutionId },
    orderBy: { grade: 'asc' },
  });

  const resolvedClass = klass
    ? await db.schoolClass.update({
      where: { id: klass.id },
      data: {
        name: normalizeInstitutionType(type) === 'SCHOOL' ? klass.name : defaults.className,
        grade: normalizeInstitutionType(type) === 'SCHOOL' ? klass.grade : defaults.grade,
      },
    })
    : await db.schoolClass.create({
    data: {
      institutionId,
      name: defaults.className,
      grade: defaults.grade,
    },
  });

  const createdSections = [];
  for (const section of defaults.sections) {
    const created = await db.section.create({
      data: {
        institutionId,
        classId: resolvedClass.id,
        name: section,
        capacity: 40,
      },
    });
    createdSections.push(created);
  }

  if (createdSections[0]) {
    await db.student.updateMany({
      where: { institutionId, sectionId: null },
      data: { sectionId: createdSections[0].id },
    });
  }

  await persistWorkspaceByInstitutionId(institutionId);

  return db.section.findMany({
    where: { institutionId },
    include: { schoolClass: { select: { name: true, grade: true } } },
    orderBy: { name: 'asc' },
  });
}
