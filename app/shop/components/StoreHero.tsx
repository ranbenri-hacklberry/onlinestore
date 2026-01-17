'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
    '/cafe-images/גדר_פסיפלורה_סטייל.png',
    '/cafe-images/לחם_מחמצת_בעבודת_יד.png',
    '/cafe-images/ניוקי_שרימפס_ועשבי_תיבול.png',
    '/cafe-images/טירמיסו_אישי_בכוס.png'
];

export default function StoreHero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden bg-white mb-8">
            {/* Background Image Slideshow */}
            {images.map((img, index) => (
                <motion.div
                    key={img}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${img}')`
                    }}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: currentImageIndex === index ? 1 : 0,
                        scale: currentImageIndex === index ? 1 : 1.05
                    }}
                    transition={{
                        opacity: { duration: 1.2 },
                        scale: { duration: 6, ease: "linear" }
                    }}
                />
            ))}

            {/* Right side shadow for logo - Exactly like Nursery */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent pointer-events-none z-[5]" />

            {/* Bottom white fade */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-[5]" />

            {/* Logo - Top Right - Mirroring the Nursery layout */}
            <motion.div
                className="absolute top-0 right-4 z-10 -mt-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <div className="relative w-48 h-48 md:w-80 md:h-80 drop-shadow-2xl">
                    <Image
                        src="/brand/icaffe-icon-final.png"
                        alt="iCaffe"
                        fill
                        className="object-contain scale-[1.3] origin-center"
                        priority
                    />
                </div>
            </motion.div>

            {/* Slide Indicators */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === i
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/70'
                            }`}
                    />
                ))}
            </div>

            {/* Bottom Wave SVG */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none z-10">
                <svg viewBox="0 0 1200 120" className="relative block w-full h-10 md:h-14" preserveAspectRatio="none">
                    <path
                        d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
                        fill="white"
                    />
                </svg>
            </div>
        </div>
    );
}
