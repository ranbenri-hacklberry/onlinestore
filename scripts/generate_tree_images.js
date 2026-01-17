/**
 * Generate plant images using Google Gemini API
 * Optimized for Trees and Shrubs
 */

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Config
const SUPABASE_URL = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const BUSINESS_ID = '8e4e05da-2d99-4bd9-aedf-8e54cbde930a';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load env vars manually
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
const OUTPUT_DIR = './public/plant-images';

const TREE_BACKGROUNDS = [
    'blurred sun-drenched orchard in the Jordan Valley with rolling desert hills',
    'blurred lush green grove at golden hour',
    'blurred scenic Mediterranean landscape with ancient stone walls',
    'blurred mountain slope overlooking the Dead Sea in the distance'
];

const INDOOR_BACKGROUNDS = ['blurred cozy modern living room'];
const OUTDOOR_BACKGROUNDS = ['blurred Jordan Valley vista at sunset'];

function generatePrompt(plantName, category) {
    let bg;
    if (['עצי פרי', 'עצי נוי', 'שיחים ועצים', 'שיחים'].includes(category)) {
        bg = TREE_BACKGROUNDS[Math.floor(Math.random() * TREE_BACKGROUNDS.length)];
        return `A majestic and healthy ${plantName} tree, vibrant foliage, detailed texture. Professional botanical close-up shot. Background is an extremely blurred, high-quality bokeh of ${bg}. Warm golden hour lighting, cinematic product photography style. Plant is centered, pot is partially visible or cropped at bottom.`;
    } else if (category === 'צמחי בית') {
        bg = INDOOR_BACKGROUNDS[0];
        return `A lush healthier ${plantName} houseplant, vibrant green, in a stylish pot. Background is an extremely blurred ${bg}. Natural warm interior lighting, high resolution product photography.`;
    } else {
        bg = OUTDOOR_BACKGROUNDS[0];
        return `A vibrant healthy ${plantName} plant in full bloom. Background is an extremely blurred ${bg}. Golden hour Mediterranean light, professional botanical photography.`;
    }
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
    console.log('🌳 Generating Tree & Plant Images using Gemini\n');

    // Fetch only items without images
    const { data: plants, error } = await supabase
        .from('menu_items')
        .select('id, name, category')
        .eq('business_id', BUSINESS_ID)
        .is('image_url', null);

    if (error) return console.error(error);
    console.log(`📋 Found ${plants.length} plants needing images\n`);

    for (let i = 0; i < plants.length; i++) {
        const plant = plants[i];
        console.log(`\n[${i + 1}/${plants.length}] ${plant.name}`);

        const prompt = generatePrompt(plant.name, plant.category);
        const filename = sanitizeFilename(plant.name);
        const imagePath = await generateImage(prompt, filename);

        if (imagePath) {
            const publicUrl = `/plant-images/${filename}.png`;
            await supabase.from('menu_items').update({ image_url: publicUrl }).eq('id', plant.id);
            console.log(`   📝 DB Updated`);
        }

        console.log('   ⏳ Waiting 5s...');
        await new Promise(r => setTimeout(r, 5000));
    }
}

main();
