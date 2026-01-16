const fs = require('fs');

async function removeBackground() {
    const apiKey = 'e8m8LYcE5Y4b8Hncwn9qEN7j';
    // Use the white text logo that was generated
    const inputPath = '/Users/user/.gemini/antigravity/brain/b0b417be-e2df-4d51-afc8-871d66247249/logo_text_only_1768559948232.png';
    const outputPath = './public/logo-text.png';

    const imageBuffer = fs.readFileSync(inputPath);
    const base64Image = imageBuffer.toString('base64');

    console.log('Sending WHITE TEXT logo to remove.bg API...');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image_file_b64: base64Image,
            size: 'auto'
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const resultBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(resultBuffer));

    console.log('✅ Background removed from white text logo! Saved to:', outputPath);
}

removeBackground().catch(console.error);
