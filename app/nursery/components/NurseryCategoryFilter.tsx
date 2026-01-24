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
    'כלי עבודה': '✂️',
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
            <div className="grid grid-cols-3 md:grid-cols-4 lg:flex lg:flex-row lg:items-stretch gap-2 w-full px-1">
                {displayCategories.map((category, index) => {
                    const isActive = category.id === activeCategory ||
                        (category.name === 'שיחים ועצים' && isTreeRelatedActive);

                    // Split name into lines
                    const safeName = category.name || '';
                    const nameParts = safeName.split(' ');
                    const hasMultipleWords = nameParts.length > 1;

                    return (
                        <motion.button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={`
                                relative flex items-center justify-center px-4 py-2 rounded-lg font-chalk transition-all duration-300 w-full lg:flex-1 h-full min-h-[55px]
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
                            {hasMultipleWords ? (
                                <div className="flex flex-col items-center justify-center text-xl md:text-2xl leading-[0.85] w-full text-center">
                                    {nameParts.map((part, i) => (
                                        <span key={i}>{part}</span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-xl md:text-2xl px-1">{category.name}</span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

        </div>
    );
}
