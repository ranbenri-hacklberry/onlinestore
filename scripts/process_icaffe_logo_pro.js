const fs = require('fs');
const path = require('path');

async function processImages() {
    const apiKey = 'e8m8LYcE5Y4b8Hncwn9qEN7j';

    const tasks = [
        {
            input: 'public/brand/icaffe-logo-single.jpg',
            output: 'public/brand/icaffe-icon-no-bg.png',
            desc: 'Main Logo Icon'
        },
        {
            input: 'public/brand/icaffe-slogan-raw.jpg',
            output: 'public/brand/icaffe-slogan-no-bg.png',
            desc: 'Slogan Text'
        }
    ];

    for (const task of tasks) {
        const inputPath = path.join(process.cwd(), task.input);
        const outputPath = path.join(process.cwd(), task.output);

        if (!fs.existsSync(inputPath)) {
            console.error(`Skipping ${task.desc}: Input file not found:`, inputPath);
            continue;
        }

        console.log(`Processing ${task.desc} (${task.input})...`);
        const imageBuffer = fs.readFileSync(inputPath);
        const base64Image = imageBuffer.toString('base64');

        try {
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_file_b64: base64Image,
                    size: 'auto',
                    bg_color: null // Transparent
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API Error: ${response.status} - ${error}`);
            }

            const resultBuffer = await response.arrayBuffer();
            fs.writeFileSync(outputPath, Buffer.from(resultBuffer));
            console.log(`✅ ${task.desc} background removed! Saved to:`, task.output);
        } catch (error) {
            console.error(`❌ Error processing ${task.desc}:`, error.message);
        }
    }
}

processImages();
