'use client';

import { motion, AnimatePresence } from 'framer-motion';

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
    'שיחים': '🌿',
    'עצי נוי': '🌳',
    'עצי פרי': '🍋',
    'default': '✾'
};

export default function NurseryCategoryFilter({
    categories,
    activeCategory,
    onCategoryChange
}: NurseryCategoryFilterProps) {
    // Filter out "צמחים רפואיים"
    const displayCategories = categories.filter(cat =>
        cat.name !== 'צמחים רפואיים' &&
        !['שיחים', 'עצי נוי', 'עצי פרי'].includes(cat.name)
    );

    const subCategories = categories.filter(cat =>
        ['שיחים', 'עצי נוי', 'עצי פרי'].includes(cat.name)
    );

    const currentActiveCat = categories.find(c => c.id === activeCategory);
    const isTreeRelatedActive = currentActiveCat && (
        currentActiveCat.name === 'שיחים ועצים' ||
        ['שיחים', 'עצי נוי', 'עצי פרי'].includes(currentActiveCat.name)
    );

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Main Categories */}
            <div className="flex justify-center gap-1.5 py-1 px-1 flex-wrap">
                {displayCategories.map((category, index) => {
                    const isActive = category.id === activeCategory ||
                        (category.name === 'שיחים ועצים' && isTreeRelatedActive);
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

            {/* Sub Categories for Trees & Shrubs */}
            <AnimatePresence>
                {isTreeRelatedActive && subCategories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center gap-2 overflow-hidden w-full"
                    >
                        <div className="h-px bg-emerald-100 w-32 mb-1" />
                        <div className="flex justify-center gap-2 px-4 py-1 overflow-x-auto no-scrollbar w-full">
                            {subCategories.reverse().map((sub, i) => {
                                const isActive = sub.id === activeCategory;
                                return (
                                    <motion.button
                                        key={sub.id}
                                        onClick={() => onCategoryChange(sub.id)}
                                        className={`
                                            px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all
                                            ${isActive
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-100 hover:text-emerald-500'
                                            }
                                        `}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className="ml-1">{categoryIcons[sub.name]}</span>
                                        {sub.name}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
