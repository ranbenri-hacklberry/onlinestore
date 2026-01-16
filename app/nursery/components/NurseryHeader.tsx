'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface NurseryHeaderProps {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export default function NurseryHeader({
    searchQuery = '',
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
                            <Image
                                src="/logo-text.png"
                                alt="שפת המדבר"
                                width={120}
                                height={56}
                                className="h-14 w-auto object-contain"
                            />
                        </motion.div>
                    )}

                    {/* Hamburger Menu - Thinner, aligned with logo */}
                    <div className="md:hidden order-3 flex justify-end flex-1">
                        <button
                            className={`p-2 -ml-2 rounded-xl transition-colors ${scrolled ? 'text-white hover:bg-white/20' : 'text-white hover:bg-white/20'}`}
                            aria-label="תפריט"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
                                <line x1="4" y1="12" x2="20" y2="12"></line>
                                <line x1="4" y1="7" x2="20" y2="7"></line>
                                <line x1="4" y1="17" x2="20" y2="17"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3 order-3">
                        {/* Search Input */}
                        {onSearchChange && (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="חיפוש..."
                                    className="w-48 px-4 py-2 pr-10 bg-white/90 backdrop-blur-sm rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    aria-label="חיפוש צמחים"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            </div>
                        )}

                        {/* Phone */}
                        <motion.a
                            href="tel:+972556822072"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-200 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>📞</span>
                            ייעוץ חינם
                        </motion.a>
                    </div>
                </div>
            </div>
        </header>
    );
}
