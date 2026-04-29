import 'dotenv/config';

import { randomBytes } from 'node:crypto';

import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/lib/security/password';

const ROLE_DEFINITIONS = [
  { name: 'ADMIN', description: 'Full system access' },
  { name: 'ACCOUNTANT', description: 'Finance-only access' },
  {
    name: 'TEACHER',
    description: 'Attendance and contacts access for assigned classes',
  },
] as const;

const PERMISSION_DEFINITIONS = [
  { name: 'dashboard.view', description: 'Access dashboard pages' },
  { name: 'students.read', description: 'Read student records' },
  { name: 'students.manage', description: 'Manage student records' },
  { name: 'staff.read', description: 'Read staff records' },
  { name: 'staff.manage', description: 'Manage staff records' },
  { name: 'classes.read', description: 'Read classes and sections' },
  { name: 'classes.manage', description: 'Manage classes and sections' },
  { name: 'attendance.read', description: 'Read attendance data' },
  { name: 'attendance.manage', description: 'Manage attendance data' },
  { name: 'contacts.read', description: 'Read contacts data' },
  { name: 'contacts.manage', description: 'Manage contacts data' },
  { name: 'finance.read', description: 'Read finance data' },
  { name: 'finance.manage', description: 'Manage finance data' },
  { name: 'reports.read', description: 'View system reports' },
  { name: 'settings.read', description: 'View system settings' },
  { name: 'settings.manage', description: 'Manage system settings' },
  { name: 'announcements.manage', description: 'Manage announcements' },
  { name: 'audit.read', description: 'Read audit logs' },
  { name: 'users.read', description: 'Read user accounts' },
  { name: 'users.manage', description: 'Manage user accounts' },
] as const;

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  ADMIN: PERMISSION_DEFINITIONS.map((p) => p.name),
  ACCOUNTANT: ['dashboard.view', 'finance.read', 'finance.manage', 'reports.read', 'students.read'],
  TEACHER: [
    'dashboard.view',
    'attendance.read',
    'attendance.manage',
    'contacts.read',
    'students.read',
    'classes.read',
  ],
};

const SYMBOLS = '!@#$%_-';

function envValue(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function randomChar(charset: string): string {
  const randomIndex = randomBytes(1)[0] % charset.length;
  return charset[randomIndex] ?? 'A';
}

function generateStrongPassword(length = 16): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const charset = `${upper}${lower}${digits}${SYMBOLS}`;

  const base = [randomChar(upper), randomChar(lower), randomChar(digits), randomChar(SYMBOLS)];

  while (base.length < length) {
    base.push(randomChar(charset));
  }

  for (let i = base.length - 1; i > 0; i -= 1) {
    const swapIndex = randomBytes(1)[0] % (i + 1);
    [base[i], base[swapIndex]] = [base[swapIndex], base[i]];
  }

  return base.join('');
}

async function seedRolesAndPermissions(): Promise<void> {
  console.info('[seed] Seeding roles and permissions...');

  for (const role of ROLE_DEFINITIONS) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: {
        name: role.name,
        description: role.description,
      },
      update: {
        description: role.description,
      },
    });
  }

  for (const permission of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      create: {
        name: permission.name,
        description: permission.description,
      },
      update: {
        description: permission.description,
      },
    });
  }

  const roles = await prisma.role.findMany({
    select: { id: true, name: true },
  });
  const permissions = await prisma.permission.findMany({
    select: { id: true, name: true },
  });

  const roleIdByName = new Map(roles.map((r) => [r.name, r.id]));
  const permissionIdByName = new Map(permissions.map((p) => [p.name, p.id]));

  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSION_MAP)) {
    const roleId = roleIdByName.get(roleName);
    if (!roleId) continue;

    const targetPermissionIds = permissionNames
      .map((name) => permissionIdByName.get(name))
      .filter((id): id is string => Boolean(id));

    // Remove permissions no longer in the map
    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { notIn: targetPermissionIds },
      },
    });

    // Upsert each permission
    for (const permissionId of targetPermissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId },
        },
        create: { roleId, permissionId },
        update: { assignedAt: new Date() },
      });
    }
  }

  console.info('[seed] Roles and permissions seeded.');
}

