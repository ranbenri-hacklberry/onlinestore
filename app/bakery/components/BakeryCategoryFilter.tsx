'use client';

import { motion } from 'framer-motion';

interface Category {
    id: string;
    name: string;
}

interface BakeryCategoryFilterProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (id: string) => void;
}

const categoryIcons: Record<string, string> = {
    'all': '🥐',
    'sourdough': '🍞',
    'cookies': '🍪',
    'challah': '🥖',
    'cakes': '🎂',
    'salty': '🥨',
    'salads': '🥗',
    'packages': '📦',
    'default': '🧁'
};

export default function BakeryCategoryFilter({
    categories,
    activeCategory,
    onCategoryChange
}: BakeryCategoryFilterProps) {
    return (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1">
            {categories.map((category, index) => {
                const isActive = category.id === activeCategory;
                const icon = categoryIcons[category.id] || categoryIcons['default'];

                return (
                    <motion.button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        className={`
                            relative flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-sm whitespace-nowrap transition-all duration-300
                            ${isActive
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }
                        `}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className={`text-lg ${isActive ? 'animate-bounce' : ''}`}>
                            {icon}
                        </span>
                        <span>{category.name}</span>

                        {isActive && (
                            <motion.div
                                className="absolute inset-0 rounded-2xl border-2 border-white/30"
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
