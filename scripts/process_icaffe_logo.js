const fs = require('fs');
const path = require('path');

async function removeBackground() {
    const apiKey = 'e8m8LYcE5Y4b8Hncwn9qEN7j';
    const inputPath = path.join(process.cwd(), 'public/brand/icaffe-logo-single.jpg');
    const outputPath = path.join(process.cwd(), 'public/brand/icaffe-logo-no-bg.png');

    if (!fs.existsSync(inputPath)) {
        console.error('Input file not found:', inputPath);
        return;
    }

    const imageBuffer = fs.readFileSync(inputPath);
    const base64Image = imageBuffer.toString('base64');

    console.log('Sending logo to remove.bg API...');

    try {
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

        console.log('✅ Background removed! Saved to:', outputPath);
    } catch (error) {
        console.error('❌ Error removing background:', error.message);
    }
}

removeBackground();
