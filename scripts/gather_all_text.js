const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');

const importsDir = '/Users/user/.gemini/antigravity/scratch/onlinestore/inventory_imports/';
const files = fs.readdirSync(importsDir).filter(f => f.endsWith('.docx'));

const allData = {};

files.forEach(file => {
    const filePath = path.join(importsDir, file);
    try {
        const xml = execSync(`unzip -p "${filePath}" word/document.xml`).toString();
        // Just extract all text in order
        const texts = xml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
        const cleanTexts = texts.map(t => {
            const match = t.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/);
            return match ? match[1] : '';
        }).filter(t => t.trim().length > 0);

        allData[file] = cleanTexts;
    } catch (e) { }
});

console.log(JSON.stringify(allData, null, 2));
