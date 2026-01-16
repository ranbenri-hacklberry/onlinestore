'use client';

import React from 'react';
import { Category } from '../types';

interface MenuCategoryFilterProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (id: string) => void;
}

const MenuCategoryFilter = ({
    categories = [],
    activeCategory = 'hot-drinks',
    onCategoryChange
}: MenuCategoryFilterProps) => {
    return (
        <div className="w-full font-heebo">
            <div className="overflow-x-auto no-scrollbar scroll-smooth w-full" dir="rtl">
                <div className="flex items-center gap-2 p-1 min-w-max">
                    {categories.map((category) => {
                        const isActive = activeCategory === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => onCategoryChange(category.id)}
                                className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 text-sm md:text-base font-bold whitespace-nowrap border-2
                ${isActive
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                                        : 'bg-white border-transparent text-gray-500 hover:bg-white hover:text-amber-500 hover:border-amber-100'
                                    }
              `}
                            >
                                <span>{category.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MenuCategoryFilter;
