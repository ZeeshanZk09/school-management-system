import prisma from "@/lib/prisma";

export const ROLE_NAMES = {
  ADMIN: "ADMIN",
  ACCOUNTANT: "ACCOUNTANT",
  TEACHER: "TEACHER",
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

export async function userHasRole(
  userId: string,
  roleName: string,
): Promise<boolean> {
  const count = await prisma.userRole.count({
    where: {
      userId,
      role: { name: roleName },
    },
  });

  return count > 0;
}

export async function userHasAnyRole(
  userId: string,
  roleNames: readonly string[],
): Promise<boolean> {
  const count = await prisma.userRole.count({
    where: {
      userId,
      role: { name: { in: [...roleNames] } },
    },
  });

  return count > 0;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    select: {
      role: {
        select: { name: true },
      },
    },
  });

  return roles.map((r) => r.role.name);
}

export async function assignRoleToUser(
  userId: string,
  roleName: string,
  assignedById?: string,
): Promise<void> {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    select: { id: true },
  });

  if (!role) {
    throw new Error(`Role "${roleName}" does not exist`);
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    create: {
      userId,
      roleId: role.id,
      assignedById,
    },
    update: {
      assignedById,
    },
  });
}

export async function removeRoleFromUser(
  userId: string,
  roleName: string,
): Promise<void> {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    select: { id: true },
  });

  if (!role) {
    return;
  }

  await prisma.userRole.deleteMany({
    where: { userId, roleId: role.id },
  });
}
