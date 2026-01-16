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

    // Attempting to generate a short video using Veo 3.1 Flash (rumored name for the "cheaper" version)
    // Or standard Veo preview names
    const modelsToTry = [
        "veo-3.1-flash-preview",
        "veo-3.1-preview",
        "veo-001",
        "gemini-3-pro-video-preview"
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`🎬 Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = "A 5-second cinematic promotional video for a boutique nursery called 'Sfat Hamidbar'. Show lush green houseplants in a sunlit modern living room with the Jordan Valley mountains visible through the window. Text overlay: 'Special Sale on Houseplants!'. Professional high-quality video.";

            // For Veo/Video models, responseModalities might need to include "video"
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseModalities: ["video"]
                }
            });

            const response = await result.response;
            console.log(`✅ Success with ${modelName}!`);
            console.log(JSON.stringify(response, null, 2));
            break; // Stop if one works
        } catch (e) {
            console.log(`❌ Failed with ${modelName}: ${e.message}`);
        }
    }
}

main();
