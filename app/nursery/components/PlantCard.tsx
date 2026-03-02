'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface PlantItem {
    id: number | string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    category?: string;
    in_stock?: boolean;
    care_level?: 'easy' | 'medium' | 'hard';
    light_needs?: 'low' | 'medium' | 'high';
    modifiers?: any[];
}

interface PlantCardProps {
    plant: PlantItem;
    index?: number;
    onClick?: (item: PlantItem) => void;
}

const careLevelLabels = {
    easy: { text: 'קל לגידול', color: 'bg-green-100 text-green-700' },
    medium: { text: 'בינוני', color: 'bg-yellow-100 text-yellow-700' },
    hard: { text: 'מתקדמים', color: 'bg-red-100 text-red-700' }
};

const lightNeedsIcons = {
    low: { icon: '🌑', text: 'צל' },
    medium: { icon: '⛅', text: 'חצי צל' },
    high: { icon: '☀️', text: 'שמש מלאה' }
};

export default function PlantCard({ plant, index = 0, onClick }: PlantCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const defaultImage = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=500&auto=format&fit=crop';
    const imageUrl = imageError ? defaultImage : (plant.image_url || defaultImage);

    // Parse sizes from JSONB modifiers (Priority 1) or legacy description JSON (Priority 2)
    const parsedSizes = (() => {
        // Priority 1: Use the new 'modifiers' JSONB field
        if (plant.modifiers && Array.isArray(plant.modifiers)) {
            const sizeGroup = plant.modifiers.find(m => m.group === 'גודל' || m.title === 'גודל');
            if (sizeGroup) {
                const options = sizeGroup.options || sizeGroup.values || [];
                if (options.length > 0) {
                    const sizesObj: Record<string, number> = {};
                    options.forEach((opt: any) => {
                        const basePrice = Number(plant.price || 0);
                        const adjustment = Number(opt.price || opt.priceAdjustment || 0);
                        sizesObj[opt.name || opt.value_name] = basePrice + adjustment;
                    });
                    return sizesObj;
                }
            }
        }

        // Priority 2: Fallback to old description JSON
        try {
            const data = JSON.parse(plant.description || '');
            if (typeof data === 'object' && Object.keys(data).length > 0) return data;
        } catch (e) { }
        return null;
    })();

    return (
        <motion.div
            className="group cursor-pointer"
            onClick={() => onClick?.(plant)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <div className="bg-[#fcfbf7] rounded-[1rem] overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#eaddcf] h-full flex flex-col relative">

                {/* Out of Stock Overlay */}
                {plant.in_stock === false && (
                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-stone-900 text-white px-3 py-1 text-xs font-bold tracking-wider rounded-full shadow-sm">
                            אזל במלאי
                        </div>
                    </div>
                )}

                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                    {!imageLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-stone-200 flex items-center justify-center">
                            <span className="opacity-20 text-3xl">🌿</span>
                        </div>
                    )}
                    <Image
                        src={imageUrl}
                        alt={plant.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />

                </div>

                <div className="p-3 flex flex-col flex-1 bg-[#687f59] relative">
                    <div className="mb-2">
                        <h3
                            className="text-3xl text-[#f0fdf4] leading-none tracking-wide drop-shadow-sm"
                            style={{
                                fontFamily: '"Amatic SC", cursive',
                                fontWeight: 700,
                                // Clean faux-bold: subtle 0.5px stroke, no messy shadows
                                textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor'
                            }}
                        >
                            {plant.name}
                        </h3>
                    </div>

                    {/* Description / Sizes */}
                    <div className="flex-1">
                        {parsedSizes ? (
                            <div className="grid grid-cols-3 gap-2 mt-auto">
                                {Object.entries(parsedSizes).map(([size, price], i) => (
                                    <div key={size} className="bg-white/5 border border-white/30 rounded-lg p-1.5 flex flex-col items-center justify-center gap-0.5 shadow-sm hover:bg-white/10 transition-colors text-center h-full">
                                        <div className="flex flex-col items-center justify-between h-full w-full">
                                            <span className="text-xl md:text-2xl text-stone-100 opacity-90 font-chalk tracking-wide leading-none pt-1" style={{
                                                textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor'
                                            }}>
                                                {size}
                                            </span>
                                            <span className="text-3xl md:text-4xl font-bold text-white font-chalk leading-none pb-1" style={{
                                                textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor'
                                            }}>
                                                {price as number}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            plant.description && (
                                <p className="text-base text-white/90 line-clamp-2 leading-tight tracking-wide" style={{
                                    fontFamily: '"Amatic SC", cursive',
                                    fontWeight: 700,
                                    textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor'
                                }}>
                                    {plant.description}
                                </p>
                            )
                        )}
                    </div>

                    {/* Bottom Row */}
                    {!parsedSizes && (
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-lg text-white/50" style={{ fontFamily: '"Amatic SC", cursive', fontWeight: 700 }}>מחיר ליח'</span>
                            <span className="text-4xl text-white tracking-wide" style={{
                                fontFamily: '"Amatic SC", cursive',
                                fontWeight: 700,
                                textShadow: '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor'
                            }}>
                                {plant.price}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
