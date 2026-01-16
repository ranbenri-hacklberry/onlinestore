const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function main() {
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

    console.log('🎨 Creating end screen for the promo video...');

    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-image-preview",
        generationConfig: { responseModalities: ["image", "text"] }
    });

    const prompt = `Create a beautiful vertical end screen (9:16 aspect ratio) for an Instagram Reel. 
    Design: Elegant, premium nursery branding.
    Background: Soft warm gradient from cream/beige to sage green.
    Main text (centered, large elegant Hebrew font): שפת המדבר
    Subtitle (below, smaller): מבצע על צמחי בית!
    Decorative: Subtle botanical leaf silhouettes in the corners (Monstera leaves).
    Style: Clean, modern, professional. The Hebrew text should be perfectly spelled and readable.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, 'base64');
                const filepath = path.join(process.cwd(), 'public', 'end-screen.png');
                fs.writeFileSync(filepath, buffer);
                console.log(`✅ End screen saved: ${filepath}`);
                return;
            }
        }
        console.log('⚠️ No image in response');
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

main();
