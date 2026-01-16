/**
 * Generate specific plant images for testing layout
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

// Load env vars manually from .env.local
let apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GOOGLE_API_KEY=(.*)/);
        if (match) apiKey = match[1].trim();
    }
}

const genAI = new GoogleGenerativeAI(apiKey);
const OUTPUT_DIR = './public/plant-images';

async function generateImage(prompt, filename) {
    try {
        console.log(`   🎨 Generating: ${filename}`);
        // Using the new Gemini 3 Pro Image Preview (Nano Banana Pro)
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            generationConfig: { responseModalities: ["image", "text"] }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, 'base64');
                if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
                const filepath = path.join(OUTPUT_DIR, `${filename}.png`);
                fs.writeFileSync(filepath, buffer);
                return `/plant-images/${filename}.png`;
            }
        }
    } catch (error) {
        console.error(`   ❌ Error:`, error.message);
    }
    return null;
}

async function main() {
    const plants = [
        {
            name: 'בידנס',
            description: 'magenta daisy-like flowers with yellow centers, very fine feathery green foliage (like fern or dill)'
        },
        {
            name: 'אמנון ותמר',
            description: 'Pansy (Viola) flowers with large flat petals showing a "face" pattern in purple and yellow colors, rounded green leaves'
        },
        {
            name: 'פטוניה מפלית',
            description: 'cascading trumpet-shaped magenta flowers, sticky green foliage, trailing habit'
        },
        {
            name: 'ביצן',
            description: 'bushy plant focused on foliage, deep reddish-purple or burgundy oval-shaped leaves, no visible flowers'
        },
        {
            name: 'ביצן מגוון',
            description: 'bushy plant with variegated oval leaves in shades of bright green, yellow, and red highlights'
        }
    ];

    console.log(`🌿 Re-generating 5 plants with strict botanical descriptions and Jordan Valley background...\n`);

    for (const plant of plants) {
        console.log(`\n🌱 Processing: ${plant.name}`);

        const prompt = `A professional botanical close-up of a healthy and lush ${plant.name} plant, featuring its characteristic ${plant.description}. The plant is the central focus. The background is an extremely blurred, dreamy bokeh panorama of the Jordan Valley (בקעת הירדן) landscape, transitioning from green Samaria hills to the golden-brown arid desert valley. Warm Mediterranean sunset light, high resolution, product style photography. Pot is cropped at the bottom.`;

        const filename = plant.name.replace(/\s+/g, '_').toLowerCase();
        const imageUrl = await generateImage(prompt, filename);

        if (imageUrl) {
            const { error } = await supabase
                .from('menu_items')
                .update({ image_url: imageUrl })
                .eq('name', plant.name)
                .eq('business_id', BUSINESS_ID);

            if (error) console.log(`   ⚠️ DB update failed: ${error.message}`);
            else console.log(`   ✅ Corrected! Image updated with exact botanical features.`);
        }


        console.log('   ⏳ Waiting 5s (Rate limit)...');
        await new Promise(r => setTimeout(r, 5000));
    }
    console.log('\n✨ Done updating the initial set!');
}

main().catch(console.error);
