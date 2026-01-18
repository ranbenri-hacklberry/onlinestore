'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// Components
import NurseryHeader from './components/NurseryHeader';
import NurseryHero from './components/NurseryHero';
import NurseryCategoryFilter from './components/NurseryCategoryFilter';
import StoreFooter from '@/components/StoreFooter';
import PlantCard from './components/PlantCard';
import WhatsAppButton from './components/WhatsAppButton';

// Business ID for שפת המדבר
const BUSINESS_ID = '8e4e05da-2d99-4bd9-aedf-8e54cbde930a';

interface Category {
    id: string;
    name: string;
    name_he?: string;
    icon?: string;
    position?: number;
}

interface Plant {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    price: number;
    variations?: any;
    category?: string;
    category_id: string;
    is_in_stock: boolean;
}

export default function NurseryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('');
    // Filter logic state
    const [subCategoryFilter, setSubCategoryFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch data from Supabase
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch categories
                const { data: categoriesData, error: catError } = await supabase
                    .from('item_category')
                    .select('id, name, name_he, icon, position')
                    .eq('business_id', BUSINESS_ID)
                    .or('is_deleted.is.null,is_deleted.eq.false')
                    .or('is_hidden.is.null,is_hidden.eq.false')
                    .order('position', { ascending: true });

                if (catError) {
                    console.error('Error fetching categories:', catError);
                    setError('שגיאה בטעינת הקטגוריות');
                } else {
                    const cats = categoriesData || [];
                    setCategories(cats);
                    if (cats.length > 0 && !activeCategory) {
                        setActiveCategory(cats[0].id);
                    }
                }

                // Fetch menu items (plants)
                const { data: plantsData, error: plantsError } = await supabase
                    .from('menu_items')
                    .select('id, name, price, image_url, description, category, category_id, is_in_stock')
                    .eq('business_id', BUSINESS_ID)
                    .or('is_deleted.is.null,is_deleted.eq.false')
                    .order('name', { ascending: true });

                if (plantsError) {
                    console.error('Error fetching plants:', plantsError);
                    setError('שגיאה בטעינת הצמחים');
                } else {
                    setPlants(plantsData || []);
                }
            } catch (e) {
                console.error('Error loading data:', e);
                setError('שגיאה בטעינת הנתונים');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Format categories for filter component
    const filterCategories = useMemo(() => {
        return categories.map(cat => ({
            id: cat.id,
            name: cat.name_he || cat.name,
            icon: cat.icon || '🌱'
        }));
    }, [categories]);

    // Filter plants by category AND search query
    const filteredItems = useMemo(() => {
        let items = plants;

        // Filter by category
        if (activeCategory) {
            const activeCat = categories.find(c => c.id === activeCategory);
            // Check both name_he and name to correspond to 'Trees & Shrubs'
            const isTreesAndShrubs = activeCat?.name_he === 'שיחים ועצים' || activeCat?.name === 'שיחים ועצים';

            if (isTreesAndShrubs) {
                // If main "Trees & Shrubs" is selected
                if (subCategoryFilter) {
                    // special handling for "Shrubs" (שיחים) to include the general "Trees & Shrubs" items
                    // since there are 0 specific shrubs but 7 general ones in the DB.
                    const subCatName = categories.find(c => c.id === subCategoryFilter)?.name_he?.trim();

                    if (subCatName === 'שיחים') {
                        items = items.filter(item =>
                            item.category_id === subCategoryFilter ||
                            item.category_id === activeCategory // Include general category items
                        );
                    } else {
                        items = items.filter(item => item.category_id === subCategoryFilter);
                    }
                } else {
                    // Show everything related to trees/shrubs (checking both name fields)
                    const treeRelatedCatIds = categories
                        .filter(c => {
                            const n = c.name_he || c.name;
                            return ['שיחים ועצים', 'שיחים', 'עצי נוי', 'עצי פרי'].includes(n);
                        })
                        .map(c => c.id);
                    items = items.filter(item => treeRelatedCatIds.includes(item.category_id));
                }
            } else {
                // Specific category (e.g., just "Fruit Trees" selected directly or other categories)
                items = items.filter(item => item.category_id === activeCategory);
            }
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query)
            );
        }

        return items;
    }, [activeCategory, subCategoryFilter, plants, categories, searchQuery]);

    // Handle plant click - just log for now (catalog mode)
    const handlePlantClick = (plant: Plant) => {
        console.log('Plant clicked:', plant.name);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white font-heebo" dir="rtl">
            {/* Header */}
            <NurseryHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Main Content */}
            <main className="pb-32">
                {/* Hero Section */}
                <NurseryHero />

                {/* Description Section */}
                <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-4 text-center">
                    <h2 className="text-5xl md:text-6xl font-chalk text-[#7a8c6e] mb-4 tracking-wide leading-tight">
                        בואו להתאהב בטבע
                    </h2>
                    <p className="text-gray-600 text-xl md:text-2xl leading-relaxed font-rubik font-light">
                        במשתלת 'שפת המדבר' אנחנו מגדלים באהבה צמחים שמכניסים חיים ושמחה לכל פינה.
                        שילוב של פריחה משכרת, ירוק בעיניים ואווירה מדברית קסומה.
                        <br className="hidden md:block" />
                        מוזמנים לקפוץ לקפה, לשאוף אוויר נקי ולקחת איתכם קצת מהטבע הביתה.
                    </p>
                </div>

                {/* Hebrew Work Badge */}
                <div className="text-center mt-6 mb-8">
                    <span
                        className="inline-block text-[#7a8c6e] text-xl md:text-2xl tracking-widest px-6 py-2 border-2 border-[#7a8c6e] rounded-sm relative font-chalk font-bold shadow-sm"
                        style={{
                            boxShadow: 'inset 0 0 0 3px white, inset 0 0 0 4px #7a8c6e'
                        }}
                    >
                        עֲבוֹדָה עִבְרִית
                    </span>
                </div>

                {/* Separator Line */}
                <div className="max-w-xs mx-auto mb-10 border-t border-[#7a8c6e]/30"></div>

                {/* Categories */}
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <NurseryCategoryFilter
                        categories={filterCategories}
                        activeCategory={activeCategory}
                        onCategoryChange={(id) => {
                            setActiveCategory(id);
                            setSubCategoryFilter(null); // Reset sub-filter on main category change
                        }}
                    />

                    {/* Category Title & Inline Sub-Filters */}
                    {/* Category Title & Inline Sub-Filters */}
                    <div className="flex flex-wrap items-center mb-6 mt-8 gap-4 border-b border-stone-100 pb-2">
                        <h2 className="text-4xl font-chalk text-gray-800 tracking-wide">
                            {filterCategories.find(c => c.id === activeCategory)?.name || 'צמחים'}
                        </h2>

                        {/* Dynamic Sub-Filters for Trees & Shrubs */}
                        {filterCategories.find(c => c.id === activeCategory)?.name === 'שיחים ועצים' && (
                            <div className="flex flex-wrap items-center gap-2 py-1 px-1">
                                {/* "All" Chip */}
                                <button
                                    onClick={() => setSubCategoryFilter(null)}
                                    className={`px-3 py-1 rounded-full text-lg transition-all whitespace-nowrap font-chalk ${!subCategoryFilter
                                        ? 'bg-[#7a8c6e] text-white shadow-md'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                >
                                    הכל
                                </button>

                                {/* Specific Categories Chips */}
                                {['עצי פרי', 'עצי נוי', 'שיחים'].map(subName => {
                                    // Robust lookup: check both name and name_he with trim
                                    const subCat = categories.find(c => {
                                        const he = c.name_he?.trim();
                                        const en = c.name?.trim();
                                        return he === subName || en === subName;
                                    });

                                    if (!subCat) return null;

                                    return (
                                        <button
                                            key={subCat.id}
                                            onClick={() => setSubCategoryFilter(subCat.id)}
                                            className={`px-3 py-1 rounded-full text-lg transition-all whitespace-nowrap font-chalk ${subCategoryFilter === subCat.id
                                                ? 'bg-[#7a8c6e] text-white shadow-md'
                                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                                }`}
                                        >
                                            {subName}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Item count removed as per request */}
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-[#7a8c6e] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4 opacity-50">🌵</div>
                            <p className="text-gray-500 text-xl font-chalk">לא נמצאו צמחים כרגע...</p>
                        </div>
                    ) : (
                        /* Products Grid */
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.3 }}
                        >
                            {filteredItems.map((plant, index) => (
                                <PlantCard
                                    key={plant.id}
                                    plant={{
                                        ...plant,
                                        in_stock: plant.is_in_stock !== false,
                                        image_url: plant.image_url || undefined
                                    }}
                                    index={index}
                                    onClick={() => handlePlantClick(plant)}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <StoreFooter currentStore="nursery" accentColor="emerald" />

            {/* Floating Cart Button (Mobile) - HIDDEN FOR CATALOG MODE
            {cartCount > 0 && (
                <motion.div
                    className="lg:hidden fixed bottom-6 left-4 right-4 z-50"
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                >
                    <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🛒</span>
                            <span>צפייה בסל ({cartCount})</span>
                        </div>
                        <span className="bg-white/20 px-4 py-1 rounded-xl">
                            ₪{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                        </span>
                    </button>
                </motion.div>
            )}
            */}

            {/* WhatsApp Button */}
            <WhatsAppButton
                phoneNumber="+972556822072"
                message="שלום, אשמח לשמוע על הצמחים שלכם 🌱"
            />

            {/* Version */}
            <div className="fixed bottom-1 left-2 text-[10px] text-gray-300 font-mono z-50 opacity-30 hover:opacity-100 transition-opacity pointer-events-none">
                sfat-hamidbar-v1.1.0
            </div>
        </div>
    );
}
