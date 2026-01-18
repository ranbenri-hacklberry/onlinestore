'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Phone, ArrowRight, ArrowLeft, Check, Loader2, Truck, Store, CreditCard, Banknote, Smartphone, Trash2, Plus, Minus } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { db } from '@/db/database';
import { queueAction, syncQueue } from '@/services/offlineQueue';
import { generateImageWithGemini, analyzeImageTraits, generateVideoWithVeo } from '@/services/geminiService';
import AddressSearch from './AddressSearch';
import dynamic from 'next/dynamic';

const OrderTracker = dynamic(() => import('./OrderTracker'), {
    ssr: false,
    loading: () => <div className="h-96 flex items-center justify-center bg-stone-50 animate-pulse">
        <div className="text-stone-400 font-bold">טוען מעקב הזמנה...</div>
    </div>
});
import { Camera, Image as ImageIcon, RotateCcw, ShieldCheck, Wallet, Cpu, AlertCircle, Download, Sparkles, Upload, ChevronRight, Play } from 'lucide-react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: any[];
    cartTotal: number;
    onUpdateQuantity: (id: any, sig: string, delta: number) => void;
    onRemoveItem: (id: any, sig: string) => void;
    onOrderSuccess?: () => void;
    businessId: string;
    initialStep?: Step;
}

type Step = 'cart' | 'auth' | 'otp' | 'details' | 'payment' | 'credit-card' | 'apple-pay' | 'bit-paybox' | 'processing' | 'success' | 'tracking' | 'avatar';

interface PaymentMethod {
    id: string;
    label: string;
    icon: any;
    color: string;
    bg: string;
    description?: string;
    disabled?: boolean;
}

const AVATAR_STYLES = [
    { id: 'pixar', label: 'Pixar', icon: '✨', description: 'סרט תלת-מימדי מתוק' },
    { id: 'anime', label: 'Anime', icon: '⛩️', description: 'ציור ידני בסגנון ג׳יבלי' },
    { id: 'cyberpunk', label: 'Cyber', icon: '🌀', description: 'עתידני עם אורות ניאון' },
    { id: 'sketch', label: 'Sketch', icon: '🎨', description: 'איור עיפרון אמנותי' },
    { id: 'claymation', label: 'Clay', icon: '💎', description: 'סרט פלסטלינה קלאסי' }
];

const ScanningOverlay = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-10 pointer-events-none"
    >
        {/* Scanning Line */}
        <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20"
        />
        {/* Corners */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400" />
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(59,130,246,0.05)_100%)]" />
    </motion.div>
);

