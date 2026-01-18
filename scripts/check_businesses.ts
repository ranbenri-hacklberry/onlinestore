
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: In a real backend script we'd use the SERVICE_ROLE_KEY to bypass RLS, 
// but let's try with what we have first to emulate the app's view.

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectBusinesses() {
    console.log("🔍 Inspecting 'businesses' table...");

    // Select all columns
    const { data, error } = await supabase
        .from('businesses')
        .select('*');

    if (error) {
        console.error("❌ Error fetching businesses:", error);
        return;
    }

    console.log(`✅ Found ${data.length} businesses:`);
    console.table(data.map(b => ({ id: b.id, name: b.name, created_at: b.created_at })));

    // Check if ID 2222... exists
    const targetId = '22222222-2222-2222-2222-222222222222';
    const hasTarget = data.find(b => b.id === targetId);

    if (hasTarget) {
        console.log(`\n🎉 The target business (${targetId}) EXISTS!`);
    } else {
        console.log(`\n⚠️ The target business (${targetId}) is NOT visible via this API Key.`);
        console.log("Possible reasons: RLS Policy, Soft Delete, or it was truly deleted.");
    }
}

inspectBusinesses();
