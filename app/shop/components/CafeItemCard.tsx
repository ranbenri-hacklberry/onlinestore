'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface CafeItem {
    id: number | string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    category?: string;
    in_stock?: boolean;
}

interface CafeItemCardProps {
    item: CafeItem;
    index?: number;
    onClick?: (item: CafeItem) => void;
}

export default function CafeItemCard({ item, index = 0, onClick }: CafeItemCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const defaultImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop';
    const imageUrl = imageError ? defaultImage : (item.image_url || defaultImage);

    return (
        <motion.div
            className="relative group cursor-pointer"
            onClick={() => onClick?.(item)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group-hover:border-gray-200">
                {/* Image Container */}
                <div className="relative h-48 md:h-56 overflow-hidden bg-gray-50">
                    {!imageLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-gray-100 flex items-center justify-center">
                            <span className="text-4xl opacity-20">☕</span>
                        </div>
                    )}

                    <motion.div
                        className="relative w-full h-full"
                        animate={{ scale: isHovered ? 1.08 : 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className={`object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                        />
                    </motion.div>

                    {/* Gradient Overlay for Mood */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                    {/* Out of Stock */}
                    {item.in_stock === false && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
                                חסר זמנית
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-3 md:p-5">
                    {/* Category */}
                    {item.category && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-blue-500 rounded-full" />
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                {item.category}
                            </span>
                        </div>
                    )}

                    {/* Name */}
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                        {item.name}
                    </h3>

                    {/* Description */}
                    {item.description && !item.description.startsWith('{') && (
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
                            {item.description}
                        </p>
                    )}

                    {/* Footer / Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg md:text-xl font-black text-gray-900">
                                ₪{item.price}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all duration-300">
                            <span className="text-lg">←</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
