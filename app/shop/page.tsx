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
import { ShoppingBag, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const OrderTracker = dynamic(() => import('./components/OrderTracker'), { ssr: false });

// Hooks & Libs
// Hooks & Libs
import { supabase } from '@/lib/supabase';
import { db } from '@/db/database';

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
  const [checkoutInitialStep, setCheckoutInitialStep] = useState<any>(null);

  // Tracking State
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showTracking, setShowTracking] = useState(false);

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

  const clearCart = () => {
    setCartItems([]);
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

        // CHECK FOR ACTIVE ORDER
        const { db } = await import('@/db/database');
        const latestOrder = await db.table('orders').orderBy('created_at').reverse().first();
        if (latestOrder && latestOrder.order_status !== 'delivered') {
          setActiveOrder(latestOrder);
          setShowTracking(true);
        }

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
        activeOrder={activeOrder}
        onTrackClick={() => setShowTracking(true)}
        onHomeClick={() => { setShowTracking(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        hideCart={showTracking}
      />

      <main className="pb-32">
        {showTracking && activeOrder ? (
          <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowTracking(false)}
                className="flex items-center gap-2 text-stone-500 font-bold hover:text-stone-800 transition-colors"
              >
                <ArrowRight size={20} />
                <span>חזרה לתפריט</span>
              </button>
              <h2 className="text-2xl font-black text-stone-900">מעקב הזמנה</h2>
            </div>

            <Suspense fallback={<div className="h-96 bg-stone-50 animate-pulse rounded-3xl" />}>
              <OrderTracker
                order={activeOrder}
                customer={null}
                onAvatarClick={() => {
                  setCheckoutInitialStep('avatar');
                  setIsCheckoutOpen(true);
                }}
              />
            </Suspense>
          </div>
        ) : (
          <>
            <StoreHero />

            <div className="max-w-7xl mx-auto px-4 md:px-8 overflow-hidden">
              <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md py-4 border-b border-gray-100 mb-8 w-full">
                <MenuCategoryFilter
                  categories={displayCategories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900">
                  {displayCategories.find(c => c.id === activeCategory)?.name || 'התפריט שלנו'}
                </h2>
                <span className="bg-gray-50 text-gray-400 px-4 py-1 rounded-full text-sm font-bold border border-gray-100">
                  {filteredItems.length} מנות
                </span>
              </div>

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
          </>
        )}
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
        onClose={() => { setIsCheckoutOpen(false); setCheckoutInitialStep(null); }}
        cartItems={cartItems}
        cartTotal={cartTotal}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onOrderSuccess={clearCart}
        businessId={BUSINESS_ID}
        initialStep={checkoutInitialStep}
      />

      <StoreFooter currentStore="shop" accentColor="blue" />

      <WhatsAppButton
        phoneNumber="+972556822072"
        message="שלום, אשמח להזמין מקום ב-iCaffe 🌱"
        className="bottom-24 right-6"
      />

      {/* Floating Cart Button */}
      {
        cartCount > 0 && (
          <motion.button
            onClick={() => setIsCheckoutOpen(true)}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-orange-500 text-white rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center border-4 border-white"
          >
            <div className="relative">
              <ShoppingBag size={28} strokeWidth={2.5} />
              <span className="absolute -top-3 -right-3 bg-white text-orange-600 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-orange-500">
                {cartCount}
              </span>
            </div>
          </motion.button>
        )
      }
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
