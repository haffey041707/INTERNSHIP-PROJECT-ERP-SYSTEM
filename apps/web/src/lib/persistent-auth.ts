import { get, list, put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { db } from './db';

const PREFIX = 'auth-workspaces/';

type PersistedWorkspace = {
  version: 1;
  updatedAt: string;
  institution: {
    id: string;
    code: string;
    name: string;
    type: string;
    currency: string;
    primaryColor: string;
    createdAt: string;
  };
  users: Array<{
    id: string;
    institutionId: string;
    email: string;
    name: string;
    role: string;
    passwordHash: string | null;
    provider: string;
    createdAt: string;
  }>;
  classes: Array<{
    id: string;
    institutionId: string;
    name: string;
    grade: string;
  }>;
  sections: Array<{
    id: string;
    institutionId: string;
    classId: string;
    name: string;
    capacity: number;
  }>;
};

let restored = false;
let restorePromise: Promise<void> | null = null;

function blobIsConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}

function iso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function readWorkspace(pathname: string): Promise<PersistedWorkspace | null> {
  try {
    const result = await get(pathname, { access: 'private' });
    if (result?.statusCode !== 200) return null;
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as PersistedWorkspace;
    return parsed?.version === 1 && parsed.institution?.id ? parsed : null;
  } catch {
    return null;
  }
}

async function upsertWorkspace(workspace: PersistedWorkspace) {
  const institution = workspace.institution;

  await db.institution.upsert({
    where: { id: institution.id },
    update: {
      code: institution.code,
      name: institution.name,
      type: institution.type,
      currency: institution.currency,
      primaryColor: institution.primaryColor,
    },
    create: {
      id: institution.id,
      code: institution.code,
      name: institution.name,
      type: institution.type,
      currency: institution.currency,
      primaryColor: institution.primaryColor,
      createdAt: new Date(institution.createdAt),
    },
  });

  for (const user of workspace.users) {
    await db.user.upsert({
      where: { id: user.id },
      update: {
        institutionId: user.institutionId,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        provider: user.provider,
      },
      create: {
        id: user.id,
        institutionId: user.institutionId,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        provider: user.provider,
        createdAt: new Date(user.createdAt),
      },
    });
  }

  for (const klass of workspace.classes) {
    await db.schoolClass.upsert({
      where: { id: klass.id },
      update: {
        institutionId: klass.institutionId,
        name: klass.name,
        grade: klass.grade,
      },
      create: klass,
    });
  }

  for (const section of workspace.sections) {
    await db.section.upsert({
      where: { id: section.id },
      update: {
        institutionId: section.institutionId,
        classId: section.classId,
        name: section.name,
        capacity: section.capacity,
      },
      create: section,
    });
  }
}

async function restoreAll() {
  const latestByInstitution = new Map<string, PersistedWorkspace>();
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const workspace = await readWorkspace(blob.pathname);
      if (!workspace) continue;

      const existing = latestByInstitution.get(workspace.institution.id);
      if (!existing || workspace.updatedAt > existing.updatedAt) {
        latestByInstitution.set(workspace.institution.id, workspace);
      }
    }
    cursor = page.cursor;
  } while (cursor);

  for (const workspace of latestByInstitution.values()) {
    await upsertWorkspace(workspace);
  }
}

export async function restorePersistedAuth(options: { force?: boolean } = {}) {
  if (!blobIsConfigured()) return;
  if (restored && !options.force) return;

  restorePromise ??= restoreAll()
    .then(() => {
      restored = true;
    })
    .catch((error) => {
      console.error('Persistent auth restore failed:', error);
    })
    .finally(() => {
      restorePromise = null;
    });

  await restorePromise;
}

export async function persistWorkspaceByInstitutionId(institutionId: string) {
  if (!blobIsConfigured()) return;

  const institution = await db.institution.findUnique({
    where: { id: institutionId },
    include: {
      users: true,
      classes: true,
      sections: true,
    },
  });
  if (!institution) return;

  const workspace: PersistedWorkspace = {
    version: 1,
    updatedAt: new Date().toISOString(),
    institution: {
      id: institution.id,
      code: institution.code,
      name: institution.name,
      type: institution.type,
      currency: institution.currency,
      primaryColor: institution.primaryColor,
      createdAt: iso(institution.createdAt),
    },
    users: institution.users.map((user) => ({
      id: user.id,
      institutionId: user.institutionId,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordHash: user.passwordHash,
      provider: user.provider,
      createdAt: iso(user.createdAt),
    })),
    classes: institution.classes.map((klass) => ({
      id: klass.id,
      institutionId: klass.institutionId,
      name: klass.name,
      grade: klass.grade,
    })),
    sections: institution.sections.map((section) => ({
      id: section.id,
      institutionId: section.institutionId,
      classId: section.classId,
      name: section.name,
      capacity: section.capacity,
    })),
  };

  await put(`${PREFIX}${institution.id}/${Date.now()}-${randomUUID()}.json`, JSON.stringify(workspace), {
    access: 'private',
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  });
}
