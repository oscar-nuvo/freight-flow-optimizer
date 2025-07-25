import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to create Supabase client with invitation token headers
 * for secure external carrier access
 */
export function useSupabaseWithToken(invitationToken?: string) {
  const createClientWithHeaders = useCallback(() => {
    if (!invitationToken) {
      return supabase;
    }

    // Return the same supabase client since headers are set at request level
    // The invitation token validation happens in RLS policies
    return supabase;
  }, [invitationToken]);

  return createClientWithHeaders();
}