'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function NurseryHero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden bg-white">
            {/* Background Image Slideshow - Clean, no overlays */}
            {[
                '/hero-images/landscape.png',
                '/hero-images/couple.png',
                '/hero-images/greenhouse.png'
            ].map((img, index) => (
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

            {/* Right side shadow for logo */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none z-[5]" />

            {/* Bottom white fade - thin strip */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-[5]" />

            {/* Logo - Top Right - BIGGER with alignment */}
            <motion.div
                className="absolute top-0 right-4 z-10 -mt-5"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <img
                    src="/logo-text.png"
                    alt="שפת המדבר"
                    className="h-48 md:h-72 drop-shadow-2xl scale-[1.2] origin-center"
                />
            </motion.div>

            {/* Slide Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {[0, 1, 2].map((i) => (
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

            {/* Bottom Wave SVG - Transparent background */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
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
