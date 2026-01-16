const fs = require('fs');
const path = require('path');

async function main() {
    const startTime = Date.now();

    let apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/GOOGLE_API_KEY=(.*)/);
            if (match) apiKey = match[1].trim();
        }
    }

    // Load the actual nursery reference image
    const imagePath = path.join(process.cwd(), 'public/nursery-reference.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    const imageLoadTime = Date.now();

    const modelName = "veo-3.1-fast-generate-preview";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`;

    // Image-to-video with the actual nursery view - PORTRAIT FORMAT emphasized
    const payload = {
        instances: [
            {
                prompt: `IMPORTANT: Generate a VERTICAL PORTRAIT video in 9:16 aspect ratio (1080x1920 pixels) suitable for Instagram Reels.
                
                Animate this beautiful nursery scene with bougainvillea flowers and the Jordan Valley mountains in the background.
                
                Animation: Gentle breeze moving through the plants, flowers swaying softly, subtle camera movement forward into the nursery.
                
                Keep the authentic feel of this real nursery location in Gittit, overlooking the Jordan Valley.
                Warm Mediterranean sunlight, peaceful atmosphere.
                
                MUST BE VERTICAL 9:16 FORMAT for mobile viewing.
                NO text overlay.
                Cinematic quality, 5 seconds duration.`,
                image: {
                    bytesBase64Encoded: imageBase64,
                    mimeType: "image/png"
                }
            }
        ]
    };

    const apiCallTime = Date.now();
    console.log('🎬 יוצר סרטון מהנוף האמיתי של המשתלה...');
    console.log(`   📸 תמונת מקור: nursery-reference.png`);
    console.log(`   🤖 מודל: Veo 3.1 Fast`);
    console.log(`   ⏱️ זמן טעינת תמונה: ${imageLoadTime - startTime}ms`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const requestSentTime = Date.now();
        console.log(`   ⏱️ זמן שליחת בקשה: ${requestSentTime - apiCallTime}ms`);

        if (data.error) {
            console.error('❌ שגיאה:', JSON.stringify(data.error, null, 2));
            return;
        }

        console.log('✅ הבקשה התקבלה!');
        console.log(`   🔑 Operation ID: ${data.name}`);

        const opId = data.name;
        const opUrl = `https://generativelanguage.googleapis.com/v1beta/${opId}?key=${apiKey}`;

        console.log('⏳ מייצר סרטון (זה לוקח דקה-שתיים)...');

        let completed = false;
        let attempts = 0;
        let generationStartTime = Date.now();

        while (!completed && attempts < 30) {
            await new Promise(r => setTimeout(r, 10000));
            attempts++;

            const opResponse = await fetch(opUrl);
            const opData = await opResponse.json();

            if (opData.done) {
                completed = true;
                const generationEndTime = Date.now();
                const totalGenerationTime = generationEndTime - generationStartTime;

                if (opData.error) {
                    console.error('❌ נכשל:', JSON.stringify(opData.error, null, 2));
                } else {
                    console.log('🎉 הסרטון מוכן!');

                    if (opData.response?.generateVideoResponse?.generatedSamples) {
                        const sample = opData.response.generateVideoResponse.generatedSamples[0];
                        if (sample.video?.uri) {
                            const downloadStartTime = Date.now();
                            console.log(`📡 מוריד סרטון...`);
                            const videoUrl = `${sample.video.uri}&key=${apiKey}`;
                            const vidResponse = await fetch(videoUrl);
                            const buffer = Buffer.from(await vidResponse.arrayBuffer());
                            const videoPath = path.join(process.cwd(), 'public', 'promo-video-v3-nursery.mp4');
                            fs.writeFileSync(videoPath, buffer);
                            const downloadEndTime = Date.now();

                            const totalTime = downloadEndTime - startTime;

                            console.log(`\n${'='.repeat(60)}`);
                            console.log(`✅ נשמר: ${videoPath}`);
                            console.log(`${'='.repeat(60)}`);
                            console.log(`\n🎬 דו"ח הפקה לצוות שפת המדבר 🌿☕\n`);
                            console.log(`${'─'.repeat(60)}`);
                            console.log(`📊 סטטיסטיקות הפקה:`);
                            console.log(`   ⏱️ טעינת תמונת מקור: ${imageLoadTime - startTime}ms`);
                            console.log(`   ⏱️ שליחת בקשה ל-API: ${requestSentTime - apiCallTime}ms`);
                            console.log(`   ⏱️ זמן יצירת הסרטון: ${totalGenerationTime}ms (${(totalGenerationTime / 1000).toFixed(1)} שניות)`);
                            console.log(`   ⏱️ זמן הורדת הסרטון: ${downloadEndTime - downloadStartTime}ms`);
                            console.log(`   ⏱️ סה"כ זמן הפקה: ${totalTime}ms (${(totalTime / 1000).toFixed(1)} שניות)`);
                            console.log(`${'─'.repeat(60)}`);
                            console.log(`\n🛠️ כלים ששימשו להפקה:`);
                            console.log(`   🎥 מודל וידאו: Google Veo 3.1 Fast (Preview)`);
                            console.log(`   🖼️ מקור: תמונה אמיתית מהמשתלה בגיתית`);
                            console.log(`   🔧 תשתית: Gemini API + Node.js`);
                            console.log(`   ☁️ שרתים: Google Cloud AI Infrastructure`);
                            console.log(`${'─'.repeat(60)}`);
                            console.log(`\n😄 הודעה מצחיקה לצוות:`);
                            console.log(`${'─'.repeat(60)}`);
                            console.log(`   🤖 "שלום לצוות שפת המדבר!`);
                            console.log(`   `);
                            console.log(`   אני Veo 3.1, רובוט הווידאו של גוגל.`);
                            console.log(`   בזמן שאתם הכנתם קפה אחד, אני הפקתי סרטון פרסומת.`);
                            console.log(`   `);
                            console.log(`   לקח לי ${(totalGenerationTime / 1000).toFixed(1)} שניות לייצר את מה שסוכנות פרסום`);
                            console.log(`   הייתה גובה עליכם 5,000₪ ושבועיים עבודה.`);
                            console.log(`   `);
                            console.log(`   אבל אל דאגה - אני עדיין לא יודע להכין לאטה עם`);
                            console.log(`   ציור של עלה מונסטרה בקצף. אז העבודה שלכם בטוחה! 😉`);
                            console.log(`   `);
                            console.log(`   בברכה,`);
                            console.log(`   הרובוט שעובד 24/7 בלי הפסקות קפה"`);
                            console.log(`${'─'.repeat(60)}`);
                            console.log(`\n🎊 תהנו מהסרטון! 🌿🏜️☕\n`);
                        }
                    }
                }
            } else {
                const elapsed = Date.now() - generationStartTime;
                console.log(`   [${attempts}/30] מעבד... (${(elapsed / 1000).toFixed(0)}s)`);
            }
        }

        if (!completed) console.log('⏰ נגמר הזמן. נסו שוב מאוחר יותר.');

    } catch (e) {
        console.error('❌ שגיאה:', e.message);
    }
}

main();
