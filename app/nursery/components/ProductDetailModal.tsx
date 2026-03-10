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
    CheckCircle2,
    CalendarDays
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
                        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col md:flex-row font-assistant"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-30 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white md:text-stone-500 md:bg-stone-100 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Image Section */}
                        <div className="w-full md:w-5/12 h-48 md:h-auto relative bg-stone-100 shrink-0">
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
                        <div className="w-full md:w-7/12 flex flex-col p-5 md:p-10 overflow-y-auto scrollbar-hide">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {plant.category || 'צמחים'}
                                    </span>
                                    {plant.in_stock !== false && (
                                        <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                                            <CheckCircle2 size={12} />
                                            זמין במלאי
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-4xl md:text-5xl font-chalk text-stone-800 leading-tight mb-2 tracking-wide">
                                    {plant.name}
                                </h2>

                                <div className="md:block">
                                    <span className="text-3xl font-chalk text-emerald-600 tracking-wider">₪{plant.price}</span>
                                    <span className="text-stone-400 mr-2 text-[10px] uppercase font-bold tracking-widest hidden md:inline">מחיר קטלוגי</span>
                                </div>
                            </div>

                            {/* Description - Brief paragraph */}
                            <div className="mb-6">
                                <p className="text-stone-600 leading-snug text-lg font-assistant text-right font-medium">
                                    {plant.description || "טרם עדכנו תיאור מפורט לצמח זה, אך אתם מוזמנים לשלוח הודעה לנתי ולהתייעץ על כל מה שחשוב!"}
                                </p>
                            </div>

                            {/* Care Grid - Compact Row */}
                            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 mb-6 font-assistant">
                                <div className="flex justify-between items-center text-center">
                                    <div className="flex-1 flex flex-col items-center border-l border-stone-200/50 last:border-0">
                                        <CalendarDays size={18} className="text-rose-500 mb-1" />
                                        <span className="text-[10px] text-stone-400 font-bold mb-0.5">עונה</span>
                                        <span className="text-[12px] font-bold text-stone-700 line-clamp-1 break-all">{plant.season || 'כל השנה'}</span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center border-l border-stone-200/50 last:border-0">
                                        <Sun size={18} className="text-amber-500 mb-1" />
                                        <span className="text-[10px] text-stone-400 font-bold mb-0.5">שמש</span>
                                        <span className="text-[12px] font-bold text-stone-700 line-clamp-1 break-all">{plant.light_needs || 'חצי צל'}</span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center border-l border-stone-200/50 last:border-0">
                                        <Droplets size={18} className="text-blue-500 mb-1" />
                                        <span className="text-[10px] text-stone-400 font-bold mb-0.5">השקיה</span>
                                        <span className="text-[12px] font-bold text-stone-700 line-clamp-1 break-all">{plant.water_needs || 'בינונית'}</span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center">
                                        <TreePine size={18} className="text-emerald-500 mb-1" />
                                        <span className="text-[10px] text-stone-400 font-bold mb-0.5">קושי</span>
                                        <span className="text-[12px] font-bold text-stone-700 line-clamp-1 break-all">{plant.care_level || 'קל'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Section */}
                            <div className="mt-auto pt-4 border-t border-stone-100">
                                <button
                                    onClick={openWhatsApp}
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-3 active:scale-[0.98] font-assistant"
                                >
                                    <MessageCircle size={22} className="text-white" />
                                    תיאום רכישה בווטסאפ
                                    <ChevronRight size={18} className="mr-auto opacity-30" />
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
