'use client';

import { ShoppingBag, User, Clock, CheckCircle2, Bike, ChefHat, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StoreHeaderProps {
    cartCount: number;
    onCartClick: () => void;
    activeOrder?: any;
    onTrackClick?: () => void;
    hideCart?: boolean;
}

export default function StoreHeader({ cartCount, onCartClick, activeOrder, onTrackClick, hideCart = false }: StoreHeaderProps) {

    const getStatusInfo = (s: string) => {
        if (s === 'delivered') return { label: 'נמסרה', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200 shadow-green-100' };
        if (s === 'shipped') return { label: 'בדרך אליך', icon: Bike, color: 'text-blue-600 bg-blue-50 border-blue-200 shadow-blue-100' };
        if (s === 'in_progress' || s === 'ready') return { label: 'מכינים לך', icon: ChefHat, color: 'text-orange-600 bg-orange-50 border-orange-200 shadow-orange-100' };
        return { label: 'התקבלה', icon: CheckCircle2, color: 'text-stone-600 bg-stone-50 border-stone-200 shadow-stone-100' };
    };

    const statusInfo = activeOrder ? getStatusInfo(activeOrder.order_status) : null;

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm h-[72px]"
        >
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
                <div className="relative w-32 h-14 overflow-hidden">
                    <img
                        src="/brand/icaffe-icon-final.png"
                        alt="iCaffe"
                        className="object-contain w-full h-full scale-150"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">

                {/* Active Order Pill */}
                {activeOrder && statusInfo && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={onTrackClick}
                        className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs md:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 ${statusInfo.color}`}
                    >
                        <div className="relative">
                            <statusInfo.icon size={16} className="shrink-0" />
                            {activeOrder.order_status === 'shipped' && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            )}
                        </div>
                        <span className="hidden xs:inline truncate max-w-[80px] md:max-w-none">{statusInfo.label}</span>
                        <div className="w-px h-3 bg-current opacity-20 mx-1 hidden sm:block" />
                        <span className="font-mono opacity-80 hidden sm:block">#{activeOrder.order_number || activeOrder.id.slice(0, 4)}</span>
                        <ArrowRight size={14} className="opacity-50 mr-1" />
                    </motion.button>
                )}

                {/* Cart Button */}
                {!hideCart && (
                    <button
                        className="p-2 hover:bg-orange-50 rounded-full transition-colors relative group"
                        onClick={onCartClick}
                    >
                        <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-amber-600 transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
                                {cartCount}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </motion.header>
    );
}
