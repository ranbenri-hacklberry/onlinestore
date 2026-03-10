'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Droplets,
    Sun,
    Wind,
    Info,
    ChevronRight,
    MessageCircle,
    TreePine,
    CheckCircle2
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
    modifiers?: any[];
}

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    plant: PlantItem | null;
}

export default function ProductDetailModal({ isOpen, onClose, plant }: ProductDetailModalProps) {
    if (!plant) return null;

    const defaultImage = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=500&auto=format&fit=crop';
    const imageUrl = plant.image_url || defaultImage;

    // Helper for WhatsApp link
    const openWhatsApp = () => {
        const text = `שלום נתי, אשמח לקבל פרטים נוספים על הצמח: ${plant.name}`;
        window.open(`https://wa.me/972556822072?text=${encodeURIComponent(text)}`, '_blank');
    };

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
                        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row font-heebo"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-30 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white md:text-stone-500 md:bg-stone-100 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Image Section */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-stone-100">
                            <Image
                                src={imageUrl}
                                alt={plant.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />

                            {/* Mobile Price Overlay */}
                            <div className="absolute bottom-6 left-6 md:hidden">
                                <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl">
                                    <span className="text-sm text-stone-500 font-bold block leading-none mb-1">מחיר</span>
                                    <span className="text-2xl font-black text-emerald-700 leading-none">₪{plant.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-12 overflow-y-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {plant.category || 'צמחים'}
                                    </span>
                                    {plant.in_stock !== false && (
                                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                            <CheckCircle2 size={14} />
                                            זמין במלאי
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-stone-800 leading-tight mb-4 font-rubik">
                                    {plant.name}
                                </h2>

                                <div className="hidden md:block">
                                    <span className="text-4xl font-black text-emerald-600">₪{plant.price}</span>
                                    <span className="text-stone-400 mr-2 text-sm font-medium">כולל מע"מ</span>
                                </div>
                            </div>

                            {/* Care Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                        <Sun size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 font-bold leading-none mb-1">אור</p>
                                        <p className="text-sm font-bold text-stone-700 leading-none">{plant.light_needs || 'שמש חלקית'}</p>
                                    </div>
                                </div>

                                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <Droplets size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 font-bold leading-none mb-1">השקיה</p>
                                        <p className="text-sm font-bold text-stone-700 leading-none">{plant.water_needs || 'בינונית'}</p>
                                    </div>
                                </div>

                                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                        <TreePine size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 font-bold leading-none mb-1">קושי</p>
                                        <p className="text-sm font-bold text-stone-700 leading-none">{plant.care_level || 'קל'}</p>
                                    </div>
                                </div>

                                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                                        <Wind size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 font-bold leading-none mb-1">טמפ'</p>
                                        <p className="text-sm font-bold text-stone-700 leading-none">{plant.temperature || 'נוחה'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-10">
                                <h3 className="text-lg font-black text-stone-800 mb-3 flex items-center gap-2">
                                    <Info size={18} className="text-stone-400" />
                                    על הצמח
                                </h3>
                                <p className="text-stone-600 leading-relaxed text-lg">
                                    {plant.description || "טרם עדכנו תיאור מפורט לצמח זה, אך אתם מוזמנים לשלוח הודעה לנתי ולהתייעץ על כל מה שחשוב!"}
                                </p>
                            </div>

                            {/* CTA Section */}
                            <div className="mt-auto pt-6 border-t border-stone-100">
                                <button
                                    onClick={openWhatsApp}
                                    className="w-full bg-stone-900 hover:bg-black text-white py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <MessageCircle size={24} className="text-emerald-400" />
                                    לפרטים נוספים והזמנה
                                    <ChevronRight size={20} className="mr-auto opacity-30" />
                                </button>
                                <p className="text-center text-stone-400 text-sm mt-4 font-medium italic">
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
