'use client';

import { motion } from 'framer-motion';

interface BakeryHeaderProps {
    cartCount: number;
    onCartClick: () => void;
    activeOrder?: any;
    onTrackClick?: () => void;
}

export default function BakeryHeader({
    cartCount,
    onCartClick,
    activeOrder,
    onTrackClick
}: BakeryHeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-50 via-white to-orange-50 backdrop-blur-xl border-b border-amber-100 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-[72px]">

                    {/* Logo */}
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <span className="text-2xl">🥐</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-black text-amber-800 tracking-tight">
                                המאפייה
                            </h1>
                            <p className="text-xs text-amber-600 -mt-0.5">
                                רוח אפייה
                            </p>
                        </div>
                    </motion.div>

                    {/* Center - Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="חפשו לחם, עוגות, חלות..."
                                className="w-full px-5 py-2.5 pr-12 bg-white border border-amber-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Track Order */}
                        {activeOrder && (
                            <motion.button
                                onClick={onTrackClick}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-medium text-sm hover:bg-orange-200 transition-colors"
                                animate={{
                                    boxShadow: ['0 0 0 0 rgba(249, 115, 22, 0)', '0 0 0 8px rgba(249, 115, 22, 0.2)', '0 0 0 0 rgba(249, 115, 22, 0)']
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="animate-pulse">🚚</span>
                                עקוב אחר ההזמנה
                            </motion.button>
                        )}

                        {/* Phone */}
                        <motion.a
                            href="tel:+972501234567"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-medium text-sm hover:bg-amber-200 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>📞</span>
                            התקשרו
                        </motion.a>

                        {/* Cart Button */}
                        <motion.button
                            onClick={onCartClick}
                            className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-xl">🛒</span>
                            <span className="hidden sm:inline">סל קניות</span>
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </header>
    );
}
