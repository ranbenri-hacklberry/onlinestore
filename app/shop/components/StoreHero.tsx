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
                    {/* Floating Branding - NO CIRCLE, PURE LOGO */}
                    <div className="relative flex flex-col items-center justify-center mb-8">
                        <div className="relative w-64 h-64 md:w-[450px] md:h-[450px]">
                            <Image
                                src="/brand/icaffe-icon-final.png"
                                alt="iCaffe Icon"
                                fill
                                className="object-contain drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                            />
                        </div>
                    </div>

                    {/* Slogan Image - Floating below */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="relative w-72 md:w-[500px] h-16 md:h-24 -mt-12 md:-mt-20"
                    >
                        <Image
                            src="/brand/icaffe-slogan-final.png"
                            alt="בית קפה ודברים טובים לקחת"
                            fill
                            className="object-contain drop-shadow-2xl brightness-110"
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
