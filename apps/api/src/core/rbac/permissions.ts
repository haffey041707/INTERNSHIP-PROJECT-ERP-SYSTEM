import { SetMetadata } from '@nestjs/common';

/**
 * Global permission catalog (subset). Permissions are granular keys grouped by module.
 * Roles are composed of these; ABAC scope (campus/department/ownership) refines them.
 */
export const PERMISSIONS = {
  // students
  STUDENTS_READ: 'students:read',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  // finance
  FINANCE_INVOICE_READ: 'finance:invoice:read',
  FINANCE_INVOICE_CREATE: 'finance:invoice:create',
  FINANCE_INVOICE_APPROVE: 'finance:invoice:approve',
  // attendance
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_CREATE: 'attendance:create',
  // platform (super-admin)
  PLATFORM_TENANTS_MANAGE: 'platform:tenants:manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Default role → permission mapping used by the seed. */
export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  INSTITUTION_ADMIN: [
    PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_UPDATE, PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.FINANCE_INVOICE_READ, PERMISSIONS.FINANCE_INVOICE_CREATE, PERMISSIONS.FINANCE_INVOICE_APPROVE,
    PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_CREATE,
  ],
  TEACHER: [PERMISSIONS.STUDENTS_READ, PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_CREATE],
  ACCOUNTANT: [PERMISSIONS.FINANCE_INVOICE_READ, PERMISSIONS.FINANCE_INVOICE_CREATE],
  STUDENT: [PERMISSIONS.STUDENTS_READ],
  PARENT: [PERMISSIONS.STUDENTS_READ, PERMISSIONS.FINANCE_INVOICE_READ],
};

export const PERMISSIONS_KEY = 'required_permissions';

/** @Permissions('students:create') — declares the permissions a handler requires. */
export const Permissions = (...perms: PermissionKey[]) => SetMetadata(PERMISSIONS_KEY, perms);
