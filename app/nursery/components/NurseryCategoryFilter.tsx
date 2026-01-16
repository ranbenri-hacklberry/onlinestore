'use client';

import { motion } from 'framer-motion';

interface Category {
    id: string;
    name: string;
    icon?: string;
}

interface NurseryCategoryFilterProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (id: string) => void;
}

// Subtle, uniform plant-themed icons
const categoryIcons: Record<string, string> = {
    'פרחי חוץ': '❀',
    'צמחי בית': '✿',
    'שיחים ועצים': '🌳',
    'שיחים': '🌳',
    'default': '✾'
};

export default function NurseryCategoryFilter({
    categories,
    activeCategory,
    onCategoryChange
}: NurseryCategoryFilterProps) {
    // Filter out "צמחים רפואיים"
    const filteredCategories = categories.filter(cat => cat.name !== 'צמחים רפואיים');

    return (
        <div className="flex justify-center gap-1.5 py-2 px-1 flex-wrap">
            {filteredCategories.map((category, index) => {
                const isActive = category.id === activeCategory;
                const icon = categoryIcons[category.name] || categoryIcons['default'];

                // Split name into lines if more than one word
                const nameParts = category.name.split(' ');
                const hasMultipleWords = nameParts.length > 1;

                return (
                    <motion.button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        className={`
                            relative flex flex-col items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-300 min-w-[60px]
                            ${isActive
                                ? 'bg-[#7a8c6e] text-white shadow-md'
                                : 'bg-[#7a8c6e]/10 text-[#7a8c6e] hover:bg-[#7a8c6e]/20 border border-[#7a8c6e]/20'
                            }
                        `}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-lg mb-0.5">
                            {icon}
                        </span>
                        {hasMultipleWords ? (
                            <div className="flex flex-col items-center text-[10px] leading-tight">
                                {nameParts.map((part, i) => (
                                    <span key={i}>{part}</span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-[10px]">{category.name}</span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
