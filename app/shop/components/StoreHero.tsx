'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
    '/cafe-images/קרבונרה.png',
    '/cafe-images/לחם_מחמצת_בעבודת_יד.png',
    '/cafe-images/ניוקי_שרימפס_ועשבי_תיבול.png',
    '/cafe-images/טירמיסו_אישי_בכוס.png'
];

export default function StoreHero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-[400px] md:h-[550px] w-full overflow-hidden bg-white mb-8">
            {/* Background Image Slideshow with overlapping Cross-fade */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={images[currentImageIndex]}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                    <Image
                        src={images[currentImageIndex]}
                        alt="iCaffe Signature Dish"
                        fill
                        priority={currentImageIndex <= 1} // Pre-load first two
                        className="object-cover"
                        sizes="100vw"
                    />
                    {/* Ken Burns Effect Layer */}
                    <motion.div
                        className="absolute inset-0 bg-transparent"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 10, ease: "linear" }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Content Overlays */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent pointer-events-none z-[5]" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-[5]" />

            {/* Logo - Top Right */}
            <motion.div
                className="absolute top-0 right-4 z-10 -mt-10 md:-mt-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            >
                <div className="relative w-48 h-48 md:w-80 md:h-80 overflow-hidden drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
                    <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] -mt-20 md:-mt-40">
                        <Image
                            src="/brand/icaffe-icon-final.png"
                            alt="iCaffe"
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 300px, 600px"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Slide Indicators */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`group relative h-1.5 transition-all duration-500 overflow-hidden rounded-full ${currentImageIndex === i ? 'w-10 bg-white' : 'w-3 bg-white/30 hover:bg-white/50'
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    >
                        {currentImageIndex === i && (
                            <motion.div
                                className="absolute inset-0 bg-blue-400/50"
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ duration: 6, ease: "linear" }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Bottom Wave SVG */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none z-10 translate-y-[1px]">
                <svg viewBox="0 0 1200 120" className="relative block w-full h-10 md:h-16" preserveAspectRatio="none">
                    <path
                        d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
                        fill="white"
                    />
                </svg>
            </div>
        </div>
    );
}