async function bootstrapAdminUser(): Promise<void> {
  console.info('[seed] Bootstrapping admin user...');

  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
    select: { id: true },
  });

  if (!adminRole) {
    throw new Error('ADMIN role missing after seed.');
  }

  const rawEmail = process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'mzeeshankhan0988@gmail.com';
  const bootstrapEmail = rawEmail.trim().toLowerCase();
  const bootstrapName = process.env.BOOTSTRAP_ADMIN_NAME?.trim() ?? 'System Admin';

  let bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? '';

  if (!bootstrapPassword) {
    bootstrapPassword = generateStrongPassword();
  }

  let user = await prisma.user.findUnique({
    where: { email: bootstrapEmail },
    select: { id: true, status: true },
  });

  if (!user) {
    const passwordHash = await hashPassword(bootstrapPassword);

    user = await prisma.user.create({
      data: {
        fullName: bootstrapName,
        email: bootstrapEmail,
        passwordHash,
        status: 'ACTIVE',
      },
      select: { id: true, status: true },
    });
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('Bootstrap admin user must be ACTIVE.');
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
    update: {
      assignedAt: new Date(),
    },
  });

  if (!process.env.BOOTSTRAP_ADMIN_PASSWORD) {
    console.info('');
    console.info('╔══════════════════════════════════════════╗');
    console.info('║   Generated Admin Credentials            ║');
    console.info('╠══════════════════════════════════════════╣');
    console.info(`║  Email:    ${bootstrapEmail.padEnd(29)}║`);
    console.info(`║  Password: ${bootstrapPassword.padEnd(29)}║`);
    console.info('╚══════════════════════════════════════════╝');
    console.info('');
  } else {
    console.info(`[seed] Admin assigned to ${bootstrapEmail}`);
  }
}

async function seedSystemSettings(): Promise<void> {
  const existing = await prisma.systemSettings.findFirst({
    select: { id: true },
  });

  if (existing) {
    console.info('[seed] System settings already exist, skipping.');
    return;
  }

  await prisma.systemSettings.create({
    data: {
      schoolName: envValue('SCHOOL_NAME') ?? 'School Name',
      schoolLogoUrl: envValue('SCHOOL_LOGO_URL'),
      addressLine1: envValue('SCHOOL_ADDRESS_LINE1') ?? 'School Address',
      addressLine2: envValue('SCHOOL_ADDRESS_LINE2'),
      city: envValue('SCHOOL_CITY'),
      state: envValue('SCHOOL_STATE'),
      country: envValue('SCHOOL_COUNTRY'),
      postalCode: envValue('SCHOOL_POSTAL_CODE'),
      contactEmail: envValue('SCHOOL_CONTACT_EMAIL'),
      contactPhone: envValue('SCHOOL_CONTACT_PHONE'),
    },
  });

  console.info('[seed] Default system settings created.');
}

async function seedAcademicYear(): Promise<void> {
  const activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
    select: { id: true },
  });

  if (activeYear) {
    console.info('[seed] Active academic year already exists, skipping.');
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const startDate = new Date(Date.UTC(year, 3, 1)); // April 1
  const endDate = new Date(Date.UTC(year + 1, 2, 31, 23, 59, 59)); // March 31

  await prisma.academicYear.create({
    data: {
      name: `${year}-${year + 1}`,
      startDate,
      endDate,
      isActive: true,
    },
  });

  console.info(`[seed] Created academic year ${year}-${year + 1}`);
}

async function seedClasses(): Promise<void> {
  const existingClass = await prisma.class.findFirst({ select: { id: true } });

  if (existingClass) {
    console.info('[seed] Classes already exist, skipping.');
    return;
  }

  const classNames = [
    { name: 'Class 1', code: 'C1' },
    { name: 'Class 2', code: 'C2' },
    { name: 'Class 3', code: 'C3' },
    { name: 'Class 4', code: 'C4' },
    { name: 'Class 5', code: 'C5' },
  ];

  for (const cls of classNames) {
    await prisma.class.create({
      data: {
        name: cls.name,
        code: cls.code,
        sections: {
          create: [{ name: 'A' }, { name: 'B' }],
        },
      },
    });
  }

  console.info(`[seed] Created ${classNames.length} classes with sections.`);
}

async function seedAttendanceSessions(): Promise<void> {
  const existing = await prisma.attendanceSession.findFirst({
    select: { id: true },
  });

  if (existing) {
    console.info('[seed] Attendance sessions already exist, skipping.');
    return;
  }

  await prisma.attendanceSession.createMany({
    data: [
      { name: 'Morning', sortOrder: 1, startTime: '08:00', endTime: '12:00' },
      { name: 'Afternoon', sortOrder: 2, startTime: '13:00', endTime: '16:00' },
    ],
  });

  console.info('[seed] Created default attendance sessions.');
}

async function seedLeaveTypes(): Promise<void> {
  const existing = await prisma.leaveType.findFirst({ select: { id: true } });

  if (existing) {
    console.info('[seed] Leave types already exist, skipping.');
    return;
  }

  await prisma.leaveType.createMany({
    data: [
      { name: 'Sick', description: 'Sick leave' },
      { name: 'Casual', description: 'Casual leave' },
      { name: 'Annual', description: 'Annual leave' },
    ],
  });

  console.info('[seed] Created default leave types.');
}

async function cleanupDatabase(): Promise<void> {
  console.info('[seed] Cleaning up existing records...');

  // Relation and dependent tables first
  await prisma.announcement.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.feeRecordItem.deleteMany();
  await prisma.feeRecord.deleteMany();
  await prisma.studentAttendance.deleteMany();
  await prisma.staffAttendance.deleteMany();
  await prisma.salaryDisbursement.deleteMany();
  await prisma.salarySlip.deleteMany();
  await prisma.salaryComponent.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();

  // Entity tables
  await prisma.staff.deleteMany();
  await prisma.studentEnrollment.deleteMany();
  await prisma.studentGuardian.deleteMany();
  await prisma.student.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  // Configuration tables
  await prisma.systemSettings.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.class.deleteMany(); // Cascades to Section
  await prisma.attendanceSession.deleteMany();
  await prisma.leaveType.deleteMany();

  console.info('[seed] Cleanup completed.');
}

