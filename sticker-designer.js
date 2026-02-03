const sharp = require('sharp');
const fs = require('fs');

const CONFIG = {
    width: 384,
    height: 384,
    frameThickness: 10,
    customerName: "Rani",
    orderTime: "10:30 AM"
};

async function generateDitheredPreview() {
    console.log("🎨 Designing Sticker with Dithering...");

    // 1. קודם כל ניצור את ה-Overlay (כמו קודם)
    const svgOverlay = Buffer.from(`
    <svg width="${CONFIG.width}" height="${CONFIG.height}">
      <rect x="5" y="5" width="${CONFIG.width - 10}" height="${CONFIG.height - 10}" 
            rx="40" ry="40" fill="none" stroke="black" stroke-width="${CONFIG.frameThickness}" />
      <path d="M 5,${CONFIG.height - 80} L ${CONFIG.width - 5},${CONFIG.height - 80} 
               L ${CONFIG.width - 5},${CONFIG.height - 45} 
               Q ${CONFIG.width - 5},${CONFIG.height - 5} ${CONFIG.width - 45},${CONFIG.height - 5}
               L 45,${CONFIG.height - 5} 
               Q 5,${CONFIG.height - 5} 5,${CONFIG.height - 45} Z" 
            fill="black" />
      <text x="50%" y="${CONFIG.height - 50}" 
            font-family="Arial" font-weight="bold" font-size="24" 
            fill="white" text-anchor="middle">iCaffe Order #104</text>
      <text x="50%" y="${CONFIG.height - 25}" 
            font-family="monospace" font-size="16" 
            fill="white" text-anchor="middle">${CONFIG.customerName} • ${CONFIG.orderTime}</text>
    </svg>
  `);

    try {
        // 2. עיבוד התמונה לגווני אפור (RAW Buffer)
        const { data, info } = await sharp('me.jpg') // התמונה שלך
            .resize(CONFIG.width, CONFIG.height, { fit: 'cover' })
            .grayscale()
            .normalize()
            .raw() // אנחנו רוצים את הפיקסלים החיים
            .toBuffer({ resolveWithObject: true });

        // 3. אלגוריתם Floyd-Steinberg Dithering ידני
        // זה הקסם שהופך אפור לנקודות
        const pixels = new Uint8Array(data);
        const width = info.width;

        for (let y = 0; y < info.height; y++) {
            for (let x = 0; x < info.width; x++) {
                const i = (y * width + x); // אינדקס הפיקסל (יש רק ערוץ אחד כי זה שחור לבן)
                const oldPixel = pixels[i];
                const newPixel = oldPixel < 128 ? 0 : 255; // קובעים אם שחור או לבן
                pixels[i] = newPixel;

                const quantError = oldPixel - newPixel; // מחשבים את השגיאה

                // מפזרים את השגיאה לשכנים (זה הדית'רינג)
                if (x + 1 < width) pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + quantError * 7 / 16));
                if (x - 1 >= 0 && y + 1 < info.height) pixels[i + width - 1] = Math.max(0, Math.min(255, pixels[i + width - 1] + quantError * 3 / 16));
                if (y + 1 < info.height) pixels[i + width] = Math.max(0, Math.min(255, pixels[i + width] + quantError * 5 / 16));
                if (x + 1 < width && y + 1 < info.height) pixels[i + width + 1] = Math.max(0, Math.min(255, pixels[i + width + 1] + quantError * 1 / 16));
            }
        }

        // 4. הרכבה ושמירה
        await sharp(pixels, { raw: { width: CONFIG.width, height: CONFIG.height, channels: 1 } })
            .composite([{ input: svgOverlay, blend: 'over' }]) // מוסיפים את המסגרת מלמעלה
            .toFile('dithered_preview.png');

        console.log("✅ Dithered Preview Saved! תבדוק את זה עכשיו.");
    } catch (error) {
        console.error("Error in generating dithered preview:", error);
    }
}

generateDitheredPreview();
