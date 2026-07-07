// Keeps the working SQLite database clean. Run: node prisma/seed.mjs (from apps/web)
// Create the first institution from the signup screen.
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function wipe() {
  await db.passwordReset.deleteMany();
  await db.mark.deleteMany();
  await db.exam.deleteMany();
  await db.payment.deleteMany();
  await db.feeInvoice.deleteMany();
  await db.attendanceRecord.deleteMany();
  await db.timetableSlot.deleteMany();
  await db.announcement.deleteMany();
  await db.student.deleteMany();
  await db.section.deleteMany();
  await db.schoolClass.deleteMany();
  await db.teacher.deleteMany();
  await db.user.deleteMany();
  await db.institution.deleteMany();
}

async function main() {
  await wipe();
  console.log('Database cleaned. Create your institution from the signup screen.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(() => db.$disconnect());
