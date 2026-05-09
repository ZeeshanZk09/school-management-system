'use client';

import { useEffect } from 'react';

/**
 * Hook to warn user about unsaved changes when closing tab or refreshing.
 * @param isDirty Whether the form has unsaved changes
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Standard way to trigger browser confirmation
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
