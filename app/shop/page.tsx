'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';

// Components
import StoreHeader from './components/StoreHeader';
import StoreHero from './components/StoreHero';
import MenuCategoryFilter from './components/MenuCategoryFilter';
import StoreFooter from '@/components/StoreFooter';
import CafeItemCard from './components/CafeItemCard';
import WhatsAppButton from '@/app/nursery/components/WhatsAppButton';
import ModifierModal from './components/ModifierModal';

// Hooks & Libs
import { supabase } from '@/lib/supabase';

const BUSINESS_ID = '22222222-2222-2222-2222-222222222222';

const CafeCatalog = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModifierOpen, setIsModifierOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch categories
        const { data: catData } = await supabase
          .from('item_category')
          .select('id, name, name_he, icon')
          .eq('business_id', BUSINESS_ID)
          .order('position', { ascending: true });

        if (catData && catData.length > 0) {
          setCategories(catData);
          setActiveCategory(catData[0].id);
        }

        // Fetch items
        const { data: itemsData } = await supabase
          .from('menu_items')
          .select('*')
          .eq('business_id', BUSINESS_ID)
          .or('is_deleted.is.null,is_deleted.eq.false')
          .order('name', { ascending: true });

        setMenuItems(itemsData || []);
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory) {
      items = items.filter(i => i.category_id === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  const displayCategories = useMemo(() => {
    return categories.map(c => ({
      id: c.id,
      name: c.name_he || c.name,
      icon: c.icon
    }));
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-heebo overflow-x-hidden" dir="rtl">
      {/* Header */}
      <StoreHeader
        cartCount={0}
        onCartClick={() => { }}
        hideCart={true}
      />

      <main className="pb-32">
        {/* Hero */}
        <StoreHero />

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 overflow-hidden">
          <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md py-4 border-b border-gray-100 mb-8 w-full">
            <MenuCategoryFilter
              categories={displayCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Title & Stats */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900">
              {displayCategories.find(c => c.id === activeCategory)?.name || 'התפריט שלנו'}
            </h2>
            <span className="bg-gray-50 text-gray-400 px-4 py-1 rounded-full text-sm font-bold border border-gray-100">
              {filteredItems.length} מנות
            </span>
          </div>

          {/* Grid */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {filteredItems.map((item, index) => (
              <CafeItemCard
                key={item.id}
                item={item}
                index={index}
                onClick={(item) => {
                  setSelectedItem(item);
                  setIsModifierOpen(true);
                }}
              />
            ))}
          </motion.div>
        </div>
      </main>

      {selectedItem && (
        <ModifierModal
          isOpen={isModifierOpen}
          onClose={() => setIsModifierOpen(false)}
          itemName={selectedItem.name}
          itemPrice={selectedItem.price}
        />
      )}

      <StoreFooter currentStore="shop" accentColor="blue" />

      <WhatsAppButton
        phoneNumber="+972556822072"
        message="שלום, אשמח להזמין מקום ב-iCaffe 🌱"
      />
    </div>
  );
};

const ShopPage = () => {
  return (
    <Suspense fallback={null}>
      <CafeCatalog />
    </Suspense>
  );
};

export default ShopPage;
