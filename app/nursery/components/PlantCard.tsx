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
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const defaultImage = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=500&auto=format&fit=crop';
    const imageUrl = imageError ? defaultImage : (plant.image_url || defaultImage);

    return (
        <motion.div
            className="relative group cursor-pointer"
            onClick={() => onClick?.(plant)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-100 group-hover:border-emerald-300">
                {/* Image Container */}
                <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                    {/* Loading Skeleton */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                            <span className="text-5xl opacity-30">🌿</span>
                        </div>
                    )}

                    <motion.div
                        className="relative w-full h-full"
                        animate={{ scale: isHovered ? 1.1 : 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Image
                            src={imageUrl}
                            alt={plant.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            loading="lazy"
                        />
                    </motion.div>

                    {/* Overlay on Hover */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                    />

                    {/* Out of Stock Badge */}
                    {plant.in_stock === false && (
                        <div className="absolute top-3 right-3 bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            אזל מהמלאי
                        </div>
                    )}

                    {/* Care Level Badge */}
                    {plant.care_level && (
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${careLevelLabels[plant.care_level].color}`}>
                            {careLevelLabels[plant.care_level].text}
                        </div>
                    )}

                    {/* Light Needs Icon */}
                    {plant.light_needs && (
                        <motion.div
                            className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs flex items-center gap-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                        >
                            <span>{lightNeedsIcons[plant.light_needs].icon}</span>
                            <span className="text-gray-600">{lightNeedsIcons[plant.light_needs].text}</span>
                        </motion.div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Category Tag */}
                    {plant.category && (
                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                            {plant.category}
                        </span>
                    )}

                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-800 mt-2 mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {plant.name}
                    </h3>

                    {/* Description */}
                    {plant.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {plant.description}
                        </p>
                    )}

                    {/* Price Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-emerald-600">
                                ₪{plant.price}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