async function seedExtraUsers(): Promise<void> {
  console.info('[seed] Seeding extra users (Teacher, Accountant)...');

  const roles = await prisma.role.findMany();
  const teacherRole = roles.find((r) => r.name === 'TEACHER');
  const accountantRole = roles.find((r) => r.name === 'ACCOUNTANT');

  if (!teacherRole || !accountantRole) {
    throw new Error('Roles missing for extra users.');
  }

  const users = [
    {
      fullName: 'John Teacher',
      email: 'teacher@school.local',
      password: 'Password123!',
      roleId: teacherRole.id,
      staff: {
        designation: 'Senior Teacher',
        department: 'Academic',
        staffNumber: 'ST-001',
      },
    },
    {
      fullName: 'Jane Accountant',
      email: 'accountant@school.local',
      password: 'Password123!',
      roleId: accountantRole.id,
      staff: {
        designation: 'Finance Head',
        department: 'Finance',
        staffNumber: 'ST-002',
      },
    },
  ];

  for (const u of users) {
    const passwordHash = await hashPassword(u.password);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        passwordHash,
      },
      create: {
        fullName: u.fullName,
        email: u.email,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: user.id, roleId: u.roleId },
      },
      create: { userId: user.id, roleId: u.roleId },
      update: { assignedAt: new Date() },
    });

    if (u.staff) {
      await prisma.staff.upsert({
        where: { userId: user.id },
        update: {
          fullName: u.fullName,
          designation: u.staff.designation,
          department: u.staff.department,
          staffNumber: u.staff.staffNumber,
        },
        create: {
          userId: user.id,
          fullName: u.fullName,
          designation: u.staff.designation,
          department: u.staff.department,
          staffNumber: u.staff.staffNumber,
          joiningDate: new Date(),
          employmentType: 'PERMANENT',
        },
      });
    }
  }

  console.info('[seed] Extra users seeded.');
}

async function seedStudents(): Promise<void> {
  console.info('[seed] Seeding students...');

  const academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
  });
  const classes = await prisma.class.findMany({
    include: { sections: true },
  });

  if (!academicYear || classes.length === 0) {
    throw new Error('Academic year or classes missing for student seed.');
  }

  const studentData = [
    {
      fullName: 'Alice Smith',
      admissionNumber: 'ADM-001',
      rollNumber: '101',
      className: 'Class 1',
      sectionName: 'A',
      guardian: {
        fullName: 'Robert Smith',
        primaryPhone: '1234567890',
        relationship: 'FATHER' as const,
      },
    },
    {
      fullName: 'Bob Johnson',
      admissionNumber: 'ADM-002',
      rollNumber: '102',
      className: 'Class 1',
      sectionName: 'A',
      guardian: {
        fullName: 'Mary Johnson',
        primaryPhone: '9876543210',
        relationship: 'MOTHER' as const,
      },
    },
    {
      fullName: 'Charlie Brown',
      admissionNumber: 'ADM-003',
      rollNumber: '101',
      className: 'Class 2',
      sectionName: 'B',
      guardian: {
        fullName: 'Sally Brown',
        primaryPhone: '5551234567',
        relationship: 'MOTHER' as const,
      },
    },
  ];

  for (const s of studentData) {
    const cls = classes.find((c) => c.name === s.className);
    const section = cls?.sections.find((sec) => sec.name === s.sectionName);

    if (!cls || !section) continue;

    const student = await prisma.student.create({
      data: {
        fullName: s.fullName,
        admissionNumber: s.admissionNumber,
        admissionDate: new Date(),
        status: 'ACTIVE',
      },
    });

    const guardian = await prisma.guardian.create({
      data: {
        fullName: s.guardian.fullName,
        primaryPhone: s.guardian.primaryPhone,
      },
    });

    await prisma.studentGuardian.create({
      data: {
        studentId: student.id,
        guardianId: guardian.id,
        relationship: s.guardian.relationship,
        isPrimaryEmergency: true,
      },
    });

    await prisma.studentEnrollment.create({
      data: {
        studentId: student.id,
        academicYearId: academicYear.id,
        classId: cls.id,
        sectionId: section.id,
        rollNumber: s.rollNumber,
      },
    });
  }

  console.info('[seed] Students seeded.');
}

async function main(): Promise<void> {
  console.info('[seed] Starting database seed...');
  console.info('');

  await cleanupDatabase();

  await seedRolesAndPermissions();
  await bootstrapAdminUser();
  await seedExtraUsers();
  await seedSystemSettings();
  await seedAcademicYear();
  await seedClasses();
  await seedStudents();
  await seedAttendanceSessions();
  await seedLeaveTypes();

  console.info('');
  console.info('[seed] Database seed completed successfully.');
}


main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('[seed] Failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
