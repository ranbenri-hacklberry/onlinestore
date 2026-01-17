/**
 * Generate iCaffe images using Gemini 3 Pro
 * Style: Gourmet food at a rustic cafe with white fence & passionfruit leaves
 */

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const BUSINESS_ID = '22222222-2222-2222-2222-222222222222';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

if (!process.env.GOOGLE_API_KEY) {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            for (const line of lines) {
                if (line.startsWith('GOOGLE_API_KEY=')) {
                    process.env.GOOGLE_API_KEY = line.split('=')[1].trim();
                }
            }
        }
    } catch (e) { }
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const OUTPUT_DIR = './public/cafe-images';

// The "White Fence & Passionfruit" Style Seed
const THEME = `
Setting: A charming rural cafe patio in a Moshav.
Background: A white slatted wooden fence overgrown with vibrant green passionfruit (passiflora) leaves. 
Lighting: Soft, cinematic natural daylight with dappled shadows from the leaves.
Surface: An old rustic wooden garden table.
Style: Professional gourmet food photography, shallow depth of field (bokeh background), rich textures.
`;

function generatePrompt(itemName) {
    let specific = '';

    if (itemName.includes('קרם ברולה')) {
        specific = 'A small white ceramic dish of Creme Brulee, perfectly caramelized burnt sugar top, a blue butane torch flame briefly touching the surface in the shot.';
    } else if (itemName.includes('ניוקי') || itemName.includes('שרימפס')) {
        specific = 'A gourmet plate of handmade gnocchi with sautéed shrimp, fresh green micro-herbs garnish, delicate sauce.';
    } else if (itemName.includes('טירמיסו')) {
        specific = 'A personal glass filled with layers of creamy Tiramisu, dusted with dark cocoa powder, placed on a wooden board.';
    } else if (itemName.includes('לחם') || itemName.includes('בגט')) {
        specific = 'Artisan crusty sourdough bread loaves, flour dusted, rustic presentation on a linen cloth.';
    } else if (itemName.includes('סלט')) {
        specific = 'A fresh vibrant salad in a beautiful ceramic bowl, colorful vegetables, high-end restaurant presentation.';
    } else if (itemName.includes('קפה') || itemName.includes('אספרסו') || itemName.includes('קפוצ')) {
        specific = 'A perfect cup of espresso/cappuccino with rich crema, artisanal ceramic cup, on a wooden garden table.';
    } else {
        specific = `A beautifully presented ${itemName}, gourmet boutique cafe style.`;
    }

    return `${specific} ${THEME}`;
}

async function generateImage(prompt, filename) {
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
                return filepath;
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

async function main() {
    console.log('☕ Generating iCaffe Images (White Fence & Passionfruit Style)\n');

    const { data: items, error } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('business_id', BUSINESS_ID);

    if (error) return console.error(error);
    console.log(`📋 Found ${items.length} items to generate\n`);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`\n[${i + 1}/${items.length}] ${item.name}`);

        const filename = sanitizeFilename(item.name);
        const prompt = generatePrompt(item.name);
        const imagePath = await generateImage(prompt, filename);

        if (imagePath) {
            const publicUrl = `/cafe-images/${filename}.png`;
            await supabase.from('menu_items').update({ image_url: publicUrl }).eq('id', item.id);
            console.log(`   📝 DB Updated`);
        }

        console.log('   ⏳ Waiting 5s...');
        await new Promise(r => setTimeout(r, 5000));
    }
}

main();
