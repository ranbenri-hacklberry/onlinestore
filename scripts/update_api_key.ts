
import { db } from '../db/database';

const updateKey = async () => {
    try {
        await db.open();
        // iCaffe ID is usually '22222222-2222-2222-2222-222222222222' based on previous context 
        // or we can just update all businesses for now as there is likely only one major one locally

        // Let's try to update the specific one if we know it, or find iCaffe
        const businesses = await db.table('businesses').toArray();
        const iCaffe = businesses.find(b => b.name.includes('iCaffe') || b.id === '22222222-2222-2222-2222-222222222222');

        if (iCaffe) {
            await db.table('businesses').update(iCaffe.id, { google_api_key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY });
            console.log(`✅ Updated API Key for ${iCaffe.name} (${iCaffe.id})`);
        } else {
            console.log("⚠️ iCaffe business not found locally. Listing all:");
            businesses.forEach(b => console.log(`- ${b.name} (${b.id})`));
        }

    } catch (err) {
        console.error("❌ Error updating key:", err);
    }
};

updateKey();
