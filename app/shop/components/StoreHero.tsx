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
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-80 md:h-[550px] w-full overflow-hidden bg-white mx-auto md:rounded-b-[3.5rem] shadow-2xl mb-8 group">
            {/* Background Slideshow */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImage}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${images[currentImage]}')`,
                    }}
                />
            </AnimatePresence>

            {/* Elegant Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

            {/* Minimalist Floating Logo Container */}
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6 mt-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    {/* Floating Branding Circle */}
                    <div className="bg-white/95 backdrop-blur-2xl p-4 md:p-8 rounded-full shadow-2xl border border-white/40 mb-6 flex flex-col items-center justify-center aspect-square min-w-[200px] md:min-w-[300px] overflow-hidden relative">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src="/brand/icaffe-icon-final.png"
                                alt="iCaffe Icon"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Slogan Image - Transparent & Scaled */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="relative w-64 md:w-96 h-12 md:h-16 mt-2"
                    >
                        <Image
                            src="/brand/icaffe-slogan-final.png"
                            alt="בית קפה ודברים טובים לקחת"
                            fill
                            className="object-contain drop-shadow-2xl brightness-110 contrast-125"
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Image Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 transition-all duration-500 rounded-full ${i === currentImage ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                    />
                ))}
            </div>
        </div>
    );
}
