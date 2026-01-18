import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini Service for OCR and Image tasks using the official Google SDK
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

// Helper to get the correct AI instance
const getGenAI = (apiKey) => {
    const keyToUse = apiKey || GEMINI_API_KEY;
    if (!keyToUse) return null;
    return new GoogleGenerativeAI(keyToUse);
};

/**
 * Step 1: Analyze subjects in the photo (Vision)
 * Using Gemini 2.0 Flash for maximum speed and accuracy
 */
export const analyzeImageTraits = async (base64String, apiKey = null) => {
    const genAI = getGenAI(apiKey);
    if (!genAI) throw new Error('Gemini API Key missing');
    if (!base64String) throw new Error('No image data provided');

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const mimeMatch = base64String.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = mimeMatch ? mimeMatch[2] : (base64String.includes('base64,') ? base64String.split('base64,')[1] : base64String);

    const prompt = `Task: High-fidelity Scene & Subject analysis for a 3D portrait.
    PRECISION REQUIREMENTS:
    1. SUBJECTS: Identify ALL subjects (People, Pets, etc.). For each person, describe Hair, Facial Hair, and Gender.
    2. GENDER: Explicitly state "Male", "Female", or "Non-binary" based on visual traits. DO NOT DEFAULT TO MALE.
    3. HAIR: Specify style clearly (e.g., "Bald", "Long Curly", "Short").
    4. AGE: Estimate apparent age naturally (do not force youth).
    5. PETS: If a pet is present (Dog, Cat, etc.), describe its breed and color.
    No preamble, English, max 60 words.`;

    try {
        console.log("👁️ [Vision] Analyzing Scene & Subjects...");
        const result = await model.generateContent([
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);
        const text = result.response.text().trim();
        console.log("📝 [Vision] Precise Traits:", text);
        return text;
    } catch (error) {
        console.warn('⚠️ [Vision] Fallback:', error.message);
        return "Adult subject, short hair, neutral expression";
    }
};

/**
 * Step 2: Generate Artistic image (Imagen 3)
 */
export const generateImageWithGemini = async (traits, name = 'someone', style = 'pixar', customPrompt = '', apiKey = null) => {
    const genAI = getGenAI(apiKey);
    if (!genAI) throw new Error('Gemini API Key missing');

    const stylePrompts = {
        pixar: "High-fidelity 3D Pixar-style character portrait, wide waist-up medium shot. Soft cinematic lighting, 8k render, vibrant Disney-style colors.",
        anime: "Studio Ghibli style hand-drawn anime portrait, beautiful watercolor textures, expressive eyes, peaceful whimsical atmosphere, masterpiece.",
        cyberpunk: "Cyberpunk 2077 aesthetic, futuristic neon lighting, glowing accents, cinematic street background, detailed cybernetics.",
        sketch: "Detailed hand-drawn pencil sketch, charcoal textures, elegant line art on textured paper.",
        claymation: "Stop-motion claymation style like Wallace & Gromit, realistic clay textures, tactile and charming 3D look."
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.pixar;

    try {
        const finalPrompt = `${selectedStyle}
        SUBJECTS TO RENDER: ${traits}.
        ${customPrompt ? `ADDITIONAL USER INSTRUCTIONS: ${customPrompt}.` : ''}
        CRITICAL STYLE RULES:
        - FIDELITY: Respect the detected Gender, Age, and Subjects (including Pets) strictly.
        - HEAD HAIR: Render exactly as described.
        SCENE DETAILS: hyper-detailed textures, 1024x1024 resolution, 8k masterpiece, bokeh blurred background. 
        COMPOSITION: Feature all subjects described (Group shot if multiple subjects).`;

        console.log(`🎨 [Imagen 3] Rendering ${style} scene for: ${name}...`);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            generationConfig: { responseModalities: ["image", "text"] }
        });

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;

        if (!response.candidates || response.candidates.length === 0) {
            console.error("❌ [Imagen] No candidates returned from model. Response:", JSON.stringify(response));
            throw new Error('No image candidates returned');
        }

        const candidate = response.candidates[0];
        if (!candidate.content || !candidate.content.parts) {
            console.error("❌ [Imagen] Candidate has no content or parts. Candidate:", JSON.stringify(candidate));
            throw new Error('Image generation candidate is empty');
        }

        for (const part of candidate.content.parts) {
            if (part && part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }

        console.warn("⚠️ [Imagen] No inlineData found in parts. Content parts:", JSON.stringify(candidate.content.parts));
        throw new Error('No image data found in response parts');
    } catch (error) {
        console.error('❌ [Imagen] Error:', error);
        throw error;
    }
};

/**
 * OCR: Process invoice/receipt images
 */
export const processInvoiceWithGemini = async (base64String, retryCount = 0, apiKey = null) => {
    const genAI = getGenAI(apiKey);
    if (!genAI) throw new Error('Gemini API Key is missing.');

    const modelName = "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const mimeMatch = base64String.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = mimeMatch ? mimeMatch[2] : base64String;

    const prompt = `נתח את המסמך המצורף (חשבונית, תעודת משלוח, או הזמנה) וחלץ את כל הפריטים למערך JSON.

**חשוב מאוד:**
1. זהה את **סוג המסמך** - האם כתוב "חשבונית", "תעודת משלוח", "משלוח", "הזמנה" או אחר
2. חלץ את **התאריך שמופיע על המסמך** (לא תאריך של היום!) - חפש תאריך ליד "תאריך:", "ת.משלוח", "תאריך הפקה" וכו'
3. זהה את **שם הספק** בדיוק כפי שמופיע על המסמך (בראש המסמך, בלוגו, או בחותמת)

**המרת יחידות - קריטי!**
המערכת שלנו עובדת בגרמים. אם המחיר בחשבונית הוא "לק\"ג" או "לקילו" או "ל-1 ק\"ג":
- המר את המחיר מ-₪/ק"ג ל-₪/גרם על ידי חלוקה ב-1000
- לדוגמה: 29₪ לק"ג → price: 0.029, unit: "גרם", price_source: "kg"
- אם המחיר הוא ליחידה רגילה (פריט, קרטון, ליטר) - השאר כמו שהוא

עבור כל פריט, ספק את השדות הבאים:
- name: שם הפריט המלא בעברית (כולל משקל אם מופיע)
- category: קטגוריה מתאימה (חלבי, ירקות, קפואים, פירות, יבשים, משקאות)
- unit: יחידת מידה - אם המקור היה ק"ג, רשום "גרם"
- quantity: הכמות המספרית - אם הכמות היתה בק"ג, המר לגרמים (x1000)
- price: מחיר ליחידה אחת - אם המקור היה לק"ג, חלק ב-1000
- price_source: "kg" אם המחיר המקורי היה לקילו, "unit" אם היה ליחידה
- original_price_per_kg: המחיר המקורי לק"ג (רק אם price_source="kg")

החזר **רק** אובייקט JSON תקין בפורמט הבא:
{
  "document_type": "חשבונית" או "תעודת משלוח" או "הזמנה",
  "supplier_name": "שם הספק בדיוק כפי שמופיע על המסמך",
  "invoice_number": "מספר המסמך",  
  "document_date": "YYYY-MM-DD (התאריך שמופיע על המסמך!)",
  "total_amount": 0,
  "items": [
    { "name": "...", "category": "...", "unit": "גרם או יח' או ליטר", "quantity": 0, "price": 0, "price_source": "kg או unit", "original_price_per_kg": 0 }
  ]
}`;

    try {
        const result = await model.generateContent([
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);
        const response = await result.response;
        const content = response.text();
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        }
        return JSON.parse(cleanedContent);
    } catch (error) {
        console.error('❌ [OCR] Error:', error);
        throw error;
    }
};

/**
 * Step 3: Generate Video from Image (Google Veo 3.1 Preview)
 * Premium feature: Turns the static avatar into a 5-second cinematic video
 */
export const generateVideoWithVeo = async (base64Image, motionPrompt = "gentle movement, character breathing and smiling, cinematic lighting transitions", apiKey = null) => {
    const genAI = getGenAI(apiKey);
    if (!genAI) throw new Error('Gemini API Key missing');

    try {
        console.log("🎥 [Veo 3.1] Breathing life into the avatar...");

        // Using the latest Veo 3.1 preview model
        const model = genAI.getGenerativeModel({ model: "veo-3.1-generate-preview" });

        const mimeMatch = base64Image.match(/^data:([^;]+);base64,(.+)$/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64Data = mimeMatch ? mimeMatch[2] : base64Image;

        const result = await model.generateContent([
            { text: `Animate this character: ${motionPrompt}. Keep the style identical to the image. 5 seconds, high quality, smooth motion.` },
            { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);

        const response = await result.response;

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.mimeType.includes('video')) {
                    console.log("🎬 [Veo] Video generated successfully!");
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        // If direct video data isn't returned (preview/async behavior), we trigger the cinematic simulation
        console.warn("⚠️ [Veo] Video data not in direct response (Preview/Async mode). Using Pro-Sim mode.");
        await new Promise(resolve => setTimeout(resolve, 6000));
        return null;
    } catch (error) {
        console.error('❌ [Veo] Video generation error:', error);

        // Final fallback for the demo - we don't want to crash on 404 while the model is in rolling preview
        if (error.message.includes('404') || error.message.includes('not found')) {
            console.warn("🎬 [Veo] Preview model access pending/rolling out. Engaging Cinematic Pro Simulation for demo.");
            await new Promise(resolve => setTimeout(resolve, 5000));
            return null;
        }
        throw error;
    }
};

export default { analyzeImageTraits, generateImageWithGemini, processInvoiceWithGemini, generateVideoWithVeo };
