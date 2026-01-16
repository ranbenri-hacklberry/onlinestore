'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface BakeryItem {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    category?: string;
    in_stock?: boolean;
    available_days?: string;
}

interface BakeryProductCardProps {
    item: BakeryItem;
    onClick: (item: BakeryItem) => void;
}

export default function BakeryProductCard({ item, onClick }: BakeryProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const defaultImage = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop';

    return (
        <motion.div
            className="relative group cursor-pointer"
            onClick={() => onClick(item)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-100 group-hover:border-amber-300">
                {/* Image Container */}
                <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                    {/* Loading Skeleton */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <span className="text-5xl opacity-30">🥐</span>
                        </div>
                    )}

                    <motion.img
                        src={item.image_url || defaultImage}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        animate={{ scale: isHovered ? 1.1 : 1 }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Overlay on Hover */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                    />

                    {/* Out of Stock Badge */}
                    {item.in_stock === false && (
                        <div className="absolute top-3 right-3 bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            אזל מהמלאי
                        </div>
                    )}

                    {/* Available Days Badge */}
                    {item.available_days && (
                        <div className="absolute top-3 left-3 bg-amber-500/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                            {item.available_days}
                        </div>
                    )}

                    {/* Quick Add Button */}
                    <motion.button
                        className="absolute bottom-3 right-3 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            scale: isHovered ? 1 : 0.8
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <span className="text-2xl">+</span>
                    </motion.button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Category Tag */}
                    {item.category && (
                        <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                            {item.category}
                        </span>
                    )}

                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-800 mt-2 mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {item.name}
                    </h3>

                    {/* Description */}
                    {item.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {item.description}
                        </p>
                    )}

                    {/* Price Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-amber-600">
                                ₪{item.price}
                            </span>
                        </div>

                        <motion.div
                            className="text-amber-500 text-sm font-medium flex items-center gap-1"
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: isHovered ? 1 : 0.7 }}
                        >
                            הוסף לסל
                            <motion.span
                                animate={{ x: isHovered ? 3 : 0 }}
                            >
                                ←
                            </motion.span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
