require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// הגדרות עיצוב
const CONFIG = {
    width: 384, // התאם לרוחב המדפסת שלך (Brother QL-800 בד"כ 62mm ~ 696px, אבל תלוי בנייר)
    height: 384,
    printerName: "Brother_QL_800" // נעדכן את זה כשתגיע הביתה
};

const supabase = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

console.log("🚀 N150 'Dither-Master' Worker Started...");

// האזנה
supabase
    .channel('sticker-printer')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'print_queue' }, async (payload) => {
        console.log(`📥 New job received: Order #${payload.new.order_id}`);
        await processAndPrint(payload.new);
    })
    .subscribe();

async function processAndPrint(job) {
    try {
        console.log(`⏳ Processing image: ${job.image_path}`);

        // 1. הורדת התמונה
        const { data, error } = await supabase.storage
            .from('stickers')
            .download(job.image_path);

        if (error) throw error;
        const inputBuffer = Buffer.from(await data.arrayBuffer());

        // 2. יצירת ה-Overlay (מסגרת + טקסט)
        const svgOverlay = Buffer.from(`
      <svg width="${CONFIG.width}" height="${CONFIG.height}">
        <rect x="5" y="5" width="${CONFIG.width - 10}" height="${CONFIG.height - 10}" 
              rx="40" ry="40" fill="none" stroke="black" stroke-width="10" />
        <path d="M 5,${CONFIG.height - 80} L ${CONFIG.width - 5},${CONFIG.height - 80} 
                 L ${CONFIG.width - 5},${CONFIG.height - 45} 
                 Q ${CONFIG.width - 5},${CONFIG.height - 5} ${CONFIG.width - 45},${CONFIG.height - 5}
                 L 45,${CONFIG.height - 5} 
                 Q 5,${CONFIG.height - 5} 5,${CONFIG.height - 45} Z" 
              fill="black" />
        <text x="50%" y="${CONFIG.height - 50}" font-family="Arial" font-weight="bold" font-size="24" fill="white" text-anchor="middle">Order #${job.order_id.toString().slice(0, 4)}</text>
        <text x="50%" y="${CONFIG.height - 25}" font-family="monospace" font-size="16" fill="white" text-anchor="middle">iCaffe Sticker Booth</text>
      </svg>
    `);

        // 3. עיבוד Floyd-Steinberg Dithering
        const { data: rawPixels, info } = await sharp(inputBuffer)
            .resize(CONFIG.width, CONFIG.height, { fit: 'cover' })
            .grayscale()
            .normalize()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const pixels = new Uint8Array(rawPixels);
        const width = info.width;

        for (let y = 0; y < info.height; y++) {
            for (let x = 0; x < info.width; x++) {
                const i = y * width + x;
                const oldPixel = pixels[i];
                const newPixel = oldPixel < 128 ? 0 : 255;
                pixels[i] = newPixel;

                const quantError = oldPixel - newPixel;

                if (x + 1 < width) pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + quantError * 7 / 16));
                if (x - 1 >= 0 && y + 1 < info.height) pixels[i + width - 1] = Math.max(0, Math.min(255, pixels[i + width - 1] + quantError * 3 / 16));
                if (y + 1 < info.height) pixels[i + width] = Math.max(0, Math.min(255, pixels[i + width] + quantError * 5 / 16));
                if (x + 1 < width && y + 1 < info.height) pixels[i + width + 1] = Math.max(0, Math.min(255, pixels[i + width + 1] + quantError * 1 / 16));
            }
        }

        // 4. שמירה לקובץ סופי עם המסגרת
        const outputPath = path.join(__dirname, `print_${job.order_id}.png`);

        await sharp(pixels, { raw: { width: CONFIG.width, height: CONFIG.height, channels: 1 } })
            .composite([{ input: svgOverlay, blend: 'over' }])
            .toFile(outputPath);

        console.log(`✅ Sticker generated: ${outputPath}`);

        // 5. שליחה למדפסת
        const printCommand = `lp -d ${CONFIG.printerName} -o fit-to-page ${outputPath}`;
        exec(printCommand, (err, stdout, stderr) => {
            if (err) {
                console.error("❌ Print Error (Check printer name?):", err.message);
            } else {
                console.log("🖨️  Sent to printer!");
                // עדכון סטטוס
                supabase.from('print_queue').update({ status: 'printed' }).eq('id', job.id).then(({ error }) => {
                    if (error) console.error("❌ Error updating status:", error);
                });
                // מחיקת הקובץ הזמני
                try { fs.unlinkSync(outputPath); } catch (e) { }
            }
        });

    } catch (err) {
        console.error("🔥 Worker Logic Error:", err);
    }
}
