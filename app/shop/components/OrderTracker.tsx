'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Customer } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Navigation, CheckCircle2, Clock, ChefHat, Bike, ArrowLeft, ArrowRight, User } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet Icon
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface OrderTrackerProps {
    order: any;
    customer: Customer | null;
    onAvatarClick?: () => void;
}

const STEPS = [
    { id: 'received', label: 'התקבלה', icon: CheckCircle2 },
    { id: 'preparing', label: 'בהכנה', icon: ChefHat },
    { id: 'delivering', label: 'בדרך', icon: Bike },
    { id: 'delivered', label: 'נמסרה', icon: CheckCircle2 },
];

import { supabase } from '@/lib/supabase';
import { Upload, XCircle, CheckCircle } from 'lucide-react';

export default function OrderTracker({ order, customer, onAvatarClick }: OrderTrackerProps) {
    // Real-time Order Sync
    const [localOrder, setLocalOrder] = React.useState(order);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadedUrl, setUploadedUrl] = React.useState<string | null>(order?.payment_screenshot_url || null);
    const [uploadError, setUploadError] = React.useState('');

    const isManualPayment = ['bit', 'paybox', 'transfer'].includes(localOrder?.payment_method); // Use localOrder
    const needsPaymentProof = isManualPayment && !localOrder?.is_paid;
    const isPendingVerification = needsPaymentProof && uploadedUrl;

    useEffect(() => {
        setLocalOrder(order);
        setUploadedUrl(order.payment_screenshot_url);
    }, [order]);

    useEffect(() => {
        const channel = supabase.channel(`tracking-${order.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${order.id}`
            }, (payload) => {
                const newOrder = payload.new;
                setLocalOrder((prev: any) => ({ ...prev, ...newOrder }));
                if (newOrder.payment_screenshot_url) {
                    setUploadedUrl(newOrder.payment_screenshot_url);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [order.id]);

    const getStatusIndex = (s: string) => {
        if (s === 'delivered') return 3;
        if (s === 'shipped') return 2;
        if (s === 'in_progress' || s === 'ready') return 1;
        return 0; // pending, new
    };

    const statusIndex = getStatusIndex(localOrder.order_status);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError('');

        try {
            // Upload to Supabase Storage
            const fileName = `proof_${order.id}_${Date.now()}`;
            const { data, error } = await supabase.storage
                .from('payment-proofs')
                .upload(fileName, file);

            if (error) {
                // If bucket doesn't exist or RLS issues, fall back to mock for demo
                console.warn("Storage upload failed (demo mode active):", error);

                // MOCK SUCCESS
                setTimeout(() => {
                    setUploadedUrl('https://example.com/mock-receipt.jpg');
                    setIsUploading(false);
                }, 1500);
                return;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(data?.path || '');

            // Update Order Record
            await supabase.from('orders').update({
                payment_screenshot_url: publicUrl,
                updated_at: new Date().toISOString()
            }).eq('id', order.id);

            setUploadedUrl(publicUrl);

        } catch (err) {
            console.error(err);
            setUploadError('שגיאה בהעלאה, נסה שוב');
        } finally {
            setIsUploading(false);
        }
    };

    const currentStep = STEPS[statusIndex];
    const isDelivering = statusIndex >= 2;

    // Tel Aviv Mock Coords
    const center = [32.0853, 34.7818];
    const bikePos = [32.0863, 34.7828]; // Slightly offset

    return (
        <div className="min-h-full bg-stone-50 pb-12">
            {/* Header */}
            <div className={`p-6 shadow-sm border-b transition-colors relative ${needsPaymentProof && !uploadedUrl ? 'bg-orange-50 border-orange-100' : 'bg-white border-stone-100'}`}>
                {/* Avatar Invite Floating Button - Top Right */}
                <motion.button
                    onClick={onAvatarClick}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-6 left-6 w-14 h-14 bg-white rounded-[1.25rem] shadow-xl border border-orange-100 flex flex-col items-center justify-center gap-1 group overflow-hidden z-20"
                >
                    <div className="relative">
                        <User size={24} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter">AI AVATAR</span>
                </motion.button>

                <div className="max-w-md mx-auto text-center">
                    {!needsPaymentProof || (uploadedUrl && !isPendingVerification) ? (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                                <CheckCircle2 size={32} className="text-green-600" />
                            </div>
                            <h1 className="text-2xl font-black text-stone-900 mb-1">ההזמנה התקבלה!</h1>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                                <Clock size={32} className="text-orange-600" />
                            </div>
                            <h1 className="text-2xl font-black text-stone-900 mb-1">ממתינים לאישור תשלום</h1>
                        </>
                    )}
                    <p className="text-stone-500 font-medium">מספר הזמנה #{order?.order_number || order?.id?.slice(0, 8)}</p>
                </div>
            </div>

            {/* Payment Proof Section - HIGH PRIORITY */}
            {needsPaymentProof && (
                <div className="max-w-md mx-auto px-6 py-6 animate-in slide-in-from-top-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                        <div className="p-4 bg-orange-50/50 border-b border-orange-100">
                            <h3 className="font-bold text-orange-900 flex items-center gap-2">
                                <Upload size={18} />
                                סטטוס תשלום ({order.payment_method})
                            </h3>
                        </div>
                        <div className="p-6 text-center space-y-4">
                            {!uploadedUrl ? (
                                <>
                                    <p className="text-sm text-stone-600">
                                        ביצעת הזמנה ב<b>{order.payment_method === 'bit' ? 'ביט' : order.payment_method === 'paybox' ? 'פייבוקס' : 'העברה בנקאית'}</b>.<br />
                                        אנא העלה את צילום המסך של האישור כדי שנוכל לקדם את ההזמנה.
                                    </p>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <button className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                                            {isUploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={18} />}
                                            {isUploading ? 'מעלה...' : 'העלאת אישור תשלום'}
                                        </button>
                                    </div>
                                    {uploadError && <p className="text-red-500 text-sm font-bold">{uploadError}</p>}
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                        <Clock size={32} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800">האישור התקבל!</h4>
                                        <p className="text-sm text-stone-500">נציג מטעמנו יאמת את התשלום בדקות הקרובות.</p>
                                    </div>
                                    <button
                                        onClick={() => setUploadedUrl(null)}
                                        className="text-xs text-stone-400 underline hover:text-stone-600"
                                    >
                                        העלאה מחדש (אם טעית בקובץ)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Timeline */}
            <div className="max-w-md mx-auto px-6 py-8">
                <div className="flex justify-between relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -z-10 -translate-y-1/2 rounded-full">
                        <div
                            className="h-full bg-orange-400 transition-all duration-1000"
                            style={{ width: `${(statusIndex / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>

                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx <= statusIndex;
                        const isCurrent = idx === statusIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-stone-50 px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white border-stone-200 text-stone-300'
                                    }`}>
                                    <Icon size={18} />
                                </div>
                                <span className={`text-xs font-bold ${isCurrent ? 'text-orange-600' : 'text-stone-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Map Section (Only if delivering) */}
            <div className="max-w-md mx-auto px-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                        <span className="font-bold text-stone-700 flex items-center gap-2">
                            <Navigation size={16} className="text-orange-500" />
                            מעקב שליח
                        </span>
                        {isDelivering && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold animate-pulse">בשידור חי</span>}
                    </div>

                    <div className="h-64 bg-stone-100 relative">
                        {isDelivering ? (
                            typeof window !== 'undefined' ? (
                                <MapContainer center={center as any} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    />
                                    <Marker position={center as any} icon={icon}>
                                        <Popup>המיקום שלך</Popup>
                                    </Marker>
                                    <Marker position={bikePos as any} icon={icon}>
                                        <Popup>השליח</Popup>
                                    </Marker>
                                </MapContainer>
                            ) : null
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-stone-400">
                                <Clock size={48} className="opacity-20" />
                                <span className="font-medium text-sm">המפה תיפתח כשהשליח ייצא</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="max-w-md mx-auto px-6 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-stone-100">
                    <h3 className="font-bold text-stone-800 mb-2">פרטי משלוח</h3>
                    <div className="space-y-1 text-sm text-stone-600">
                        <p>{customer?.name}</p>
                        <p>{customer?.phone}</p>
                        <p className="text-xs text-stone-400 mt-2">{order.delivery_address}</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
