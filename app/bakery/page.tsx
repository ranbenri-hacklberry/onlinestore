'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Components
import BakeryHeader from './components/BakeryHeader';
import BakeryHero from './components/BakeryHero';
import BakeryCategoryFilter from './components/BakeryCategoryFilter';
import BakeryProductCard from './components/BakeryProductCard';
import StoreFooter from '@/components/StoreFooter';

// Demo data based on LaSha Bakery
const DEMO_PRODUCTS = [
    // לחמי מחמצת
    {
        id: 1,
        name: 'לחם שיאור שיפון עם אגוזי מלך',
        price: 32,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop',
        description: 'לחם מחמצת מלא עם שיפון ואגוזי מלך קלויים',
        category: 'לחמי מחמצת',
        available_days: 'א׳, ד׳, ה׳',
        in_stock: true
    },
    {
        id: 2,
        name: 'לחם שיאור כוסמין עם גרעיני דלעת',
        price: 25,
        image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=500&auto=format&fit=crop',
        description: 'לחם כוסמין מלא עם גרעיני דלעת ופשתן',
        category: 'לחמי מחמצת',
        available_days: 'ב׳, ג׳, ד׳, ו׳',
        in_stock: true
    },
    {
        id: 3,
        name: 'לחם מחמצת לבן',
        price: 22,
        image_url: 'https://images.unsplash.com/photo-1585478259715-876acc5be8fc?q=80&w=500&auto=format&fit=crop',
        description: 'לחם מחמצת קלאסי עם קראסט פריך',
        category: 'לחמי מחמצת',
        in_stock: true
    },
    // עוגיות וגרנולה
    {
        id: 4,
        name: 'קופסאת גרנולה ביתית',
        price: 42,
        image_url: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?q=80&w=500&auto=format&fit=crop',
        description: 'גרנולה ביתית עם שיבולת שועל, דבש ופירות יבשים',
        category: 'עוגיות וגרנולה',
        in_stock: true
    },
    {
        id: 5,
        name: 'עוגיות שוקולד צ׳יפס',
        price: 28,
        image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=500&auto=format&fit=crop',
        description: 'עוגיות חמאה עם שוקולד צ׳יפס בלגי מריר',
        category: 'עוגיות וגרנולה',
        in_stock: true
    },
    {
        id: 6,
        name: 'עוגיות טחינה',
        price: 24,
        image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=500&auto=format&fit=crop',
        description: 'עוגיות טחינה מתפוררות עם שומשום',
        category: 'עוגיות וגרנולה',
        in_stock: true
    },
    // חלות לשבת
    {
        id: 7,
        name: 'חלה קלאסית',
        price: 28,
        image_url: 'https://images.unsplash.com/photo-1603379016822-e6d5e2770ece?q=80&w=500&auto=format&fit=crop',
        description: 'חלה קלועה קלאסית עם ביצים ודבש',
        category: 'חלות לשבת',
        available_days: 'ו׳ בלבד',
        in_stock: true
    },
    {
        id: 8,
        name: 'חלה מתוקה עם שוקולד',
        price: 35,
        image_url: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=500&auto=format&fit=crop',
        description: 'חלה ממולאת בשוקולד מריר ואגוזים',
        category: 'חלות לשבת',
        available_days: 'ו׳ בלבד',
        in_stock: true
    },
    // עוגות ומאפים מתוקים
    {
        id: 9,
        name: 'עוגת שוקולד בלגי',
        price: 85,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=500&auto=format&fit=crop',
        description: 'עוגת שוקולד עשירה בשכבות עם גנאש',
        category: 'עוגות ומאפים מתוקים',
        in_stock: true
    },
    {
        id: 10,
        name: 'עוגת גבינה אפויה',
        price: 75,
        image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=500&auto=format&fit=crop',
        description: 'עוגת גבינה קרמית על בסיס עוגיות',
        category: 'עוגות ומאפים מתוקים',
        in_stock: true
    },
    {
        id: 11,
        name: 'קרואסון חמאה',
        price: 14,
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500&auto=format&fit=crop',
        description: 'קרואסון צרפתי אמיתי עם חמאה',
        category: 'עוגות ומאפים מתוקים',
        in_stock: true
    },
    // מאפים מלוחים
    {
        id: 12,
        name: 'ממולשה ירקות שורש בקרם קוקוס',
        price: 24,
        image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500&auto=format&fit=crop',
        description: 'בצק פילו ממולא בירקות שורש וקרם קוקוס',
        category: 'מאפים מלוחים',
        in_stock: true
    },
    {
        id: 13,
        name: 'בורקס גבינה ותרד',
        price: 18,
        image_url: 'https://images.unsplash.com/photo-1628294896516-344152572ee8?q=80&w=500&auto=format&fit=crop',
        description: 'בורקס פריך במילוי גבינה ותרד טרי',
        category: 'מאפים מלוחים',
        in_stock: true
    },
    {
        id: 14,
        name: 'פוקצ׳ה זיתים ורוזמרין',
        price: 28,
        image_url: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?q=80&w=500&auto=format&fit=crop',
        description: 'פוקצ׳ה איטלקית עם זיתים, רוזמרין ושמן זית',
        category: 'מאפים מלוחים',
        in_stock: true
    },
    // סלטים טריים
    {
        id: 15,
        name: 'סלט קינואה וירקות קלויים',
        price: 45,
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500&auto=format&fit=crop',
        description: 'קינואה עם ירקות קלויים, עשבי תיבול ושמן זית',
        category: 'סלטים טריים',
        in_stock: true
    },
    {
        id: 16,
        name: 'סלט עגבניות שרי וגבינה בולגרית',
        price: 38,
        image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=500&auto=format&fit=crop',
        description: 'עגבניות שרי צבעוניות עם גבינה בולגרית ובזיליקום',
        category: 'סלטים טריים',
        in_stock: true
    },
];

