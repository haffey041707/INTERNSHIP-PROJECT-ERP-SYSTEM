import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto, QueryStudentsDto } from './dto/student.dto';

/**
 * Sample feature service. Note: it NEVER references tenantId — the tenant-scoped
 * Prisma client (PrismaService.tenant) injects and enforces it automatically
 * (LAYER 2), with Postgres RLS as the backstop (LAYER 3). This is the pattern every
 * feature module follows (see docs/15 §15.4).
 */
@Injectable()
export class StudentsService {
  private readonly PAGE = 50;

  constructor(private readonly prisma: PrismaService) {}

  async list(q: QueryStudentsDto) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (q.sectionId) where.sectionId = q.sectionId;
    if (q.search) {
      where.OR = [
        { firstName: { contains: q.search, mode: 'insensitive' } },
        { lastName: { contains: q.search, mode: 'insensitive' } },
        { admissionNo: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    const rows = await this.prisma.tenant.student.findMany({
      where,
      take: this.PAGE + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { section: { select: { id: true, name: true } } },
    });
    const hasNextPage = rows.length > this.PAGE;
    const data = hasNextPage ? rows.slice(0, this.PAGE) : rows;
    return { data, pageInfo: { endCursor: data.at(-1)?.id ?? null, hasNextPage } };
  }

  async get(id: string) {
    const student = await this.prisma.tenant.student.findFirst({
      where: { id, deletedAt: null },
      include: { section: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  create(dto: CreateStudentDto) {
    return this.prisma.tenant.student.create({ data: { ...dto } });
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.get(id);
    return this.prisma.tenant.student.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.tenant.student.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
