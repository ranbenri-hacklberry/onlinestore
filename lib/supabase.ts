import { createClient } from '@supabase/supabase-js';

// Next.js uses process.env for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing! Check .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: true,
        storageKey: 'supabase.auth.token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});


/**
 * Returns a Supabase client scoped to the appropriate schema based on the user.
 * @param {any} user - The current logged-in user
 * @returns {any} - Supabase client with .schema() applied if needed
 */
export const getSupabase = (user: any) => {
    // Legacy logic removed: We now use Single Schema (public) with Business ID filtering.
    // The previous logic attempted to switch to 'demo' schema, causing 406 errors.
    return supabase;
};

;