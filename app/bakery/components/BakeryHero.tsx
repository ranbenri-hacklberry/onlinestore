'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function BakeryHero() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="relative h-[320px] md:h-[480px] w-full overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700 md:rounded-b-[3rem] shadow-2xl mb-8">
            {/* Animated Background Pattern - Floating Breads */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-5xl md:text-7xl opacity-15"
                        initial={{
                            x: `${10 + (i * 12)}%`,
                            y: -80,
                            rotate: 0
                        }}
                        animate={{
                            y: '120vh',
                            rotate: 180
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Infinity,
                            delay: i * 2,
                            ease: "linear"
                        }}
                    >
                        {['🥖', '🥐', '🍞', '🥯', '🧁', '🥨', '🍩', '🎂'][i % 8]}
                    </motion.div>
                ))}
            </div>

            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center transform scale-105"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2672&auto=format&fit=crop')",
                    filter: 'brightness(0.4) saturate(1.3)'
                }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-amber-900/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/20" />

            {/* Decorative Corner Elements */}
            <motion.div
                className="absolute -bottom-4 -left-4 text-8xl md:text-[120px] opacity-25"
                animate={{
                    rotate: [-5, 5, -5],
                    scale: [1, 1.03, 1]
                }}
                transition={{ duration: 5, repeat: Infinity }}
            >
                🥖
            </motion.div>
            <motion.div
                className="absolute -top-4 -right-4 text-7xl md:text-[100px] opacity-15 rotate-12"
                animate={{
                    rotate: [12, 18, 12]
                }}
                transition={{ duration: 6, repeat: Infinity }}
            >
                🥐
            </motion.div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto text-white pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-md border border-amber-400/40 rounded-full text-amber-200 text-sm font-medium mb-4"
                        animate={{
                            boxShadow: ['0 0 20px rgba(245, 158, 11, 0)', '0 0 30px rgba(245, 158, 11, 0.3)', '0 0 20px rgba(245, 158, 11, 0)']
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <span className="inline-block animate-pulse">🌾</span>
                        מאפייה בוטיק | מצפה רמון
                    </motion.div>

                    {/* Main Title */}
                    <h1 className="text-4xl md:text-7xl font-black mb-4 leading-tight tracking-tight">
                        <motion.span
                            className="text-amber-400 inline-block"
                            animate={{
                                textShadow: ['0 0 20px rgba(251, 191, 36, 0.3)', '0 0 40px rgba(251, 191, 36, 0.6)', '0 0 20px rgba(251, 191, 36, 0.3)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            לשה
                        </motion.span>
                        <span> - רוח אפייה</span>
                        <motion.span
                            className="inline-block mr-3"
                            animate={{ rotate: [0, 8, -8, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            🥐
                        </motion.span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-2xl text-gray-200 max-w-2xl font-light leading-relaxed">
                        מאפייה מקומית תוצרת בית, מבחר לחמי מחמצת, <br className="hidden md:block" />
                        <span className="text-amber-300 font-medium">חלות, עוגיות וגרנולה ביתית</span>
                    </p>

                    {/* Feature Pills */}
                    <motion.div
                        className="flex flex-wrap gap-3 mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {[
                            { icon: '🌾', text: '100% מחמצת טבעית' },
                            { icon: '🏠', text: 'תוצרת בית' },
                            { icon: '🚚', text: 'משלוחים לכל האזור' }
                        ].map((pill, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white/90 border border-white/20"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                            >
                                <span>{pill.icon}</span>
                                <span>{pill.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom Wave SVG */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
                <svg viewBox="0 0 1200 120" className="relative block w-full h-8 md:h-12" preserveAspectRatio="none">
                    <path
                        d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
                        className="fill-white md:fill-gray-50"
                    />
                </svg>
            </div>
        </div>
    );
}
