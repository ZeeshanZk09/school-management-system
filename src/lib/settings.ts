import { cache } from 'react';

import prisma from '@/lib/prisma';

const EMPTY_SYSTEM_SETTINGS = {
  schoolName: '',
  schoolLogoUrl: null,
  addressLine1: '',
  addressLine2: null,
  city: null,
  state: null,
  country: null,
  postalCode: null,
  contactEmail: null,
  contactPhone: null,
  allowSelfRegistration: false,
  attendanceSessions: ['Morning', 'Afternoon'],
};

function hasDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  return Boolean(databaseUrl && databaseUrl !== 'undefined' && databaseUrl !== 'null');
}

export const getSystemSettings = cache(async () => {
  if (!hasDatabaseUrl()) {
    return EMPTY_SYSTEM_SETTINGS;
  }

  try {
    const settings = await prisma.systemSettings.findFirst();
    return settings || EMPTY_SYSTEM_SETTINGS;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return EMPTY_SYSTEM_SETTINGS;
  }
});
