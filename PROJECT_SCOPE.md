# School Management System (SMS) - Project Scope & Architecture Manual

This document serves as the comprehensive manual for the School Management System (SMS) built on Next.js 16 (App Router with Turbopack), React 19, Prisma ORM, and PostgreSQL. It outlines the core architecture, data schemas, security structures, and functional modules.

---

## 1. System Architecture & Tech Stack

The system is designed with a modern, type-safe stack:

- **Frontend**: Next.js 16 (App Router), React 19, styling via Tailwind CSS 4, and dynamic visual interactions using Framer Motion and Lucide Icons.
- **Database Layer**: PostgreSQL database mapped via Prisma ORM (`prisma-client`). Client files are generated in `src/lib/generated/prisma`.
- **Authentication & Security**: Custom stateful session store in PostgreSQL with SHA-256 session token hashing, CSRF token validation, and double-submit cookie checks.
- **Business Logic**: Next.js Server Actions for secure mutative operations and client-side page state rendering using React Hooks.
- **Document Generation**: Dynamic PDF receipts and payroll slips compiled in the browser via `@react-pdf/renderer`.

---

## 2. Authentication & Role-Based Access Control (RBAC)

### Session & Token Validation

Authentication is managed in `src/lib/auth/session.ts` and `src/lib/auth/authenticate.ts`:

1.  **Session Generation**: Upon successful login (verified using Argon2 password hashing), `createSession` creates a 32-byte secure cryptographically random token, hashes it using SHA-256, and stores it in the `Session` database table. The plain token is returned to the user inside a secure HTTP-Only cookie.
2.  **Remember Me**: The default session is valid for 24 hours. If "Remember me" is checked, the session lifespan is extended to 30 days.
3.  **Token Validation**: Incoming requests extract the token cookie, re-hash it using SHA-256, and match it against the database. It validates that the session is not expired, not revoked, and that the owner's status is `ACTIVE`.
4.  **CSRF Protection**: Stateful CSRF protection is implemented in `src/lib/auth/csrf.ts`. It generates a unique cryptographic secret for active sessions and validates double-submit headers to block cross-site requests.
5.  **Revocation Workflow**: `revokeAllUserSessions` revokes user sessions when passwords change, accounts are deactivated, when a new session is created (for same account/user) on another device or browser i.e only one session is allowed at a time, or permissions are modified.

### Role & Permission Mapping

Authorization is built on a strict Roles & Permissions system:

- **Models**: `Role`, `Permission`, `RolePermission`, and `UserRole`.
- **Dynamic Access Resolution**: In `src/lib/auth/permissions.ts`, helper `hasPermission(userId, requiredPermission)` checks the user's role hierarchy.
- **Security Gates**: Controller files and API endpoints wrap operations in `requirePermission(permissionName)` or `requireAuth()`.

---

## 3. Academic Structure

The academic hierarchy configures the scheduling, enrollment, and grouping rules for classrooms:

- **Academic Year**: Configured in `AcademicYear` model. Tracks `startDate`, `endDate`, and an `isActive` boolean. Only one academic year is set active at any time, determining the current billing, attendance, and enrollment context.
- **Classes**: Managed by `Class` (e.g., Grade 1, Grade 2). Tracks unique classroom categories.
- **Sections**: Managed by `Section` (e.g., Section A, Section B). Sub-groups within a class to manage capacities. It holds a foreign key relationship to `Staff` (as the designated Class Teacher) and enforces a capacity limit (default is 30).
- **Class Teacher Assignment**: Maps teachers dynamically across academic years using `ClassTeacherAssignment`.

---

## 4. Student Management Lifecycle

- **Student Registry**: Student profiles are created via the Student Registry panel. Details include personal metadata, date of birth, blood group, admission number, and documents.
- **Student Enrollment**: Tracked via `StudentEnrollment` which binds a `Student` to a specific `AcademicYear`, `Class`, and `Section` with their unique `rollNumber`.
- **Guardians**: Mapped via a join model `StudentGuardian` to the `Guardian` entity. Defines relationship types (FATHER, MOTHER, GUARDIAN) and marks contacts for primary emergency dispatch.
- **Sibling Groups**: `SiblingGroup` and `StudentSibling` link siblings together. This lets the system apply sibling tuition discounts or manage household billing adjustments in the Finance module.
- **Student Documents**: Supports attachments like birth certificates and physical examination sheets through `StudentDocument`, uploaded via a custom secure file upload middleware.

---

## 5. Staff & Leave Management

