const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');

const importsDir = '/Users/user/.gemini/antigravity/scratch/onlinestore/inventory_imports/';
const files = fs.readdirSync(importsDir).filter(f => f.endsWith('.docx'));

files.forEach(file => {
    console.log(`\n--- EXTRACTING: ${file} ---`);
    const filePath = path.join(importsDir, file);
    try {
        // Extract document.xml to a temp string
        const xml = execSync(`unzip -p "${filePath}" word/document.xml`).toString();

        // Very basic XML tag stripping to get text
        // In docx, text is inside <w:t> tags
        const textParts = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
        if (textParts) {
            const cleanText = textParts.map(t => t.replace(/<[^>]+>/g, '')).join(' ');
            console.log(cleanText);
        } else {
            console.log("No text found in w:t tags.");
        }
    } catch (e) {
        console.error(`Error processing ${file}:`, e.message);
    }
});
