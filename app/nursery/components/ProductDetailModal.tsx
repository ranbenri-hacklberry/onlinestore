'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Droplets,
    Sun,
    Zap,
    Info,
    CheckCircle2,
    CalendarDays,
    MessageCircle,
    ChevronRight
} from 'lucide-react';
import Image from 'next/image';

interface PlantItem {
    id: number | string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    category?: string;
    in_stock?: boolean;
    care_level?: 'easy' | 'medium' | 'hard' | string;
    light_needs?: 'low' | 'medium' | 'high' | string;
    water_needs?: 'low' | 'medium' | 'high' | string;
    temperature?: string;
    season?: string;
    modifiers?: any[];
}

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    plant: PlantItem | null;
}

export default function ProductDetailModal({ isOpen, onClose, plant }: ProductDetailModalProps) {
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (plant) {
            setSelectedImage(plant.image_url || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=500&auto=format&fit=crop');
        }
    }, [plant]);

    if (!plant) return null;

    const imageUrl = selectedImage || plant.image_url || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=500&auto=format&fit=crop';

    // Helper for WhatsApp link
    const openWhatsApp = () => {
        const text = `שלום נתי, אשמח לקבל פרטים נוספים על הצמח: ${plant.name}${selectedImage ? ' (צבע שנבחר בתמונה)' : ''}`;
        window.open(`https://wa.me/972556822072?text=${encodeURIComponent(text)}`, '_blank');
    };

    // Variations logic (Hardcoded for Pansy for now based on user request)
    const getVariations = () => {
        if (plant.name.includes('אמנון ותמר')) {
            return [
                { label: 'סגול-כחול', image: '/plant-images/pansy/blue.png', color: '#4c1d95' },
                { label: 'צהוב', image: '/plant-images/pansy/yellow.png', color: '#fbbf24' },
                { label: 'לבן-סגול', image: '/plant-images/pansy/white.png', color: '#f8fafc' },
                { label: 'כתום-אדום', image: '/plant-images/pansy/orange.png', color: '#ea580c' }
            ];
        }
        return [];
    };

    const variations = getVariations();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir="rtl">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] md:max-h-[90vh] flex flex-col md:flex-row font-assistant overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-30 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white md:text-stone-500 md:bg-stone-100 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Image Section */}
                        <div className="w-full md:w-5/12 h-56 md:h-auto relative bg-stone-100 shrink-0 overflow-hidden">
                            <motion.div
                                key={imageUrl}
                                initial={{ opacity: 0.5, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-full relative"
                            >
                                <Image
                                    src={imageUrl}
                                    alt={plant.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </motion.div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                        </div>

                        {/* Info Section */}
                        <div className="w-full md:w-7/12 flex flex-col p-5 md:p-10 overflow-y-auto scrollbar-hide font-assistant">
                            {/* Header */}
                            <div className="mb-4 relative">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-emerald-100/80 text-emerald-700 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-assistant">
                                        {plant.category || 'צמחים'}
                                    </span>

                                    {/* Color Variations Tags */}
                                    {variations.length > 0 && (
                                        <div className="flex gap-1.5 mr-auto">
                                            {variations.map((v) => (
                                                <button
                                                    key={v.label}
                                                    onClick={() => setSelectedImage(v.image)}
                                                    className={`w-4 h-4 rounded-full border border-stone-200 transition-all ${selectedImage === v.image ? 'ring-2 ring-emerald-500 ring-offset-1 scale-110' : 'hover:scale-110'}`}
                                                    style={{ backgroundColor: v.color }}
                                                    title={v.label}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl md:text-5xl font-chalk text-stone-800 leading-none tracking-wide">
                                        {plant.name}
                                    </h2>
                                    <div className="shrink-0 text-left">
                                        <span className="text-2xl md:text-4xl font-chalk text-emerald-600 tracking-wider">₪{plant.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description - Compacted to save space for larger image */}
                            <div className="mb-2">
                                <p className="text-stone-600 leading-relaxed text-lg md:text-xl font-assistant text-right font-medium">
                                    {plant.name.includes('אמנון ותמר') ?
                                        "אמנון ותמר הוא אחד מפרחי החורף האהובים והצבעוניים ביותר. הוא מצטיין בפריחה שופעת במגוון צבעים מרהיבים, עמיד לקור היטב ומתאים מאוד לעציצים ואדניות." :
                                        (plant.description || "טרם עדכנו תיאור מפורט לצמח זה, אך אתם מוזמנים לשלוח הודעה לנתי ולהתייעץ על כל מה שחשוב!")
                                    }
                                </p>
                            </div>

                            {/* Care Grid - Clean & Expanded Width */}
                            <div className="mb-2 font-assistant">
                                <div className="flex justify-between items-center text-center py-2">
                                    <div className="flex-1 flex flex-col items-center border-l border-stone-200/50 last:border-0">
                                        <CalendarDays size={26} className="text-rose-500 mb-1.5" />
                                        <span className="text-[15px] md:text-xl font-bold text-stone-700 leading-none">
                                            {plant.name.includes('אמנון ותמר') ? 'חורף-אביב' : (plant.season || 'כל השנה')}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center border-l border-stone-200/50 last:border-0">
                                        <Sun size={26} className="text-amber-500 mb-1.5" />
                                        <span className="text-[15px] md:text-xl font-bold text-stone-700 leading-none">{plant.light_needs || 'חצי צל'}</span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center border-l border-stone-200/50 last:border-0">
                                        <Droplets size={26} className="text-blue-500 mb-1.5" />
                                        <span className="text-[15px] md:text-xl font-bold text-stone-700 leading-none">{plant.water_needs || 'בינונית'}</span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center">
                                        <Zap size={26} className="text-emerald-500 mb-1.5" />
                                        <span className="text-[15px] md:text-xl font-bold text-stone-700 leading-none">{plant.care_level || 'קל'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Section */}
                            <div className="mt-auto pt-2 border-t border-stone-100">
                                <button
                                    onClick={openWhatsApp}
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-lg md:text-xl transition-all shadow-lg active:scale-[0.98] font-assistant flex items-center justify-center gap-3"
                                >
                                    <MessageCircle size={22} className="text-white" />
                                    <span>תיאום רכישה בווטסאפ</span>
                                </button>
                                <p className="text-center text-stone-400 text-xs mt-3 font-medium italic font-assistant">
                                    נתי זמין עבורכם לכל שאלה מקצועית בווטסאפ
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
