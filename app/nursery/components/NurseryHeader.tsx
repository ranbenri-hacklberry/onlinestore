'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface NurseryHeaderProps {
    cartCount: number;
    onCartClick: () => void;
    activeOrder?: any;
    onTrackClick?: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function NurseryHeader({
    cartCount,
    onCartClick,
    activeOrder,
    onTrackClick,
    searchQuery,
    onSearchChange
}: NurseryHeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-[#7a8c6e]/95 backdrop-blur-md shadow-lg py-0'
                : 'bg-transparent border-transparent py-2'
                }`}
        >
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-[72px]">

                    {/* Logo - Only visible when scrolled - BIGGER */}
                    {scrolled && (
                        <motion.div
                            className="flex items-center gap-3 order-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src="/logo-text.png"
                                alt="שפת המדבר"
                                className="h-14 object-contain"
                            />
                        </motion.div>
                    )}

                    {/* Hamburger Menu - Thinner, aligned with logo */}
                    <div className="md:hidden order-3 flex justify-end flex-1">
                        <button className={`p-2 -ml-2 rounded-xl transition-colors ${scrolled ? 'text-white hover:bg-white/20' : 'text-white hover:bg-white/20'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
                                <line x1="4" y1="12" x2="20" y2="12"></line>
                                <line x1="4" y1="7" x2="20" y2="7"></line>
                                <line x1="4" y1="17" x2="20" y2="17"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Left Actions (Desktop) */}
                    <div className="hidden md:flex items-center gap-3 order-3">
                        {/* Track Order */}
                        {activeOrder && (
                            <motion.button
                                onClick={onTrackClick}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-xl font-medium text-sm hover:bg-teal-200 transition-colors"
                                animate={{
                                    boxShadow: ['0 0 0 0 rgba(20, 184, 166, 0)', '0 0 0 8px rgba(20, 184, 166, 0.2)', '0 0 0 0 rgba(20, 184, 166, 0)']
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="animate-pulse">🚚</span>
                                עקוב אחר ההזמנה
                            </motion.button>
                        )}

                        {/* Phone */}
                        <motion.a
                            href="tel:+972556822072"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-200 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>📞</span>
                            ייעוץ חינם
                        </motion.a>

                        {/* Cart Button - HIDDEN FOR CATALOG MODE
                        <motion.button
                            onClick={onCartClick}
                            className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-xl">🛒</span>
                            <span className="hidden sm:inline">סל קניות</span>
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </motion.button>
                        */}
                    </div>
                </div>
            </div>
        </header>
    );
}
