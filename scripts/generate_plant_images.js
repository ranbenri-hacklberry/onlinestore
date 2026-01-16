/**
 * Generate plant images using Google Gemini API
 * Two styles:
 * 1. Indoor plants - cozy home backgrounds (living room, kitchen, bedroom, etc.)
 * 2. Outdoor plants - garden/patio backgrounds with string lights, golden hour
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

// Load env vars manually from .env.local if not available
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
    } catch (e) {
        console.warn('⚠️ Could not load .env.local manually');
    }
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Output directory
const OUTPUT_DIR = './public/plant-images';

// Background options
const INDOOR_BACKGROUNDS = [
    'blurred cozy modern living room with soft lighting',
    'blurred kitchen corner with wooden cabinets',
    'blurred bright bedroom with morning light',
    'blurred designer apartment interior',
    'blurred minimalist home office'
];

const OUTDOOR_BACKGROUNDS = [
    'panoramic view of the Jordan Valley (בקעת הירדן) at sunset with desert mountains',
    'blurred vista showing transition from green Samaria hills to dry desert valley floor',
    'scenic overlook of the Jordan Rift Valley with hazy arid mountains in distance',
    'golden hour light over the desert valley with Mediterranean greenery in background',
    'misty morning view of the Jordan valley floor from the mountainside',
    'rugged desert landscape transition with soft sunlight'
];

const HERB_BACKGROUNDS = [
    'rustic farmhouse terrace with view of the Samaria hills',
    'outdoor desert garden patio in Gittit with soft lighting',
    'stone wall planter with Mediterranean atmosphere',
    'sunny balcony corner with arid hills in background'
];

// Outdoor plant categories
const OUTDOOR_CATEGORIES = ['פרחי חוץ', 'שיחים', 'מטפסים'];
const INDOOR_CATEGORIES = ['צמחי בית'];
const HERB_CATEGORIES = ['צמחי תבלין', 'צמחים רפואיים'];

/**
 * Generate prompt based on plant and category
 */
function generatePrompt(plantName, category) {
    let backgrounds, style;

    if (INDOOR_CATEGORIES.includes(category)) {
        const bg = INDOOR_BACKGROUNDS[Math.floor(Math.random() * INDOOR_BACKGROUNDS.length)];
        style = `A lush healthier ${plantName} houseplant with vibrant green foliage, professional botanical close-up. Background is an extremely blurred ${bg}. Warm cozy lighting, high resolution, product photography. Pot is cropped at the bottom edge.`;
    } else if (HERB_CATEGORIES.includes(category)) {
        const bg = HERB_BACKGROUNDS[Math.floor(Math.random() * HERB_BACKGROUNDS.length)];
        style = `A fresh aromatic ${plantName} herb plant, abundant healthy leaves. Background is an extremely blurred ${bg}. Natural sunny Mediterranean lighting, high resolution, lifestyle botanical photography. Pot is cropped at the bottom.`;
    } else {
        // Outdoor plants - Jordan Valley special
        const bg = OUTDOOR_BACKGROUNDS[Math.floor(Math.random() * OUTDOOR_BACKGROUNDS.length)];
        style = `A professional botanical close-up of a healthy and lush ${plantName} plant in full vibrant bloom. Background is an extremely blurred, dreamy bokeh panorama of ${bg}. Warm golden hour Mediterranean sunset light, high resolution, product style photography. Pot is cropped at the bottom.`;
    }

    return style;
}

/**
 * Generate image using Gemini
 */
async function generateImage(prompt, filename) {
    try {
        console.log(`   🎨 Generating: ${filename}`);

        // Using the new Gemini 3 Pro Image (Nano Banana Pro)
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            generationConfig: {
                responseModalities: ["image", "text"]
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Extract image from response
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, 'base64');

                // Ensure directory exists
                if (!fs.existsSync(OUTPUT_DIR)) {
                    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
                }

                const filepath = path.join(OUTPUT_DIR, `${filename}.png`);
                fs.writeFileSync(filepath, buffer);
                console.log(`   ✅ Saved: ${filepath}`);
                return filepath;
            }
        }

        console.log(`   ⚠️ No image in response for ${filename}`);
        return null;
    } catch (error) {
        console.error(`   ❌ Error generating ${filename}:`, error.message);
        return null;
    }
}

/**
 * Sanitize filename
 */
function sanitizeFilename(name) {
    return name
        .replace(/[\/\\:*?"<>|]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
}

/**
 * Main function
 */
async function main() {
    console.log('🌿 Plant Image Generator for שפת המדבר\n');
    console.log('='.repeat(50));

    // Fetch all plants
    const { data: plants, error } = await supabase
        .from('menu_items')
        .select('id, name, category, description')
        .eq('business_id', BUSINESS_ID)
        .or('is_deleted.is.null,is_deleted.eq.false');

    if (error) {
        console.error('Error fetching plants:', error);
        return;
    }

    console.log(`📋 Found ${plants.length} plants to generate images for\n`);

    // Test mode - limit to first 3 plants
    const TEST_MODE = process.argv.includes('--test');
    const plantsToProcess = TEST_MODE ? plants.slice(0, 3) : plants;

    if (TEST_MODE) {
        console.log('🧪 TEST MODE: Processing only 3 plants\n');
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < plantsToProcess.length; i++) {
        const plant = plantsToProcess[i];
        console.log(`\n[${i + 1}/${plantsToProcess.length}] ${plant.name} (${plant.category})`);

        const prompt = generatePrompt(plant.name, plant.category);
        const filename = sanitizeFilename(plant.name);

        const imagePath = await generateImage(prompt, filename);

        if (imagePath) {
            // Update database with image URL
            const publicUrl = `/plant-images/${filename}.png`;

            const { error: updateError } = await supabase
                .from('menu_items')
                .update({ image_url: publicUrl })
                .eq('id', plant.id);

            if (updateError) {
                console.log(`   ⚠️ DB update failed: ${updateError.message}`);
            } else {
                console.log(`   📝 DB updated with URL`);
                successCount++;
            }
        } else {
            failCount++;
        }

        // Rate limiting - wait 5 seconds between requests (safe for 15 RPM limit)
        console.log('   ⏳ Waiting 5s...');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`🎉 Done! Generated: ${successCount}/${plants.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
}

// Run
main().catch(console.error);
