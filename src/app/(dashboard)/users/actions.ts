'use server';

import { revalidatePath } from 'next/cache';
import { writeAuditLog } from '@/lib/audit';
import { requirePermission } from '@/lib/auth/permissions';
import { revokeAllUserSessions } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/security/password';

export async function upsertUser(formData: FormData, userId?: string) {
  try {
    const actor = await requirePermission('system.manage');

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const roleIds = JSON.parse(formData.get('roleIds') as string) as string[];

    if (userId) {
      // Update existing user
      const oldUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: true },
      });

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { fullName, email },
        });

        // Update roles
        await tx.userRole.deleteMany({ where: { userId } });
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId,
            roleId,
            assignedByUserId: actor.id,
          })),
        });
      });

      await writeAuditLog({
        actorUserId: actor.id,
        action: 'UPDATE',
        tableName: 'User',
        recordId: userId,
        oldValue: oldUser,
        newValue: { fullName, email, roleIds },
      });

      // Revoke sessions if roles changed (security measure)
      const oldRoleIds = oldUser?.roles
        .map((r) => r.roleId)
        .sort()
        .join(',');
      const newRoleIds = roleIds.toSorted((a, b) => a.localeCompare(b)).join(',');
      if (oldRoleIds !== newRoleIds) {
        await revokeAllUserSessions(userId, 'ROLE_CHANGED');
      }
    } else {
      // Create new user
      const passwordHash = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          roles: {
            create: roleIds.map((roleId) => ({
              roleId,
              assignedByUserId: actor.id,
            })),
          },
        },
      });

      await writeAuditLog({
        actorUserId: actor.id,
        action: 'CREATE',
        tableName: 'User',
        recordId: newUser.id,
        newValue: { fullName, email, roleIds },
      });
    }

    revalidatePath('/users');
    return { success: true };
  } catch (error: any) {
    console.error('Error upserting user:', error);
    return { success: false, message: error.message };
  }
}

export async function resetUserPassword(userId: string) {
  try {
    const actor = await requirePermission('system.manage');
    const defaultPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    const passwordHash = await hashPassword(defaultPassword || '');

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      action: 'UPDATE',
      tableName: 'User',
      recordId: userId,
      note: 'Password reset to default',
    });

    await revokeAllUserSessions(userId, 'PASSWORD_CHANGED');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function toggleUserStatus(userId: string) {
  try {
    const actor = await requirePermission('system.manage');
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('User not found');

    const newStatus = user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      action: 'UPDATE',
      tableName: 'User',
      recordId: userId,
      note: `Status changed to ${newStatus}`,
    });

    if (newStatus === 'DEACTIVATED') {
      await revokeAllUserSessions(userId, 'ACCOUNT_DEACTIVATED');
    }

    revalidatePath('/users');
    return { success: true, status: newStatus };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function approveUser(userId: string, roleIds: string[]) {
  try {
    const actor = await requirePermission('system.manage');

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          approvedByUserId: actor.id,
        },
      });

      // Assign initial roles
      await tx.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId,
          roleId,
          assignedByUserId: actor.id,
        })),
      });
    });

    await writeAuditLog({
      actorUserId: actor.id,
      action: 'UPDATE',
      tableName: 'User',
      recordId: userId,
      note: 'Account approved and roles assigned',
    });

    revalidatePath('/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
