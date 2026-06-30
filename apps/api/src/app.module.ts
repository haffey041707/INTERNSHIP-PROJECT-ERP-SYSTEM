import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { StudentsModule } from './modules/students/students.module';

/**
 * Root module. CoreModule provides all cross-cutting concerns (tenancy, auth, rbac,
 * audit, prisma). Feature modules are added here as they are built — each follows the
 * identical 6-file shape (see docs/05 + docs/15).
 */
@Module({
  imports: [
    CoreModule,
    StudentsModule,
    // AcademicsModule, AttendanceModule, ExamsModule, FinanceModule, LmsModule,
    // HrModule, LibraryModule, TransportModule, HostelModule, CommunicationModule,
    // ReportingModule, AiModule, PlatformModule (super-admin) ...
  ],
})
export class AppModule {}