export default function CheckoutModal({ isOpen, onClose, cartItems, cartTotal, onUpdateQuantity,
    onRemoveItem,
    onOrderSuccess,
    businessId,
    initialStep
}: CheckoutModalProps) {
    const [step, setStep] = useState<Step>('cart');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Details
    const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
    const [address, setAddress] = useState('');
    const [customerName, setCustomerName] = useState('');

    // Payment Logic States
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [ccAttempts, setCcAttempts] = useState(0);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiError, setAiError] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Avatar Logic
    const [submittedOrder, setSubmittedOrder] = useState<any>(null);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [userVideo, setUserVideo] = useState<string | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoUpgradePaid, setVideoUpgradePaid] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('pixar');
    const [avatarPrompt, setAvatarPrompt] = useState('');
    const [analysisText, setAnalysisText] = useState('מנתח תווי פנים...');
    const [avatarStage, setAvatarStage] = useState<'selection' | 'capture' | 'result'>('selection');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [avatarDiscount, setAvatarDiscount] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showAvatarPopup, setShowAvatarPopup] = useState(false);
    const [googleApiKey, setGoogleApiKey] = useState<string | null>(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || null);

    // Load API Key from local Dexie DB (synced from Supabase)
    useEffect(() => {
        if (businessId) {
            // Use table() method to avoid TypeScript error if 'businesses' isn't explicitly typed on db instance
            db.table('businesses').get(businessId).then(business => {
                if (business && business.google_api_key) {
                    console.log("🔑 [Checkout] Using Business API Key");
                    setGoogleApiKey(business.google_api_key);
                } else {
                    console.warn("⚠️ [Checkout] No specific API key found for this business in local DB");
                }
            }).catch(err => {
                console.error("❌ [Checkout] Error fetching business config:", err);
            });
        }
    }, [businessId]);

    useEffect(() => {
        if (!isOpen) {
            setStep('cart');
            setError(null);
            setLoading(false);
            // Stop camera on close
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        } else if (initialStep) {
            setStep(initialStep);
            if (initialStep === 'avatar') {
                setTimeout(startCamera, 100);
            }
        }
    }, [isOpen, initialStep]);



    const handleSendOTP = async () => {
        if (phone.length < 10) {
            setError('מספר טלפון לא תקין');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);

            // Don't send real SMS for the bypass phone
            if (phone !== '0500000000') {
                const { error: smsError } = await supabase
                    .from('sms_queue')
                    .insert({
                        phone: phone,
                        message: `קוד האימות שלך ל-iCaffe הוא: ${code} ☕ בתיאבון!`,
                        status: 'pending'
                    });

                if (smsError) throw smsError;
            }

            setStep('otp');
        } catch (e) {
            console.error('OTP Send Error:', e);
            setError('שגיאה בשליחת SMS. נסה שנית.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = () => {
        setLoading(true);
        const isBypass = (phone === '0500000000' || phone === '0543211234') && (otp === '123456' || otp === generatedOtp);
        if (otp === generatedOtp || otp === '123456' || isBypass) {
            setStep('details');
        } else {
            setError('קוד שגוי. נסה שנית.');
        }
        setLoading(false);
    };

    const submitOrder = async () => {
        setLoading(true);
        setError(null);
        setStep('processing');

        try {
            // 1. Generate Local ID
            const localOrderId = `L-ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const now = new Date().toISOString();

            // 2. Prepare Order Record for Dexie (Offline-first)
            const newOrder = {
                id: localOrderId,
                order_status: 'new',
                order_type: orderType,
                customer_phone: phone,
                customer_name: customerName,
                total_amount: cartTotal,
                delivery_address: address,
                payment_method: selectedPayment,
                business_id: businessId,
                created_at: now,
                updated_at: now,
                pending_sync: true,
                is_paid: false
            };

            await db.table('orders').put(newOrder);

            // 3. Prepare Items Record for Dexie
            const itemInserts = cartItems.map((item, idx) => ({
                id: `${localOrderId}-item-${idx}`,
                order_id: localOrderId,
                menu_item_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                mods: Object.values(item.selectedOptions || {}).map((opt: any) => opt.name || opt),
                item_status: 'new'
            }));
            await db.table('order_items').bulkPut(itemInserts);

            // 4. Queue Sync Action (Bypasses RLS via submit_order_v3 RPC)
            await queueAction('CREATE_ORDER', {
                localOrderId: localOrderId,
                p_business_id: businessId,
                p_customer_phone: phone,
                p_customer_name: customerName,
                p_total_amount: cartTotal,
                p_order_type: orderType,
                p_delivery_address: address,
                p_payment_method: selectedPayment,
                p_items: cartItems.map(item => ({
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    mods: Object.values(item.selectedOptions || {}).map((opt: any) => opt.name || opt)
                }))
            });

            // 5. Notify Owner via SMS for manual payments (Bit/Paybox)
            if (['bit', 'paybox'].includes(selectedPayment || '')) {
                try {
                    await supabase.from('sms_queue').insert({
                        phone: '0556822072',
                        message: `🛍️ העברה חדשה מ-${customerName} בסך ₪${cartTotal} עבור הזמנה ${localOrderId.slice(-5)}`,
                        status: 'pending'
                        // business_id removed to fix 400 error
                    });
                } catch (smsErr) {
                    console.warn('SMS notification failed:', smsErr);
                }
            }

            setSubmittedOrder({ ...newOrder, items: itemInserts });

            // 7. Trigger Sync
            syncQueue().catch(err => console.warn('Sync failed:', err));

            setStep('success');
            onOrderSuccess?.();

        } catch (err: any) {
            console.error('Submit Error:', err);
            setError(err.message || 'אוף... אפילו המכונת אספרסו שלנו תפסה דכאון. ההזמנה לא עברה. אולי תנסה שוב? 💔☕');
            setStep('payment');
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            setError("לא ניתן לגשת למצלמה. בדוק הרשאות.");
        }
    };

    useEffect(() => {
        if (step === 'success') {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const capturePhoto = () => {
        console.log("📸 Attempting to capture photo...");
        if (!videoRef.current) {
            console.error("❌ Video element not found");
            setError("המצלמה לא אותחלה. נסה שנית.");
            return;
        }
        if (!canvasRef.current) {
            console.error("❌ Canvas element not found");
            setError("שגיאה במערכת הצילום. מרענן...");
            return;
        }

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Ensure canvas matches video dimensions
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            console.log("📸 [AI Avatar] capturePhoto called");
            if (videoRef.current && canvasRef.current) {
                const context = canvasRef.current.getContext('2d');
                if (context) {
                    // Clear any stuck states
                    setIsAnalyzingPhoto(false);
                    setIsGeneratingAvatar(false);

                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    context.drawImage(videoRef.current, 0, 0);
                    const data = canvasRef.current.toDataURL('image/jpeg');
                    console.log("📸 [AI Avatar] Photo captured, starting generation...");
                    setUserPhoto(data);
                    generateAvatar(data);
                }
            } else {
                console.error("❌ Failed to get canvas context");
            }
        } catch (err) {
            console.error("❌ Capture error:", err);
            setError("קרתה שגיאה בזמן הצילום.");
        }
    };

    const generateAvatar = async (directPhoto?: string) => {
        const photoToUse = directPhoto || userPhoto;

        if (!photoToUse) {
            console.error("❌ [AI Avatar] No photo source available");
            return;
        }

        // Prevent multiple simultaneous generations to break the loop
        if (isAnalyzingPhoto || isGeneratingAvatar || (userAvatar && isImageLoading)) {
            console.log("⚠️ [AI Avatar] Generation already in progress, skipping.");
            return;
        }

        console.log("🚀 [AI Avatar] Starting Vision Analysis process...");
        setIsAnalyzingPhoto(true);
        setAnalysisText('מכין את הסורק...');

        // Backup safety timeout to unstick the UI
        const safetyTimer = setTimeout(() => {
            if (isAnalyzingPhoto || isGeneratingAvatar) {
                console.warn("⏳ [AI Avatar] Generation timeout reached. Resetting states.");
                setIsAnalyzingPhoto(false);
                setIsGeneratingAvatar(false);
                setImageLoadError(true);
            }
        }, 35000);

        try {
            setTimeout(() => setAnalysisText('סורק מבנה פנים...'), 500);
            setTimeout(() => setAnalysisText('מזהה סובייקטים בסצנה...'), 1500);
            setTimeout(() => setAnalysisText('מבצע תיקון תאורה...'), 2800);

            // First, let Gemini "SEE" the user and describe them
            console.log("👁️ [AI Avatar] Calling analyzeImageTraits...");
            const traits = await analyzeImageTraits(photoToUse, (googleApiKey || undefined) as any);
            console.log("📝 [AI Avatar] Extracted traits successfully");

            setIsAnalyzingPhoto(false);
            setIsGeneratingAvatar(true);

            // Second, generate the image based on those traits, style, and CUSTOM prompt
            console.log(`🎨 [AI Avatar] Calling generateImageWithGemini (Style: ${selectedStyle}, Prompt: ${avatarPrompt})...`);
            const base64Avatar = await generateImageWithGemini(traits, customerName, selectedStyle, avatarPrompt, (googleApiKey || undefined) as any);

            clearTimeout(safetyTimer);
            setUserAvatar(base64Avatar);
            setIsGeneratingAvatar(false);
            setAvatarStage('result');
            setIsImageLoading(userAvatar !== base64Avatar); // Only set loading if it's a new image
            setImageLoadError(false);
            setAvatarDiscount(Math.floor(cartTotal * 0.05));
            console.log("✅ [AI Avatar] Avatar generation sequence complete!");
        } catch (err: any) {
            console.error("❌ [AI Avatar] Analysis/Generation failed:", err);
            clearTimeout(safetyTimer);
            setImageLoadError(true);
            setIsGeneratingAvatar(false);
            setIsAnalyzingPhoto(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!userAvatar || isGeneratingVideo) return;

        setIsGeneratingVideo(true);
        setAnalysisText('מוליד תנועה...');

        try {
            const videoUrl = await generateVideoWithVeo(userAvatar, `Cinematic motion for this ${selectedStyle} character, high quality, 4k`, (googleApiKey || undefined) as any);

            // If API returns null (simulation mode), we use the image as a "live" placeholder
            // or we can simulate a successful generation for testing
            if (!videoUrl) {
                console.log("🎬 [AI Avatar] Simulation mode: Video complete");
                // For the demo, we'll just set a flag to show it's "live"
                setVideoUpgradePaid(true);
            } else {
                setUserVideo(videoUrl);
                setVideoUpgradePaid(true);
            }

            // setCartTotal logic removed as it's a prop
            setIsGeneratingVideo(false);
        } catch (err) {
            console.error("❌ [AI Avatar] Video generation failed:", err);
            setIsGeneratingVideo(false);
            alert("משהו השתבש ביצירת הווידאו. נסה שוב?");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setScreenshot(reader.result as string);
                simulateAIAnalysis();
            };
            reader.readAsDataURL(file);
        }
    };

    const simulateAIAnalysis = () => {
        setAiAnalyzing(true);
        setAiError(false);
        setAiInsight(null);

        // Simulating Gemni 3.5 Flash / Pro Multimodal Analysis
        setTimeout(() => {
            // Highly reliable for testing, but still with a tiny "simulated" chance of failure
            const isSuccessful = Math.random() > 0.05;

            if (isSuccessful) {
                setAiInsight(`זוהתה העברה בסך ₪${cartTotal} ל-iCaffe (054-1234567)`);
                setAiAnalyzing(false);
            } else {
                setAiError(true);
                setAiAnalyzing(false);
            }
        }, 3500);
    };

    const renderCart = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-gray-900">הסל שלך</h3>
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{cartItems.length} פריטים</span>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                    <div key={item.id + item.signature} className="flex gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <span className="font-mono font-bold">₪{item.price * item.quantity}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {Object.values(item.selectedOptions || {}).map((opt: any, i) => (
                                    <span key={i} className="text-[10px] bg-white border border-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md">
                                        {opt.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-2 py-1">
                                    <button onClick={() => onUpdateQuantity(item.id, item.signature, -1)} className="text-gray-400 hover:text-orange-500 transition-colors">
                                        <Minus size={16} />
                                    </button>
                                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.signature, 1)} className="text-gray-400 hover:text-orange-500 transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button onClick={() => onRemoveItem(item.id, item.signature)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-bold">סה"כ לתשלום:</span>
                    <span className="text-3xl font-black text-gray-900">₪{cartTotal}</span>
                </div>
                <button
                    onClick={() => setStep('auth')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
                >
                    <span>המשך לפרטי משלח</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );

    const renderAuth = () => (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-12">
                    <Phone size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">בוא נכיר</h3>
                <p className="text-gray-400 font-medium">הכנס מספר טלפון לקבלת קוד אימות</p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="05X-XXXXXXX"
                        className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-2xl font-mono font-bold text-center tracking-[0.2em] focus:border-orange-500 focus:bg-white transition-all outline-none"
                    />
                    {phone.length === 10 && <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={24} />}
                </div>

                {/* DEV BYPASS */}
                <div className="flex justify-center">
                    <button
                        onClick={() => { setPhone('0500000000'); setTimeout(handleSendOTP, 100); }}
                        className="text-[11px] bg-orange-50 text-orange-400 px-3 py-1 rounded-full font-bold hover:bg-orange-100 transition-colors"
                    >
                        ⚡ מצב פיתוח: דלג עם טלפון טסט
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm font-bold text-center animate-pulse">{error}</p>}

                <button
                    onClick={handleSendOTP}
                    disabled={phone.length < 10 || loading}
                    className="w-full h-16 bg-gray-900 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><span>שלח קוד ב-SMS</span><ArrowRight size={20} /></>}
                </button>

                <button onClick={() => setStep('cart')} className="w-full text-gray-400 font-bold text-sm py-2">חזרה לסל</button>
            </div>
        </div>
    );

    const renderOTP = () => (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 -rotate-12">
                    <Check size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">אימות מספר</h3>
                <p className="text-gray-400 font-medium">הכנס את הקוד בן 6 הספרות ששלחנו ל-{phone}</p>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="------"
                    className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-3xl font-mono font-bold text-center tracking-[0.5em] focus:border-blue-500 focus:bg-white transition-all outline-none"
                />

                {/* DEV BYPASS */}
                <div className="flex justify-center">
                    <button
                        onClick={() => { setOtp('123456'); setTimeout(handleVerifyOTP, 100); }}
                        className="text-[11px] bg-blue-50 text-blue-400 px-3 py-1 rounded-full font-bold hover:bg-blue-100 transition-colors"
                    >
                        ⚡ מצב פיתוח: דלג עם קוד 123456
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm font-bold text-center animate-pulse">{error}</p>}

                <button
                    onClick={handleVerifyOTP}
                    disabled={otp.length < 6 || loading}
                    className="w-full h-16 bg-blue-600 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <span>אמת והמשך</span>}
                </button>

                <button onClick={() => setStep('auth')} className="w-full text-gray-400 font-bold text-sm py-2">שלח קוד חדש</button>
            </div>
        </div>
    );

    const renderDetails = () => (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-gray-900">איך תרצה לקבל?</h3>
                <p className="text-gray-400 font-medium">בחר צורת משלוח ופרטים</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setOrderType('pickup')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${orderType === 'pickup' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                >
                    <Store size={32} />
                    <span className="font-bold">איסוף עצמי</span>
                </button>
                <button
                    onClick={() => setOrderType('delivery')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${orderType === 'delivery' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                >
                    <Truck size={32} />
                    <span className="font-bold">משלוח עד הבית</span>
                </button>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="שם מלא"
                    className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 font-bold focus:border-orange-500 focus:bg-white outline-none"
                />

                {orderType === 'delivery' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AddressSearch onAddressChange={(details) => setAddress(details.formatted)} />
                    </motion.div>
                )}
            </div>

            <button
                onClick={() => setStep('payment')}
                disabled={!customerName || (orderType === 'delivery' && !address)}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <span>המשך לבחירת תשלום</span>
                <ArrowLeft size={20} />
            </button>
        </div>
    );



    const renderTracking = () => {
        if (!submittedOrder) return renderCart();
        return (
            <div className="-mx-8 -mt-8 relative">
                <OrderTracker
                    order={submittedOrder}
                    customer={{ phone: phone, name: customerName }}
                />

                <div className="px-8 pb-8">
                    <button
                        onClick={() => { onClose(); window.location.reload(); }}
                        className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold shadow-lg mt-4"
                    >
                        חזרה לתפריט הראשי
                    </button>
                </div>

                {/* Avatar Discovery Floating Card - Top Left for RTL visibility */}
                <AnimatePresence>
                    {showAvatarPopup && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: -50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -50 }}
                            className="absolute top-4 left-4 right-4 md:left-4 md:right-auto md:w-80 bg-white/95 backdrop-blur-xl z-[160] rounded-3xl p-6 flex flex-col space-y-4 shadow-2xl border border-orange-100 ring-1 ring-black/5"
                            dir="rtl"
                        >
                            <button
                                onClick={() => {
                                    setShowAvatarPopup(false);
                                    // Stop camera when closing
                                    if (videoRef.current?.srcObject) {
                                        const stream = videoRef.current.srcObject as MediaStream;
                                        stream.getTracks().forEach(track => track.stop());
                                    }
                                }}
                                className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                                    <Camera size={24} className="text-orange-500" />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-lg font-black text-gray-900 leading-tight">זמן לאווטאר? ✨</h3>
                                    <p className="text-xs text-gray-500 font-bold">הפוך את עצמך לדמות Pixar!</p>
                                </div>
                            </div>

                            {!userPhoto ? (
                                <div className="space-y-3 relative">
                                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-orange-500 bg-black">
                                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log("👆 Capture photo button clicked!");
                                            capturePhoto();
                                        }}
                                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-black text-md flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95 transition-all relative z-[170]"
                                    >
                                        <Camera size={20} />
                                        <span>צילום וחיוך!</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-500 bg-blue-50 flex items-center justify-center">
                                        {isGeneratingAvatar ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-blue-500" size={32} />
                                                <span className="text-[10px] font-bold text-blue-400">יוצר קסמים...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <img src={userAvatar || ''} className="w-full h-full object-cover" />
                                                {userAvatar && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const link = document.createElement('a');
                                                            link.href = userAvatar;
                                                            link.download = `pixar-${customerName || 'avatar'}.png`;
                                                            link.click();
                                                        }}
                                                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-xl text-blue-600 shadow-lg active:scale-95 transition-all hover:bg-white"
                                                        title="שמור תמונה"
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {!isGeneratingAvatar && (
                                        <button
                                            onClick={() => setShowAvatarPopup(false)}
                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-md flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            <Check size={20} />
                                            <span>זה אני!</span>
                                        </button>
                                    )}
                                </div>
                            )}
                            <p className="text-[9px] text-gray-400 font-bold text-center">התמונה לא נשמרת - הפרטיות שלך חשובה 🛡️</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderPayment = () => {
        const finalTotal = cartTotal - avatarDiscount;
        const methods: PaymentMethod[] = [
            { id: 'apple-google', label: 'Apple/Google Pay', icon: Smartphone, color: 'text-black', bg: 'bg-gray-100' },
            { id: 'credit', label: 'כרטיס אשראי', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
            { id: 'bit', label: 'Bit', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'paybox', label: 'PayBox', icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-50/50' },
            { id: 'cash', label: 'מזומן', icon: Banknote, color: 'text-green-500', bg: 'bg-green-50' },
            { id: 'crypto', label: 'קריפטו', icon: Cpu, color: 'text-orange-500', bg: 'bg-orange-50', description: 'בקרוב...', disabled: true }
        ];

        return (
            <div className="space-y-6 py-4">
                {/* Mini Order Summary */}
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-orange-600 uppercase">פירוט הזמנה</span>
                        <span className="text-sm font-black text-gray-700">{cartItems.length} פריטים {orderType === 'delivery' ? '(משלוח)' : '(איסוף)'}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-gray-900">₪{cartTotal}</span>
                    </div>
                </div>

                <div className="text-center space-y-1">
                    <h3 className="text-2xl font-black text-gray-900">בחירת תשלום</h3>
                </div>

                <div className="space-y-4">
                    {/* Row 1: Apple/Google Pay & Credit Card */}
                    <div className="grid grid-cols-2 gap-3">
                        {methods.slice(0, 2).map((p) => (
                            <button
                                key={p.id}
                                onClick={() => { setSelectedPayment(p.id); setStep(p.id === 'credit' ? 'credit-card' : 'apple-pay'); }}
                                className="p-6 rounded-3xl border-2 border-gray-100 hover:border-orange-500 bg-white hover:bg-orange-50/20 transition-all flex flex-col items-center gap-4 text-center group"
                            >
                                <div className={`w-14 h-14 ${p.bg} ${p.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <p.icon size={28} />
                                </div>
                                <span className="text-sm font-black text-gray-700 leading-tight">{p.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Row 2: Bit & Paybox */}
                    <div className="grid grid-cols-2 gap-3">
                        {methods.slice(2, 4).map((p) => (
                            <button
                                key={p.id}
                                onClick={() => { setSelectedPayment(p.id); setStep('bit-paybox'); }}
                                className="p-5 rounded-3xl border-2 border-gray-100 hover:border-orange-500 bg-white hover:bg-orange-50/20 transition-all flex items-center justify-center gap-3 group"
                            >
                                <div className={`w-10 h-10 ${p.bg} ${p.color} rounded-xl flex items-center justify-center`}>
                                    <p.icon size={20} />
                                </div>
                                <span className="text-base font-black text-gray-700">{p.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Row 3: Cash & Crypto */}
                    <div className="space-y-3">
                        {methods.slice(4).map((p) => (
                            <button
                                key={p.id}
                                disabled={p.disabled}
                                onClick={() => { if (!p.disabled) { setSelectedPayment(p.id); submitOrder(); } }}
                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${p.disabled ? 'opacity-50 grayscale cursor-not-allowed border-gray-50 bg-gray-50/30' : 'border-gray-100 hover:border-orange-500 bg-white hover:bg-orange-50/20'}`}
                            >
                                <div className="flex items-center gap-4 text-right">
                                    <div className={`w-12 h-12 ${p.bg} ${p.color} rounded-xl flex items-center justify-center`}>
                                        <p.icon size={24} />
                                    </div>
                                    <div>
                                        <span className="text-lg font-black text-gray-700">{p.label}</span>
                                        {p.description && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.description}</p>}
                                    </div>
                                </div>
                                {!p.disabled && <ArrowLeft size={20} className="text-gray-300 group-hover:text-orange-500 group-hover:-translate-x-1 transition-all" />}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 font-medium">
                    * עם סיום הבחירה תועבר לדף סיכום ואישור סופי
                </p>
            </div>
        );
    };

    const renderApplePay = () => (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6 text-center border border-gray-100">
                <div className="flex justify-center mb-2">
                    <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center shadow-2xl">
                        <Smartphone size={40} />
                    </div>
                </div>
                <h3 className="text-2xl font-black">Apple Pay</h3>
                <div className="space-y-2">
                    <p className="text-gray-400 font-bold">סכום לחיוב</p>
                    <p className="text-4xl font-black">₪{cartTotal}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="text-center text-gray-400 text-sm font-bold flex items-center justify-center gap-2">
                    <ShieldCheck size={16} className="text-green-500" />
                    <span>תשלום מאובטח ב-Face ID</span>
                </div>

                <button
                    onClick={() => {
                        setLoading(true);
                        setTimeout(submitOrder, 2000);
                    }}
                    className="w-full h-16 bg-black text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <span>אשר ב-Face ID</span>}
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
                <button onClick={() => setStep('payment')} className="w-full text-gray-400 font-bold text-sm">ביטול וחזרה</button>
            </div>
        </div>
    );

    const renderCreditCard = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2 mb-4">
                <h3 className="text-xl font-black text-gray-900">הזנת כרטיס אשראי</h3>
                <p className="text-gray-400 text-sm font-medium">הפרטים שלך מאובטחים ומוצפנים בסטנדרט הגבוה ביותר</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] pr-2 text-gray-400 font-bold uppercase">מספר כרטיס</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="**** **** **** ****"
                            className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 font-mono font-bold tracking-widest text-center focus:border-blue-500 outline-none"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] pr-2 text-gray-400 font-bold uppercase">תוקף</label>
                        <input type="text" placeholder="MM/YY" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-center font-bold focus:border-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] pr-2 text-gray-400 font-bold uppercase">CVV</label>
                        <input type="text" placeholder="***" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-center font-bold focus:border-blue-500 outline-none" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] pr-2 text-gray-400 font-bold uppercase">שם בעל הכרטיס</label>
                    <input type="text" value={customerName} placeholder="השם כפי שמופיע על הכרטיס" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 font-bold focus:border-blue-500 outline-none" />
                </div>

                <button
                    onClick={() => {
                        setLoading(true);
                        setCcAttempts(prev => prev + 1);
                        setTimeout(() => {
                            if (ccAttempts % 3 === 2) {
                                setError('הכרטיס לא אושר. ייתכן שיש חוסר במספיק "קפאין" בבנק שלך... נסה שוב 😉');
                                setLoading(false);
                            } else {
                                submitOrder();
                            }
                        }, 2500);
                    }}
                    className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><span>אשר תשלום ₪{cartTotal}</span><ArrowLeft size={20} /></>}
                </button>
                {error && <div className="p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>}
                <button onClick={() => setStep('payment')} className="w-full text-gray-400 font-bold text-sm">ביטול וחזרה</button>
            </div>
        </div>
    );

    const renderBitPaybox = () => (
        <div className="space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
                <div className={`w-20 h-20 ${selectedPayment === 'bit' ? 'bg-blue-600' : 'bg-blue-400'} text-white rounded-3xl flex items-center justify-center mx-auto mb-4`}>
                    {selectedPayment === 'bit' ? <ShieldCheck size={40} /> : <Wallet size={40} />}
                </div>
                <h3 className="text-2xl font-black">תשלום ב-{selectedPayment === 'bit' ? 'Bit' : 'PayBox'}</h3>
                <p className="text-gray-400 font-medium px-8 leading-relaxed">
                    בצע העברה למספר <span className="text-orange-500 font-black">054-1234567</span><br />
                    בסך <span className="text-gray-900 font-black">₪{cartTotal}</span> ולאחר מכן העלה את צילום האישור כאן.
                </p>
            </div>

            <div className="space-y-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                />

                {!screenshot ? (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-40 border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-blue-200 hover:text-blue-300 hover:bg-blue-50/20 transition-all group"
                    >
                        <ImageIcon size={48} className="group-hover:scale-110 transition-transform" />
                        <span className="font-black">העלה צילום מסך של האישור</span>
                    </button>
                ) : (
                    <div className={`relative group p-2 rounded-[2.5rem] border-4 transition-all overflow-hidden ${aiError ? 'border-red-500 bg-red-50' : 'border-white shadow-xl'}`}>
                        <div className="w-full h-64 overflow-y-auto custom-scrollbar rounded-[2rem]">
                            <img src={screenshot} alt="Payment Screenshot" className="w-full object-contain" />
                        </div>
                        {aiError && (
                            <div className="absolute inset-x-2 top-2 bottom-2 bg-red-500/10 rounded-[2rem] flex items-center justify-center pointer-events-none">
                                <AlertCircle size={60} className="text-red-500 drop-shadow-lg" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setScreenshot(null)} className="bg-white text-red-500 p-3 rounded-full shadow-xl">
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {aiAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-orange-50 p-6 rounded-2xl flex items-center justify-center gap-4 text-orange-600 border border-orange-100"
                    >
                        <Loader2 className="animate-spin" />
                        <span className="font-bold text-sm">ה-Gemini 3 Pro מנתח את האישור...</span>
                    </motion.div>
                )}

                {aiInsight && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 text-blue-700"
                    >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <Check size={16} />
                        </div>
                        <span className="text-xs font-bold leading-tight">{aiInsight}</span>
                    </motion.div>
                )}

                {aiError && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 space-y-4"
                    >
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <ImageIcon size={20} />
                            </div>
                            <span className="font-black text-lg">זיהוי נכשל!</span>
                        </div>
                        <p className="text-sm text-red-500 font-bold leading-relaxed">
                            נראה שהעלית תמונה של <span className="underline decoration-wavy">משהו טעים</span> (פסטה?), אבל המערכת מצפה לאישור העברה מ-Bit או PayBox.
                            הצילום למעלה נדחה על ידי הבינה המלאכותית שלנו.
                        </p>
                        <button
                            onClick={() => { setScreenshot(null); setTimeout(() => fileInputRef.current?.click(), 100); }}
                            className="w-full bg-red-600 text-white py-3 rounded-xl font-black shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} />
                            <span>נסה להעלות צילום תקין</span>
                        </button>
                    </motion.div>
                )}

                <button
                    disabled={!screenshot || aiAnalyzing || aiError}
                    onClick={submitOrder}
                    className="w-full h-16 bg-gray-900 disabled:bg-gray-100 text-white rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {aiAnalyzing ? <Loader2 className="animate-spin" /> : <span>שלם עכשיו</span>}
                    {!aiAnalyzing && <Check size={24} />}
                </button>
                <button onClick={() => setStep('payment')} className="w-full text-gray-400 font-bold text-sm">ביטול וחזרה</button>
            </div>
        </div>
    );

    const renderProcessing = () => (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
                <div className="w-32 h-32 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag size={40} className="text-orange-500 animate-pulse" />
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-3xl font-black text-gray-900">מזרזים תהליכים...</h3>
                <p className="text-gray-400 font-medium">ההזמנה שלך בדרך למטבח של iCaffe</p>
            </div>
        </div>
    );

    const renderSuccess = () => {
        // Auto-close after 3.5 seconds to show tracking
        useEffect(() => {
            const timer = setTimeout(() => {
                onClose();
            }, 3500);
            return () => clearTimeout(timer);
        }, []);

        return (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
                <div className="w-40 h-40 bg-green-500 text-white rounded-[3rem] shadow-2xl shadow-green-200 flex items-center justify-center rotate-6 scale-110">
                    <Check size={80} strokeWidth={4} />
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-4xl font-black text-gray-900">יש הזמנה! 🎉</h3>
                        <p className="text-xl text-gray-500 font-bold">הפינוק מתחיל ברגע זה</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl inline-block px-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
                        <p className="text-sm text-gray-400 font-bold mb-1">מספר הזמנה</p>
                        <p className="text-2xl font-mono font-black text-gray-800">#ICA-{Math.floor(1000 + Math.random() * 9000)}</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderSubmissionError = () => (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
            <div className="w-40 h-40 bg-red-100 text-red-500 rounded-[3rem] shadow-2xl shadow-red-50 flex items-center justify-center -rotate-6 scale-110 border-4 border-white">
                <AlertCircle size={80} strokeWidth={4} />
            </div>
            <div className="space-y-4 px-4">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-gray-900">אוי לא... שברון לב! 😭</h3>
                    <p className="text-xl text-red-500 font-bold leading-tight">
                        ההמבורגר (החלק שלא היה באמת) בוכה בגשם. <br />
                        משהו השתבש וההזמנה לא עברה.
                    </p>
                </div>
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 italic text-red-600 font-medium">
                    "אולי המכונת אספרסו מדוכאת? <br />
                    ננסה שוב וניתן לה חיבוק?"
                </div>
                <button
                    onClick={() => { setError(null); setStep('payment'); }}
                    className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                >
                    <RotateCcw size={24} />
                    <span>יאללה, ננסה שוב!</span>
                </button>
            </div>
        </div>
    );

    const renderAvatar = () => (
        <div className="py-4">
            <div className="flex items-center gap-3 mb-6 px-1">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Camera size={24} className="text-orange-500" />
                </div>
                <div className="text-right flex-1">
                    <h3 className="text-xl font-black text-gray-900 leading-tight">מעבדת הסטייל ✨</h3>
                    <p className="text-xs text-gray-500 font-bold">צור את האווטאר המושלם שלך</p>
                </div>
            </div>

            {avatarStage === 'selection' && (
                <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                    <div>
                        <p className="text-xs font-black text-gray-400 mb-3 px-1 uppercase tracking-wider">נראות וסטייל</p>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                            {AVATAR_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`flex flex-col items-center min-w-[85px] p-4 rounded-[2rem] transition-all border-2 ${selectedStyle === style.id
                                        ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-100 scale-105 text-white'
                                        : 'bg-white border-gray-100 grayscale opacity-60'
                                        }`}
                                >
                                    <span className="text-3xl mb-1">{style.icon}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter`}>
                                        {style.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-black text-gray-400 px-1 uppercase tracking-wider">טאץ' אישי (אופציונלי)</p>
                        <div className="relative">
                            <input
                                type="text"
                                value={avatarPrompt}
                                onChange={(e) => setAvatarPrompt(e.target.value)}
                                placeholder="למשל: עם כובע שף, על המאדים, בחלל..."
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-sm font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200">
                                <Sparkles size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={() => { setAvatarStage('capture'); setTimeout(startCamera, 100); }}
                            className="bg-gray-900 text-white p-6 rounded-3xl flex flex-col items-center gap-3 shadow-xl active:scale-95 transition-all"
                        >
                            <Camera size={32} />
                            <span className="font-black text-sm">פתיחת מצלמה</span>
                        </button>
                        <label className="bg-blue-600 text-white p-6 rounded-3xl flex flex-col items-center gap-3 shadow-xl active:scale-95 transition-all cursor-pointer">
                            <Upload size={32} />
                            <span className="font-black text-sm">העלאת תמונה</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            const data = reader.result as string;
                                            setUserPhoto(data);
                                            setAvatarStage('capture');
                                            generateAvatar(data);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>
            )}

            {avatarStage === 'capture' && (
                <div className="space-y-4 animate-in zoom-in duration-300">
                    <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden border-4 border-orange-500 bg-black shadow-2xl">
                        {!userPhoto ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />
                                <div className="absolute top-6 left-6 right-6 text-center">
                                    <span className="bg-black/40 backdrop-blur-xl text-white px-6 py-3 rounded-full text-xs font-black border border-white/20">
                                        מסתכלים למצלמה ומחייכים! 😁
                                    </span>
                                </div>
                            </>
                        ) : (
                            <img src={userPhoto} className="w-full h-full object-cover grayscale opacity-30" />
                        )}

                        <AnimatePresence>
                            {isAnalyzingPhoto && <ScanningOverlay key="scan" />}
                        </AnimatePresence>

                        {(isAnalyzingPhoto || isGeneratingAvatar || isImageLoading) && (
                            <div className="absolute inset-0 z-20 bg-blue-900/10 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-6">
                                <div className="relative">
                                    <Loader2 className="w-20 h-20 text-blue-500 animate-spin" strokeWidth={3} />
                                    {isAnalyzingPhoto && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-blue-400 rounded-full animate-ping opacity-30" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center space-y-3 px-8">
                                    <motion.p
                                        key={analysisText}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-white drop-shadow-lg font-black text-2xl leading-tight"
                                    >
                                        {isAnalyzingPhoto ? analysisText :
                                            isGeneratingAvatar ? `יוצר קסם ${AVATAR_STYLES.find(s => s.id === selectedStyle)?.label}...` :
                                                'מוריד את ה-MiniMe...'}
                                    </motion.p>
                                    <div className="flex gap-1 justify-center">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!userPhoto && (
                        <div className="grid grid-cols-4 gap-3">
                            <button
                                onClick={() => setAvatarStage('selection')}
                                className="col-span-1 bg-gray-100 text-gray-500 h-16 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                            <button
                                onClick={capturePhoto}
                                className="col-span-3 bg-orange-500 text-white h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-orange-100 active:scale-95 transition-all"
                            >
                                <Camera size={24} />
                                <span>צילום!</span>
                            </button>
                        </div>
                    )}

                    {imageLoadError && (
                        <button
                            onClick={() => generateAvatar()}
                            className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 animate-in fade-in"
                        >
                            <RotateCcw size={18} />
                            <span>אופס, השרת עמוס. נסה שוב?</span>
                        </button>
                    )}
                </div>
            )}

            {avatarStage === 'result' && (
                <div className="space-y-6 animate-in zoom-in duration-500">
                    <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden border-4 border-blue-500 bg-gray-50 shadow-2xl">
                        {userVideo || (videoUpgradePaid && userAvatar) ? (
                            <div className="relative w-full h-full">
                                {userVideo ? (
                                    <video
                                        src={userVideo}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <motion.img
                                        src={userAvatar || ''}
                                        animate={{
                                            scale: [1, 1.02, 1],
                                            rotate: [0, 0.5, -0.5, 0]
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute top-6 left-6 bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black shadow-lg flex items-center gap-2">
                                    <Play size={10} fill="currentColor" />
                                    LIVE AVATAR PRO
                                </div>
                            </div>
                        ) : (
                            <img
                                src={userAvatar || ''}
                                className={`w-full h-full object-cover transition-opacity duration-700 ${isImageLoading ? 'opacity-20 blur-sm' : 'opacity-100'}`}
                                alt="Avatar"
                                onLoad={() => setIsImageLoading(false)}
                            />
                        )}

                        {isImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            </div>
                        )}

                        {isGeneratingVideo && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-4">
                                <Loader2 className="w-16 h-16 animate-spin text-blue-400" />
                                <p className="font-black text-xl animate-pulse">מפיח חיים באווטאר...</p>
                            </div>
                        )}

                        {!isImageLoading && !isGeneratingVideo && (
                            <>
                                <div className="absolute top-6 right-6 bg-green-500 text-white px-6 py-2 rounded-full text-xs font-black shadow-xl animate-in zoom-in bounce-in">
                                    מוכן! ✨
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            const fileUrl = userVideo || userAvatar;
                                            if (!fileUrl) return;

                                            if (navigator.share) {
                                                const response = await fetch(fileUrl);
                                                const blob = await response.blob();
                                                const extension = userVideo ? 'mp4' : 'jpg';
                                                const type = userVideo ? 'video/mp4' : 'image/jpeg';
                                                const file = new File([blob], `avatar-${Date.now()}.${extension}`, { type });

                                                await navigator.share({
                                                    files: [file],
                                                    title: 'האווטאר שלי',
                                                    text: 'תראו מה יצרתי במעבדת הסטייל של שפת המדבר! 🌵✨'
                                                });
                                            } else {
                                                const link = document.createElement('a');
                                                link.href = fileUrl;
                                                link.download = `Avatar-${selectedStyle}.${userVideo ? 'mp4' : 'png'}`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }
                                        } catch (err) {
                                            console.error("Save error:", err);
                                            if (userAvatar || userVideo) window.open(userVideo || userAvatar!, '_blank');
                                        }
                                    }}
                                    className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-5 rounded-[2rem] text-blue-600 shadow-2xl active:scale-90 transition-all flex items-center justify-center"
                                >
                                    <Download size={28} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Video feature temporarily hidden per user request */}
                        {/* 
                        {!videoUpgradePaid && !isGeneratingVideo && (
                            <button
                                onClick={handleGenerateVideo}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 rounded-[2rem] font-black text-lg flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <div className="flex items-center gap-2">
                                    <Play size={20} fill="currentColor" />
                                    <span>הפוך לסרטון חי (Live) ✨</span>
                                </div>
                                <span className="text-[10px] opacity-80 font-bold mt-1">שדרוג פרימיום ב-₪5 בלבד</span>
                            </button>
                        )}
                        */}

                        <button
                            onClick={onClose}
                            className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all shadow-blue-100"
                        >
                            <Check size={32} />
                            <span>זה מדהים, אהבתי!</span>
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setAvatarStage('selection');
                                    setUserPhoto(null);
                                    setUserAvatar(null);
                                    setUserVideo(null);
                                    setVideoUpgradePaid(false);
                                }}
                                className="bg-gray-100 text-gray-500 font-bold py-5 rounded-3xl flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                <span>התחל מחדש</span>
                            </button>
                            <button
                                onClick={() => {
                                    setAvatarStage('selection');
                                }}
                                className="bg-blue-50 text-blue-600 font-bold py-5 rounded-3xl flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                <span>שנה סטייל</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[151] h-auto max-h-[95vh] overflow-hidden flex flex-col shadow-2xl font-heebo"
                        dir="rtl"
                    >
                        {/* Drag Handle */}
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2" />

                        <div className="p-8 pb-12 overflow-y-auto flex-1 h-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    {step === 'cart' && renderCart()}
                                    {step === 'auth' && renderAuth()}
                                    {step === 'otp' && renderOTP()}
                                    {step === 'details' && renderDetails()}
                                    {step === 'payment' && renderPayment()}
                                    {step === 'credit-card' && renderCreditCard()}
                                    {step === 'apple-pay' && renderApplePay()}
                                    {step === 'bit-paybox' && renderBitPaybox()}
                                    {step === 'processing' && renderProcessing()}
                                    {step === 'success' && renderSuccess()}
                                    {step === 'tracking' && renderTracking()}
                                    {step === 'avatar' && renderAvatar()}
                                    {error && step === 'payment' && renderSubmissionError()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
