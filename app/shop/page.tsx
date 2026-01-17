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
import CheckoutModal from './components/CheckoutModal';

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

  // Cart State
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addToCart = (item: any, selectedOptions: any) => {
    const signature = JSON.stringify(selectedOptions);
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.signature === signature);
      if (existing) {
        return prev.map(i => i.id === item.id && i.signature === signature
          ? { ...i, quantity: i.quantity + 1 }
          : i
        );
      }
      return [...prev, { ...item, quantity: 1, signature, selectedOptions }];
    });
    setIsModifierOpen(false);
  };

  const removeFromCart = (itemId: number | string, signature: string) => {
    setCartItems(prev => prev.filter(i => !(i.id === itemId && i.signature === signature)));
  };

  const updateQuantity = (itemId: number | string, signature: string, delta: number) => {
    setCartItems(prev => prev.map(i =>
      i.id === itemId && i.signature === signature
        ? { ...i, quantity: Math.max(1, i.quantity + delta) }
        : i
    ));
  };

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((acc, item) => {
    const optionsPrice = Object.values(item.selectedOptions || {}).reduce((sum: number, opt: any) => sum + (opt.price || 0), 0);
    return acc + (item.price + optionsPrice) * item.quantity;
  }, 0), [cartItems]);

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
        cartCount={cartCount}
        onCartClick={() => setIsCheckoutOpen(true)}
        hideCart={false}
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
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          itemPrice={selectedItem.price}
          onConfirm={(options) => addToCart(selectedItem, options)}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        cartTotal={cartTotal}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

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
