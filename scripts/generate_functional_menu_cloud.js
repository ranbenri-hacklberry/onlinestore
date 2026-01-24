/**
 * Generate functional menu images and UPLOAD to Supabase Storage.
 * This ensures images are available on ALL devices (iPad, Phone, etc.)
 */

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const BUSINESS_ID = '22222222-2222-2222-2222-222222222222';
const GOOGLE_API_KEY = 'AIzaSyA4cvvNi-jbhnePCtM_ERiXtVHplkojZYk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const BUCKET_NAME = 'Photos'; // Target bucket in Supabase

async function generateFunctionalPrompt(itemName) {
    return `A professional close-up food photography of ${itemName}. THE DISH IS PERFECTLY CENTERED AND FILLS 80% OF THE FRAME. Sharp focus on item, intense bokeh background. Bright, high-contrast cafe lighting. 4k resolution.`;
}

async function run() {
    console.log('☁️ Starting Cloud-Ready Image Generation...\n');

    // 1. Ensure Bucket exists (or at least try to use it)
    console.log(`📦 Checking bucket: ${BUCKET_NAME}`);

    const { data: items, error } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('business_id', BUSINESS_ID);

    if (error) return console.error('DB Error:', error);
    console.log(`📋 Found ${items.length} items to process\n`);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`\n[${i + 1}/${items.length}] Processing: ${item.name}`);

        const filename = `functional_${item.id}_${Date.now()}.png`;
        const prompt = await generateFunctionalPrompt(item.name);

        try {
            // Generate Image
            const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const part = response.candidates[0].content.parts.find(p => p.inlineData);

            if (!part) throw new Error('No image data in response');
            const buffer = Buffer.from(part.inlineData.data, 'base64');

            // Upload to Supabase Storage
            console.log(`   ⬆️ Uploading to Storage...`);
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filename, buffer, { contentType: 'image/png', upsert: true });

            if (uploadError) {
                console.error('   ❌ Upload Failed:', uploadError.message);
                continue;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filename);

            console.log(`   ✅ Public URL: ${publicUrl}`);

            // Update Database with FULL URL
            const { error: updateError } = await supabase
                .from('menu_items')
                .update({ image_url: publicUrl })
                .eq('id', item.id);

            if (updateError) console.error('   ❌ DB Update Failed:', updateError.message);
            else console.log(`   📝 DB Updated Successfully`);

        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
        }

        // Wait to avoid rate limits
        if (i < items.length - 1) {
            await new Promise(r => setTimeout(r, 10000));
        }
    }

    console.log('\n✨ Cloud Transformation Complete!');
}

run();
