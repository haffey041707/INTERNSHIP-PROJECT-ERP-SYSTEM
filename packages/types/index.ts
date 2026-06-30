/**
 * Shared contracts between API and Web (and the OpenAPI-generated mobile client).
 * Keeping these in one package prevents drift between backend and frontend.
 */

export type Role =
  | 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
  | 'ACCOUNTANT' | 'LIBRARIAN' | 'HR' | 'TRANSPORT_MANAGER' | 'HOSTEL_MANAGER';

export type StudentStatus = 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'WITHDRAWN';

export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}
export interface Paginated<T> {
  data: T[];
  pageInfo: PageInfo;
}

/** RFC 9457 Problem Details — the standard error shape (docs/04 §4.1). */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  code?: string;
  traceId?: string;
  errors?: { field: string; message: string }[];
}

export interface AuthPrincipal {
  userId: string;
  institutionCode: string;
  roles: Role[];
  permissions: string[];
}
