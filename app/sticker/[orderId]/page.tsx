'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Camera, Loader2, CheckCircle2, Coffee, AlertCircle, ImageOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type OrderStatus = 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
type PageState = 'loading' | 'ready-to-upload' | 'uploading' | 'success' | 'too-late' | 'error' | 'not-found';

interface Order {
    id: string;
    order_status: OrderStatus;
    customer_name: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function StickerPage() {
    const params = useParams();
    const orderId = params.orderId as string;

    const [pageState, setPageState] = useState<PageState>('loading');
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch order and subscribe to realtime updates
    useEffect(() => {
        if (!orderId) {
            setPageState('not-found');
            return;
        }

        const fetchOrder = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('id, order_status, customer_name')
                .eq('id', orderId)
                .single();

            if (error || !data) {
                console.error('Order fetch error:', error);
                setPageState('not-found');
                return;
            }

            setOrder(data as Order);
            updatePageStateFromOrder(data.order_status as OrderStatus);
        };

        fetchOrder();

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`order-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    const newOrder = payload.new as Order;
                    setOrder(newOrder);
                    updatePageStateFromOrder(newOrder.order_status);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    const updatePageStateFromOrder = (status: OrderStatus) => {
        // Allow upload when order is pending or in_progress
        if (status === 'pending' || status === 'in_progress') {
            setPageState('ready-to-upload');
        } else {
            setPageState('too-late');
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('הקובץ גדול מדי. מקסימום 10MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('נא להעלות קובץ תמונה בלבד');
            return;
        }

        setPageState('uploading');
        setError(null);
        setUploadProgress('מעלה את התמונה...');

        try {
            // Generate unique filename
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `${orderId}_${timestamp}.${fileExt}`;
            const filePath = `selfies/${fileName}`;

            // Upload to Supabase Storage
            setUploadProgress('מעלה לשרת...');
            const { error: uploadError } = await supabase.storage
                .from('stickers')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Insert into print_queue
            setUploadProgress('שולח להדפסה...');
            const { error: queueError } = await supabase
                .from('print_queue')
                .insert({
                    order_id: orderId,
                    image_path: filePath,
                    status: 'pending',
                    type: 'selfie',
                });

            if (queueError) {
                throw new Error(`Queue insert failed: ${queueError.message}`);
            }

            // Get public URL for preview
            const { data: { publicUrl } } = supabase.storage
                .from('stickers')
                .getPublicUrl(filePath);

            setUploadedUrl(publicUrl);
            setPageState('success');
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'שגיאה בהעלאה, נסה שוב');
            setPageState('ready-to-upload');
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Render different states
    const renderContent = () => {
        switch (pageState) {
            case 'loading':
                return <LoadingState />;
            case 'not-found':
                return <NotFoundState />;
            case 'too-late':
                return <TooLateState customerName={order?.customer_name} />;
            case 'uploading':
                return <UploadingState progress={uploadProgress} />;
            case 'success':
                return <SuccessState customerName={order?.customer_name} previewUrl={uploadedUrl} />;
            case 'ready-to-upload':
                return (
                    <ReadyToUploadState
                        customerName={order?.customer_name}
                        onCapture={triggerFileInput}
                        error={error}
                    />
                );
            case 'error':
                return <ErrorState message={error} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-purple-950 flex flex-col items-center justify-center p-6" dir="rtl" style={{ fontFamily: 'var(--font-heebo), Heebo, Arial, sans-serif' }}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Ambient glow effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Main content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={pageState}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 w-full max-w-sm"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>

            {/* Footer branding */}
            <div className="fixed bottom-6 left-0 right-0 text-center">
                <p className="text-stone-600 text-xs flex items-center justify-center gap-1">
                    <Coffee size={12} />
                    iCaffe Sticker Experience
                </p>
            </div>
        </div>
    );
}

// ============ State Components ============

function LoadingState() {
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
                <Coffee size={48} className="text-amber-500" />
            </motion.div>
            <p className="text-stone-400 text-lg">טוען את ההזמנה...</p>
        </div>
    );
}

function NotFoundState() {
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle size={48} className="text-red-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">הזמנה לא נמצאה</h1>
                <p className="text-stone-400">
                    לא מצאנו את ההזמנה הזו במערכת.
                    <br />
                    בדוק שסרקת את הקוד הנכון.
                </p>
            </div>
        </div>
    );
}

function TooLateState({ customerName }: { customerName?: string | null }) {
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30"
            >
                <Coffee size={56} className="text-white" />
            </motion.div>
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    {customerName ? `${customerName}, ` : ''}הקפה מוכן! ☕
                </h1>
                <p className="text-stone-400 text-lg">
                    מאוחר מדי לסטיקר הפעם...
                    <br />
                    <span className="text-amber-500">בוא לקחת את ההזמנה!</span>
                </p>
            </div>
        </div>
    );
}

function UploadingState({ progress }: { progress: string }) {
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center shadow-2xl"
            >
                <Loader2 size={56} className="text-white animate-spin" />
            </motion.div>
            <div>
                <h2 className="text-xl font-bold text-white mb-2">רגע...</h2>
                <p className="text-stone-400">{progress}</p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-amber-500"
                    />
                ))}
            </div>
        </div>
    );
}

function SuccessState({ customerName, previewUrl }: { customerName?: string | null; previewUrl: string | null }) {
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                className="relative mb-4"
            >
                {/* Coffee Cup Mockup */}
                <div className="relative w-80 h-80 mx-auto perspective-1000">
                    <img
                        src="/cup_mockup.png"
                        alt="Coffee Cup"
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />

                    {/* The Sticker Preview overlaid on the cup */}
                    {previewUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="absolute top-[52%] left-[51%] -translate-x-1/2 -translate-y-1/2 w-[34%] aspect-square bg-white shadow-2xl overflow-hidden rounded-[10%]"
                            style={{
                                perspective: '1000px',
                                transform: 'translateX(-50%) translateY(-50%) rotateY(-10deg) rotate(1deg)',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                            }}
                        >
                            {/* Sticker Content with Thermal Effect */}
                            <div className="relative w-full h-full flex flex-col bg-white">
                                {/* Thin inner border with more rounded feel */}
                                <div className="absolute inset-1.5 border border-black/20 rounded-[8%] pointer-events-none z-20" />

                                {/* Image Area */}
                                <div className="flex-1 overflow-hidden m-2.5 rounded-[5%] bg-zinc-100">
                                    <img
                                        src={previewUrl}
                                        alt="Your Sticker"
                                        className="w-full h-full object-cover"
                                        style={{
                                            filter: 'grayscale(1) contrast(1.6) brightness(1.1) sepia(0.1)',
                                            mixBlendMode: 'darken',
                                            opacity: 0.95
                                        }}
                                    />
                                </div>

                                {/* Refined Footer Area */}
                                <div className="bg-stone-900 text-white pb-2 pt-1 px-1 flex flex-col items-center justify-center relative">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 rounded-full p-0.5 border border-white/10">
                                        <Coffee size={8} className="text-amber-500" />
                                    </div>
                                    <span className="text-[5px] font-bold tracking-widest text-stone-400 uppercase opacity-80">iCaffe Order</span>
                                    <span className="text-[8px] font-black leading-none mt-0.5">#104</span>
                                    <span className="text-[4px] font-medium leading-none mt-1 text-stone-300">קפוצ׳ינו • חלב שיבולת</span>
                                </div>

                                {/* Dithering Texture Overlay - Softened */}
                                <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-30" />
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg border-2 border-stone-900">
                    <CheckCircle2 size={24} className="text-white" />
                </div>

                {/* Sparkle effects */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-10 -right-4"
                >
                    <Sparkles size={24} className="text-amber-400" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-20 -left-6"
                >
                    <Sparkles size={20} className="text-purple-400" />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h1 className="text-2xl font-bold text-white mb-2">מעולה! 🎉</h1>
                <p className="text-stone-400 text-lg">
                    זה נראה מדהים! התמונה בדרך למדפסת.
                    <br />
                    <span className="text-amber-500">
                        הסטיקר יחכה לך מודבק על הקפה!
                    </span>
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-2 px-6 py-3 bg-stone-800/30 rounded-2xl border border-stone-700/50 backdrop-blur-sm"
            >
                <p className="text-stone-500 text-sm">
                    {customerName ? `תודה ${customerName}! ` : ''}
                    כשזה יהיה מוכן, נצעק את שמך!
                </p>
            </motion.div>
        </div>
    );
}

function ReadyToUploadState({
    customerName,
    onCapture,
    error,
}: {
    customerName?: string | null;
    onCapture: () => void;
    error: string | null;
}) {
    return (
        <div className="flex flex-col items-center gap-8 text-center">
            {/* Header */}
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-black text-white mb-2"
                >
                    {customerName ? `היי ${customerName}!` : 'היי!'}
                </motion.h1>
                <p className="text-stone-400 text-lg">
                    צלם סלפי ונדפיס לך סטיקר
                    <br />
                    <span className="text-amber-500">על הקפה! ☕</span>
                </p>
            </div>

            {/* Big Camera Button */}
            <motion.button
                onClick={onCapture}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
            >
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 via-purple-500 to-amber-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                {/* Button */}
                <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 border-4 border-white/10">
                    {/* Inner circle */}
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center border-2 border-white/5">
                        <Camera size={56} className="text-white" />
                    </div>
                </div>

                {/* Pulse animation */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-amber-500"
                />
            </motion.button>

            {/* Instructions */}
            <p className="text-stone-500 text-sm">
                לחץ על הכפתור לפתיחת המצלמה
            </p>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
                    >
                        <ImageOff size={18} />
                        <span className="text-sm">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">ההזמנה בהכנה</span>
            </div>
        </div>
    );
}

function ErrorState({ message }: { message: string | null }) {
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle size={48} className="text-red-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">אופס!</h1>
                <p className="text-stone-400">{message || 'משהו השתבש, נסה שוב'}</p>
            </div>
        </div>
    );
}
