import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, QueryStudentsDto } from './dto/student.dto';
import { Permissions, PERMISSIONS } from '../../core/rbac/permissions';

@ApiTags('students')
@ApiBearerAuth()
@Controller({ path: 'students', version: '1' })
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  @Permissions(PERMISSIONS.STUDENTS_READ)
  list(@Query() q: QueryStudentsDto) {
    return this.students.list(q);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.STUDENTS_READ)
  get(@Param('id') id: string) {
    return this.students.get(id);
  }

  @Post()
  @Permissions(PERMISSIONS.STUDENTS_CREATE)
  create(@Body() dto: CreateStudentDto) {
    return this.students.create(dto);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.STUDENTS_UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.students.update(id, dto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.STUDENTS_DELETE)
  remove(@Param('id') id: string) {
    return this.students.remove(id);
  }
}
