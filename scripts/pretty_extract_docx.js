const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');

const importsDir = '/Users/user/.gemini/antigravity/scratch/onlinestore/inventory_imports/';
const files = fs.readdirSync(importsDir).filter(f => f.endsWith('.docx'));

files.forEach(file => {
    console.log(`\n\n=========================================`);
    console.log(`FILE: ${file}`);
    console.log(`=========================================`);
    const filePath = path.join(importsDir, file);

    try {
        const xml = execSync(`unzip -p "${filePath}" word/document.xml`).toString();

        // Match tables (handle potential attributes and newlines)
        const tables = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g) || [];

        tables.forEach((table, tIdx) => {
            console.log(`\n[Table ${tIdx + 1}]`);
            // Match rows
            const rows = table.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];

            rows.forEach((row, rIdx) => {
                // Match cells
                const cells = row.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
                const cellTexts = cells.map(cell => {
                    // Match text elements inside cells
                    const texts = cell.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
                    return texts.map(t => {
                        // Extract content between <w:t> tags
                        const match = t.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/);
                        return match ? match[1] : '';
                    }).join('').trim();
                });

                if (cellTexts.join('').trim().length > 0) {
                    console.log(`R${rIdx}: | ${cellTexts.join(' | ')} |`);
                }
            });
        });
    } catch (e) {
        console.error(`Error processing ${file}:`, e.message);
    }
});
