'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useState } from 'react';

interface ModifierOption {
    id: string;
    label: string;
    price?: number;
}

interface ModifierCategory {
    id: string;
    title: string;
    options: ModifierOption[];
}

interface ModifierModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    itemPrice: number;
}

const DRINK_MODIFIERS: ModifierCategory[] = [
    {
        id: 'milk',
        title: 'סוג חלב',
        options: [
            { id: 'regular', label: 'רגיל' },
            { id: 'soy', label: 'סויה', price: 2 },
            { id: 'oat', label: 'שיבולת שועל', price: 3 },
            { id: 'almond', label: 'שקדים', price: 3 },
        ]
    },
    {
        id: 'strength',
        title: 'חוזק',
        options: [
            { id: 'weak', label: 'חלש' },
            { id: 'normal', label: 'רגיל' },
            { id: 'strong', label: 'חזק' },
            { id: 'double', label: 'כפול' },
        ]
    },
    {
        id: 'sugar',
        title: 'סוכר',
        options: [
            { id: 'none', label: 'ללא' },
            { id: '0.5', label: 'חצי סוכר' },
            { id: '1', label: '1 סוכר' },
            { id: 'sweetener', label: 'סוכרזית' },
        ]
    }
];

export default function ModifierModal({ isOpen, onClose, itemName, itemPrice }: ModifierModalProps) {
    const [selections, setSelections] = useState<Record<string, string>>({
        milk: 'regular',
        strength: 'normal',
        sugar: 'none'
    });

    const handleSelect = (categoryId: string, optionId: string) => {
        setSelections(prev => ({ ...prev, [categoryId]: optionId }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[101] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div className="text-right">
                                <h3 className="text-xl font-black text-gray-900 leading-tight">{itemName}</h3>
                                <p className="text-sm text-blue-500 font-bold">החלב והסוכר עלינו</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Options Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                            {DRINK_MODIFIERS.map((category) => (
                                <div key={category.id} className="space-y-4">
                                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        {category.title}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {category.options.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSelect(category.id, option.id)}
                                                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-right group ${selections[category.id] === option.id
                                                        ? 'border-blue-500 bg-blue-50/50 shadow-md'
                                                        : 'border-gray-100 hover:border-gray-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${selections[category.id] === option.id ? 'text-blue-600' : 'text-gray-700'
                                                        }`}>
                                                        {option.label}
                                                    </span>
                                                    {option.price && (
                                                        <span className="text-[10px] text-gray-400">+ ₪{option.price}</span>
                                                    )}
                                                </div>
                                                {selections[category.id] === option.id && (
                                                    <motion.div
                                                        layoutId={`check-${category.id}`}
                                                        className="absolute top-2 left-2 text-blue-500"
                                                    >
                                                        <Check size={16} strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-gray-100 bg-white/80 backdrop-blur-md absolute bottom-0 left-0 right-0">
                            <button
                                onClick={onClose}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-gray-200 active:scale-95 transition-transform"
                            >
                                סגור והמשך
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