const DEMO_CATEGORIES = [
    { id: 'all', name: 'הכל' },
    { id: 'sourdough', name: 'לחמי מחמצת' },
    { id: 'cookies', name: 'עוגיות וגרנולה' },
    { id: 'challah', name: 'חלות לשבת' },
    { id: 'cakes', name: 'עוגות ומאפים מתוקים' },
    { id: 'salty', name: 'מאפים מלוחים' },
    { id: 'salads', name: 'סלטים טריים' },
];

const categoryMapping: Record<string, string> = {
    'sourdough': 'לחמי מחמצת',
    'cookies': 'עוגיות וגרנולה',
    'challah': 'חלות לשבת',
    'cakes': 'עוגות ומאפים מתוקים',
    'salty': 'מאפים מלוחים',
    'salads': 'סלטים טריים',
};

export default function BakeryPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [cartItems, setCartItems] = useState<any[]>([]);

    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') return DEMO_PRODUCTS;
        const hebrewCategory = categoryMapping[activeCategory];
        return DEMO_PRODUCTS.filter(item => item.category === hebrewCategory);
    }, [activeCategory]);

    const handleAddToCart = (item: any) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white font-heebo" dir="rtl">
            {/* Header */}
            <BakeryHeader
                cartCount={cartCount}
                onCartClick={() => {
                    console.log('Cart clicked', cartItems);
                }}
            />

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto">
                {/* Hero */}
                <div className="px-0 md:px-6 pt-0 md:pt-6">
                    <BakeryHero />
                </div>

                {/* Categories */}
                <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md pt-2 pb-2 px-4 md:px-8 border-b border-amber-100 shadow-sm transition-all rounded-b-xl mb-4">
                    <BakeryCategoryFilter
                        categories={DEMO_CATEGORIES}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </div>

                {/* Grid Section */}
                <section className="px-4 md:px-8 py-6 pb-16">
                    {/* Section Header */}
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 flex items-baseline gap-3"
                    >
                        <h2 className="text-3xl font-black text-gray-800">
                            {DEMO_CATEGORIES.find(c => c.id === activeCategory)?.name || 'כל המאפים'}
                        </h2>
                        <span className="text-sm text-amber-600 font-medium bg-amber-100 px-3 py-1 rounded-full">
                            {filteredItems.length} פריטים
                        </span>
                    </motion.div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <BakeryProductCard
                                    item={item}
                                    onClick={handleAddToCart}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* About Section */}
                <section className="px-4 md:px-8 py-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-[3rem]">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-6xl mb-4 block">🌾</span>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                לשה - רוח אפייה
                            </h3>
                            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                מאפייה מקומית תוצרת בית במצפה רמון. אנחנו מציעים מאפים נהדרים מחומרי גלם איכותיים,
                                לחמי מחמצת טבעיים, עוגיות ביתיות, חלות לשבת ועוד.
                                כל המוצרים נאפים טרי מדי יום.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {[
                                { icon: '🌾', title: 'מחמצת טבעית', desc: 'לחמים מתסיסה טבעית 48 שעות' },
                                { icon: '🏠', title: 'תוצרת בית', desc: 'הכל נאפה במאפייה שלנו' },
                                { icon: '❤️', title: 'באהבה', desc: 'כל מאפה מוכן בקפידה' }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-white rounded-2xl p-6 text-center shadow-lg border border-amber-100"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <span className="text-4xl mb-4 block">{feature.icon}</span>
                                    <h4 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h4>
                                    <p className="text-gray-600">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <StoreFooter currentStore="bakery" accentColor="amber" />

            {/* Floating Cart Button (Mobile) */}
            {cartCount > 0 && (
                <motion.div
                    className="lg:hidden fixed bottom-6 left-4 right-4 z-50"
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                >
                    <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl shadow-amber-500/40 flex items-center justify-between">
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

            {/* Version */}
            <div className="fixed bottom-1 left-2 text-[10px] text-gray-300 font-mono z-50 opacity-30 hover:opacity-100 transition-opacity pointer-events-none">
                bakery-v1.0.0
            </div>
        </div>
    );
}
