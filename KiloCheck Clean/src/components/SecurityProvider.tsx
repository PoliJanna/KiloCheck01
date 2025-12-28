'use client';

import { useEffect } from 'react';
import { validateClientSideSecurity } from '@/lib/security';

/**
 * Security provider component that validates client-side security
 * Ensures no server secrets are exposed to the browser
 */
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Validate client-side security on mount
    validateClientSideSecurity();
    
    // Set up periodic security checks in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        validateClientSideSecurity();
      }, 30000); // Check every 30 seconds in development
      
      return () => clearInterval(interval);
    }
  }, []);

  return <>{children}</>;
}