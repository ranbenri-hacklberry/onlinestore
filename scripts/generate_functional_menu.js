/**
 * Generate functional, high-focus menu images for iCaffe.
 * Style: "Operational Premium" - Centered dish, sharp focus, intense bokeh background.
 */

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const BUSINESS_ID = '11111111-1111-1111-1111-111111111111';
const GOOGLE_API_KEY = 'AIzaSyA4cvvNi-jbhnePCtM_ERiXtVHplkojZYk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const OUTPUT_DIR = path.join(__dirname, '../frontend_source/public/cafe-images');

async function generateFunctionalPrompt(itemName) {
    const isLarge = itemName.includes('גדול') || itemName.includes('כפול');
    const name = itemName.toLowerCase();

    // Seed Characteristics Detection
    const isCoffee = ['קפה', 'אספרסו', 'הפוך', 'קפוצ', 'לאטה', 'מוקה'].some(k => name.includes(k));
    const isColdDrink = ['קר', 'אייס', 'מיץ', 'לימונדה'].some(k => name.includes(k));
    const isSalad = name.includes('סלט');
    const isPastry = ['מאפה', 'קרואסון', 'דניש', 'עוגה'].some(k => name.includes(k));
    const isSandwich = ['כריך', 'טוסט', 'באגט', 'טורטייה'].some(k => name.includes(k));
    const isPizza = name.includes('פיצה');

    let presentation = '';
    if (isCoffee) {
        presentation = `A high-quality WHITE disposable paper coffee cup. ${isLarge ? 'Larger size' : 'Regular size'}. Rich foam with art. Clean minimalist look.`;
    } else if (isColdDrink) {
        presentation = `A professional CLEAR transparent disposable plastic cup with ice cubes and condensation. Served with a straw.`;
    } else if (isSalad) {
        presentation = `A rustic BROWN KRAFT PAPER round disposable salad bowl. Fresh vibrant ingredients visible. Served with a small separate white paper container of dressing.`;
    } else if (isSandwich || isPastry) {
        presentation = `The item is served on natural BROWN greaseproof wrapping paper or a wood-textured board with paper liner. Professional artisanal presentation.`;
    } else if (isPizza) {
        presentation = `A boutique pizza on a plain cardboard base or brown craft paper.`;
    } else {
        presentation = `Professional disposable boutique cafe packaging.`;
    }

    const style = `
        Background: A breathtaking, extremely blurred (bokeh) panoramic vista of the Jordan Valley (בקעת הירדן). Distant desert mountains, soft golden sunrise light, sparse desert flora. 
        Composition: THE ITEM IS PERFECTLY CENTERED AND FILLS 75-80% OF THE FRAME. 
        Focus: SHARP BOLD FOCUS ON THE FOOD/DRINK AND ITS DISPOSABLE CONTAINER. 
        Aesthetic: "Desert Edge" (שפת המדבר) boutique cafe style. Professional product photography.
    `;

    return `MATCHED Item: ${itemName}. ${presentation} ${style} 4k high-resolution.`;
}

async function generateAndSaveImage(prompt, filename) {
    try {
        console.log(`   🎨 Generating: ${filename}`);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            generationConfig: { responseModalities: ["image", "text"] }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const buffer = Buffer.from(part.inlineData.data, 'base64');
                if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
                const filepath = path.join(OUTPUT_DIR, `${filename}.png`);
                fs.writeFileSync(filepath, buffer);
                console.log(`   ✅ Saved: ${filepath}`);
                return `/cafe-images/${filename}.png`;
            }
        }
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }
    return null;
}

function sanitizeFilename(name) {
    return name.replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, '_').toLowerCase();
}

async function run() {
    console.log('🚀 Starting Functional Image Generation for עגלת קפה...\n');

    const { data: items, error } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('business_id', BUSINESS_ID);

    if (error) return console.error('DB Error:', error);
    console.log(`📋 Found ${items.length} items to process\n`);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`\n[${i + 1}/${items.length}] Processing: ${item.name}`);

        const filename = `item_${String(item.id).split('-')[0]}_${sanitizeFilename(item.name)}`;
        const prompt = await generateFunctionalPrompt(item.name);

        const publicUrl = await generateAndSaveImage(prompt, filename);

        if (publicUrl) {
            const { error: updateError } = await supabase
                .from('menu_items')
                .update({ image_url: publicUrl })
                .eq('id', item.id);

            if (updateError) console.error('   ❌ DB Update Failed:', updateError.message);
            else console.log(`   📝 DB Updated: ${publicUrl}`);
        }

        // Wait to avoid rate limits
        if (i < items.length - 1) {
            console.log('   ⏳ Cooling down for 10 seconds...');
            await new Promise(r => setTimeout(r, 10000));
        }
    }

    console.log('\n✨ All done!');
}

run();
