'use client';

import React from 'react';
import MenuItemCard from './MenuItemCard';
import { MenuItem } from '../types';
import Icon from '@/components/AppIcon';

interface MenuGridProps {
    items: MenuItem[];
    groupedItems: any;
    activeCategory: string;
    onItemClick: (item: MenuItem) => void;
    isLoading?: boolean;
}

const MenuGrid = ({ items = [], groupedItems, activeCategory, onItemClick, isLoading = false }: MenuGridProps) => {

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={`skeleton-${index}`} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse aspect-[5/4] border border-gray-100">
                            <div className="flex-1 bg-gray-100"></div>
                            <div className="h-10 bg-white"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0 && (!groupedItems || groupedItems.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6" dir="rtl">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                    <Icon name="Search" size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    לא נמצאו פריטים
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                    נסה לבחור קטגוריה אחרת או חזור לתפריט הראשי
                </p>
            </div>
        );
    }

    if (groupedItems && groupedItems.length > 0) {
        return (
            <div className="p-4 space-y-8">
                {groupedItems.map((group: any, groupIndex: number) => (
                    <div key={group.title || groupIndex} className="space-y-4">
                        {group.showTitle !== false && (
                            <h3 className="text-sm font-bold text-gray-500 mb-2 pr-1 border-b border-gray-100 pb-2 inline-block" dir="rtl">
                                {group.title}
                            </h3>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {group.items?.map((item: MenuItem) => (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    onAddToCart={onItemClick}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {items.map((item) => (
                    <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={onItemClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default MenuGrid;
