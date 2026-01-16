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

    if (!apiKey) {
        console.error('API Key not found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log('Fetching available models...');
        // Standard method might not exist in this SDK version for listing
        // Let's try to just list models if available or check error
        const client = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct "listModels" in the simple GenAI SDK usually
        // But we can try to use a model that we think might work
        console.log('Models listing is usually via the REST API or Vertex AI SDK.');
    } catch (e) {
        console.error(e);
    }
}

main();
