'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
    itemId: string | number;
    itemName: string;
    itemPrice: number;
    onConfirm: (selectedOptions: Record<string, any>) => void;
}

export default function ModifierModal({ isOpen, onClose, itemId, itemName, itemPrice, onConfirm }: ModifierModalProps) {
    const [categories, setCategories] = useState<ModifierCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [selections, setSelections] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && itemId) {
            fetchModifiers();
        }
    }, [isOpen, itemId]);

    const fetchModifiers = async () => {
        setLoading(true);
        try {
            // 1. Get linked groups
            const { data: links } = await supabase
                .from('menuitemoptions')
                .select('group_id')
                .eq('item_id', itemId);

            if (!links || links.length === 0) {
                setCategories([]);
                setLoading(false);
                return;
            }

            const groupIds = links.map(l => l.group_id);

            // 2. Get categories and options
            const { data: groups } = await supabase
                .from('optiongroups')
                .select('*')
                .in('id', groupIds)
                .order('display_order', { ascending: true });

            const { data: values } = await supabase
                .from('optionvalues')
                .select('*')
                .in('group_id', groupIds)
                .order('display_order', { ascending: true });

            if (groups && values) {
                const formatted: ModifierCategory[] = groups.map(g => ({
                    id: g.id,
                    title: g.name,
                    options: values
                        .filter(v => v.group_id === g.id)
                        .map(v => ({
                            id: v.id,
                            label: v.value_name,
                            price: v.price_adjustment > 0 ? v.price_adjustment : undefined
                        }))
                }));
                setCategories(formatted);

                // Set defaults (first option of each category)
                const defaults: Record<string, string> = {};
                formatted.forEach(cat => {
                    if (cat.options.length > 0) {
                        defaults[cat.id] = cat.options[0].id;
                    }
                });
                setSelections(defaults);
            }
        } catch (e) {
            console.error('Error fetching modifiers:', e);
        } finally {
            setLoading(false);
        }
    };

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
                                <p className="text-sm text-blue-500 font-bold">התאמה אישית</p>
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
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                    <p className="text-gray-400 font-medium">טוען אפשרויות...</p>
                                </div>
                            ) : categories.length > 0 ? (
                                categories.map((category) => (
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
                                                            <span className="text-[10px] text-gray-400 font-bold">+ ₪{option.price}</span>
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
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-400">חוויה קלאסית - אין תוספות למנה זו</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-gray-100 bg-white/80 backdrop-blur-md absolute bottom-0 left-0 right-0">
                            <button
                                onClick={() => {
                                    const selectedDetails: Record<string, any> = {};
                                    categories.forEach(cat => {
                                        const selectedOpt = cat.options.find(o => o.id === selections[cat.id]);
                                        if (selectedOpt) {
                                            selectedDetails[cat.id] = {
                                                id: selectedOpt.id,
                                                name: selectedOpt.label,
                                                price: selectedOpt.price || 0
                                            };
                                        }
                                    });
                                    onConfirm(selectedDetails);
                                }}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-between px-8"
                            >
                                <span>הוסף להזמנה</span>
                                <span className="font-mono">₪{(itemPrice + Object.values(selections).reduce((acc: number, sel: any) => {
                                    const opt = categories.flatMap(c => c.options).find(o => o.id === sel);
                                    return acc + (opt?.price || 0);
                                }, 0))}</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
