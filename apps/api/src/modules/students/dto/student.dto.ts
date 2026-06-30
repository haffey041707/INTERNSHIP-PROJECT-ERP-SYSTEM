import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum StudentStatusDto { ACTIVE = 'ACTIVE', GRADUATED = 'GRADUATED', TRANSFERRED = 'TRANSFERRED', WITHDRAWN = 'WITHDRAWN' }

export class CreateStudentDto {
  @ApiProperty() @IsString() admissionNo!: string;
  @ApiProperty() @IsString() @MinLength(1) firstName!: string;
  @ApiProperty() @IsString() @MinLength(1) lastName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rollNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ enum: StudentStatusDto })
  @IsOptional() @IsEnum(StudentStatusDto) status?: StudentStatusDto;
}

export class QueryStudentsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() cursor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
}