- **Staff Registry**: Employee profiling includes designation, department, qualification, CNIC (national identity), personal phones, emergency contacts, and joining date.
- **Workforce Documents**: Binds documents (contracts, CVs, degrees) using `StaffDocument`.
- **Leave Types**: System leave rules (e.g., Sick Leave, Casual Leave) are created as `LeaveType`.
- **Leave Balances**: Tracks the allocated days per staff member per academic year in `LeaveBalance`.
- **Leave Approval Flow**:
  1.  Employees submit a `LeaveRequest` (with start date, end date, and reason). Status defaults to `PENDING`.
  2.  An administrator with approval permissions evaluates the request.
  3.  If approved, the system updates the status to `APPROVED` and adds the request duration to the employee's `usedDays` in `LeaveBalance`.
  4.  Administrators can also reject (`REJECTED`) or employees can cancel (`CANCELLED`) requests.

---

## 6. Attendance Tracking System

The attendance system tracks daily roll calls for both students and staff:

- **Student Attendance**:
  - **Sessions**: Student attendance is tracked by sessions (e.g., Morning, Afternoon) using the `AttendanceSession` model.
  - **Registry**: The teacher selects their class/section and logs `StudentAttendance` records (status: PRESENT, ABSENT, LATE, EXCUSED).
  - **Correction & Audit Trail**: To prevent tampering, modified attendance logs require a `correctionReason`, logging the timestamp and the administrator's ID (`correctedByUserId`).
- **Staff Attendance**:
  - Logs daily attendance for employees under `StaffAttendance` (status: PRESENT, ABSENT, ON_LEAVE, HALF_DAY).
  - Integrates with the Leave module to automatically mark status as `ON_LEAVE` if a staff member's leave request is active for that day.

---

## 7. Financial Billing & Payments (Fees)

- **Fee Structures**: Dynamically defined in `FeeStructure` and mapped to a specific `Class` and `AcademicYear`.
- **Fee Components**: A fee structure has multiple components (e.g., Tuition Fee, Library Fee, Exam Fee) managed in `FeeComponent`. Each component tracks its billing frequency (MONTHLY, SEMESTER, YEARLY, ONE_TIME) and standard amount.
- **Fee Records**: `FeeRecord` represents the active ledger for a student. It calculates the base fee from the class's structure, applies discounts or waivers, and tracks `outstandingAmount` alongside a `FeeRecordStatus` (OPEN, PARTIALLY_PAID, PAID, OVERDUE).
- **Payments & Receipts**:
  1.  When payment is received, `FeePayment` records the `amountPaid`, method (CASH, BANK_TRANSFER, CHEQUE, ONLINE), reference number, and receiving administrator.
  2.  `outstandingAmount` is decremented in `FeeRecord`.
  3.  A unique autoincremented receipt entry is created in the `FeeReceipt` ledger for audit logs.
  4.  An interactive PDF invoice receipt is generated dynamically for parents in the browser.

---

## 8. Payroll & Employee Compensation

- **Salary Structure**: Configures payroll rules per employee inside the `SalaryStructure` model. Binds base salary amounts and effective dates.
- **Salary Components**: Allocates recurring adjustments (allowances like medical, or deductions like tax and provident fund) inside `SalaryComponent`.
- **Salary Slips**: Generated monthly in `SalarySlip`. The slip queries the structure, adds allowances, subtracts deductions, and computes the `grossPay`, `totalDeductions`, and `netPay`.
- **Disbursements**: Tracks salary payments in `SalaryDisbursement` (amount paid, disbursement date, method, transaction reference, and paying administrator).

---

## 9. Security Logs, Auditing & Administration

- **System Settings**: Holds configuration data (`SystemSettings`) including school name, contact email, logo URL, session listings, and SMTP email settings. The SMTP app password is encrypted at rest using AES-256-GCM.
- **Global Announcements**: Announcements are published via `Announcement` with active flags and expiration dates.
- **Password Reset Approval Flow**:
  - Users requesting a password reset generate a `PasswordResetRequest` with their proposed new password hash.
  - The request remains in a `PENDING_APPROVAL` state.
  - An administrator must explicitly approve (`APPROVED`) or reject (`REJECTED`) the request inside the administrator panel before the user's password hash in the `User` table is updated.
- **Audit Logging Engine**:
  - Implemented via `src/lib/audit.ts` utilizing the `AuditLog` database model.
  - Whenever a mutative operation occurs, the application calls `writeAuditLog` to log the table name, action (CREATE, UPDATE, DELETE, ERROR), record ID, the actor's user ID, client IP address, user-agent details, and JSON snapshots of the `oldValue` and `newValue`.
  - Allows auditing data histories and tracing who updated database records.
