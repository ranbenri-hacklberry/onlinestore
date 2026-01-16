'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

// Components
import StoreHeader from './components/StoreHeader';
import StoreHero from './components/StoreHero';
import MenuCategoryFilter from './components/MenuCategoryFilter';
import MenuGrid from './components/MenuGrid';
import SmartCart from './components/SmartCart';
import PaymentSelectionModal from './components/PaymentSelectionModal';
import ModifierModal from './components/ModifierModal';
import DeliveryAddressModal from './components/DeliveryAddressModal';
import OrderConfirmationModal from '@/components/ui/OrderConfirmationModal';
import CustomerInfoModal from '@/components/CustomerInfoModal';
import CheckoutButton from './components/CheckoutButton';
import StoreFooter from '@/components/StoreFooter';

// Hooks & Libs
import { useMenuItems, useCart } from './hooks';
import { supabase } from '@/lib/supabase';
import { MenuItem, CartItem, Customer } from './types';

const BUSINESS_ID = '22222222-2222-2222-2222-222222222222';
const APP_VERSION = 'v2.2.0-redesign';

const MenuOrderingInterface = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mock currentUser (constant for online shop)
  const currentUser = useMemo(() => ({
    business_id: BUSINESS_ID,
    whatsapp_phone: '0000000000'
  }), []);

  // ===== Hooks =====
  const {
    menuItems,
    menuLoading,
    error,
    activeCategory,
    filteredItems,
    groupedItems,
    categories,
    handleCategoryChange,
    fetchMenuItems
  } = useMenuItems('hot-drinks', BUSINESS_ID);

  const {
    cartItems,
    cartHistory,
    cartTotal,
    addItem: cartAddItem,
    removeItem: cartRemoveItem,
    clearCart: cartClearCart,
  } = useCart([] as CartItem[]);

  // ===== State =====
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [selectedItemForMod, setSelectedItemForMod] = useState<any>(null);
  const [editingCartItem, setEditingCartItem] = useState<any>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<any>(null);
  const [soldierDiscountAmount, setSoldierDiscountAmount] = useState(0);

  // Customer State
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const [customerInfoModalMode, setCustomerInfoModalMode] = useState('phone');

  // Delivery State
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryNotes, setDeliveryNotes] = useState<string | null>(null);
  const [orderType, setOrderType] = useState('dine_in');

  // Loyalty State
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loyaltyFreeItemsCount, setLoyaltyFreeItemsCount] = useState(0);

  // Initial load
  useEffect(() => {
    const raw = localStorage.getItem('currentCustomer');
    if (raw) setCurrentCustomer(JSON.parse(raw));

    // Check for active order
    const checkActiveOrder = async () => {
      const storedOrderId = localStorage.getItem('activeOrderId');
      if (!storedOrderId) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', storedOrderId)
          .single();

        if (error) throw error;

        if (data && !['delivered', 'cancelled'].includes(data.order_status)) {
          setCompletedOrder(data); // Use completedOrder as the active order container
          // Removed auto-redirect
        } else {
          // Cleanup if order is done
          localStorage.removeItem('activeOrderId');
        }
      } catch (err) {
        console.error('Error fetching active order:', err);
      }
    };
    checkActiveOrder();
  }, []);

  // Loyalty calculation logic (Buy 9 get 10th free)
  useEffect(() => {
    if (!currentCustomer?.phone) {
      setLoyaltyDiscount(0);
      return;
    }

    const coffeeItems = cartItems.filter(item => item.is_hot_drink);
    const cartCoffeeCount = coffeeItems.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCoffeeCount === 0) {
      setLoyaltyDiscount(0);
      return;
    }

    let simPoints = loyaltyPoints;
    let freeCount = 0;

    for (let i = 0; i < cartCoffeeCount; i++) {
      simPoints++;
      if (simPoints >= 10) {
        freeCount++;
        simPoints = 0;
      }
    }

    if (freeCount > 0) {
      // Sort by price to discount cheapest
      const flatCoffees = [] as number[];
      cartItems.filter(i => i.is_hot_drink).forEach(item => {
        for (let i = 0; i < item.quantity; i++) flatCoffees.push(item.price);
      });
      flatCoffees.sort((a, b) => a - b);
      const discount = flatCoffees.slice(0, freeCount).reduce((sum, p) => sum + p, 0);
      setLoyaltyDiscount(discount);
      setLoyaltyFreeItemsCount(freeCount);
    } else {
      setLoyaltyDiscount(0);
      setLoyaltyFreeItemsCount(0);
    }
  }, [cartItems, currentCustomer, loyaltyPoints]);

  const finalTotal = useMemo(() => {
    return Math.max(0, cartTotal - loyaltyDiscount - soldierDiscountAmount + deliveryFee);
  }, [cartTotal, loyaltyDiscount, soldierDiscountAmount, deliveryFee]);

  // ===== View State =====
  const [viewMode, setViewMode] = useState<'menu' | 'checkout' | 'tracking'>('menu');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Handlers
  const handleAddToCart = useCallback((item: MenuItem) => {
    setSelectedItemForMod({ ...item });
    setShowModifierModal(true);
  }, []);

  const handleEditCartItem = useCallback((item: CartItem) => {
    setEditingCartItem(item);
    setSelectedItemForMod({ ...item });
    setShowModifierModal(true);
  }, []);

  const handleAddItemWithModifiers = useCallback((itemWithMods: any) => {
    if (editingCartItem) {
      cartRemoveItem(editingCartItem.id, editingCartItem.signature, editingCartItem.tempId);
    }
    cartAddItem(itemWithMods);
    setShowModifierModal(false);
    setSelectedItemForMod(null);
    setEditingCartItem(null);
  }, [editingCartItem, cartAddItem, cartRemoveItem]);

  const handleInitiateCheckout = useCallback(() => {
    setViewMode('checkout');
  }, []);

  const handleOrderComplete = async (orderData: any) => {
    setIsProcessingOrder(true);
    try {
      const preparedItems = cartItems.map(item => ({
        id: item.tempId || uuidv4(),
        item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        mods: item.selectedOptions,
        notes: item.notes,
        item_status: 'new'
      }));

      const { data, error } = await supabase.rpc('submit_order_v3', {
        p_customer_phone: orderData.customer_phone || '0000000000',
        p_customer_name: orderData.customer_name || 'אורח אונליין',
        p_items: preparedItems,
        p_is_paid: true,
        p_payment_method: orderData.payment_method,
        p_final_total: finalTotal,
        p_business_id: BUSINESS_ID,
        p_order_type: orderData.order_type || 'dine_in', // e.g. 'delivery' from wizard
        p_delivery_address: orderData.delivery_address,
        p_delivery_fee: deliveryFee, // Should update this if Wizard changes it
        p_delivery_notes: orderData.notes
      });

      if (error) throw error;

      // Success
      setCompletedOrder({
        id: data.order_id,
        ...orderData
      });

      // Persist session
      localStorage.setItem('activeOrderId', data.order_id);

      cartClearCart();
      // Wizard handles the tracking view, we just keep state here if needed
    } catch (err: any) {
      alert('שגיאה ביצירת הזמנה: ' + err.message);
    } finally {
      setIsProcessingOrder(false);
    }
  };


  if (menuLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // CHECKOUT VIEW
  if (viewMode === 'checkout') {
    // Import dynamically to avoid circle dep? No, just import normally.
    // Assuming CheckoutWizard is imported
    const CheckoutWizard = require('./components/CheckoutWizard').default;

    return (
      <CheckoutWizard
        cartItems={cartItems}
        cartTotal={finalTotal}
        initialCustomer={currentCustomer}
        businessId={BUSINESS_ID}
        onBackToMenu={() => setViewMode('menu')}
        onOrderComplete={handleOrderComplete}
      />
    );
  }

  // TRACKING VIEW
  if (viewMode === 'tracking' && completedOrder) {
    const OrderTracker = require('./components/OrderTracker').default;
    return (
      <OrderTracker
        order={completedOrder}
        customer={currentCustomer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 font-heebo pastel-theme" dir="rtl">
      {/* New Header */}
      <StoreHeader
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => {
          if (cartItems.length > 0) handleInitiateCheckout();
        }}
        activeOrder={completedOrder}
        onTrackClick={() => setViewMode('tracking')}
      />

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto min-h-screen">

        {/* Content Area */}
        <div className="flex-1 w-full lg:w-3/4 flex flex-col">

          {/* Hero */}
          <div className="px-0 md:px-6 pt-0 md:pt-6">
            <StoreHero />
          </div>

          {/* Categories (Sticky) */}
          <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md pt-2 pb-2 px-4 md:px-8 border-b border-gray-100 shadow-sm transition-all rounded-b-xl mb-4">
            <MenuCategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 px-4 md:px-8 py-2 pb-32">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 flex items-baseline gap-2"
            >
              <h2 className="text-3xl font-black text-slate-800">
                {categories.find(c => c.id === activeCategory)?.name || 'תפריט'}
              </h2>
              <span className="text-sm text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredItems.length}
              </span>
            </motion.div>

            <MenuGrid
              items={filteredItems}
              groupedItems={groupedItems}
              activeCategory={activeCategory}
              onItemClick={handleAddToCart}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Sidebar Cart (Desktop) */}
        <div className="hidden lg:block w-[400px] p-6 shrink-0 relative z-30">
          <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
            <SmartCart
              cartItems={cartItems}
              onRemoveItem={cartRemoveItem}
              onEditItem={handleEditCartItem}
              onInitiatePayment={handleInitiateCheckout}
              onAddCustomerDetails={(mode) => {
                setCustomerInfoModalMode(mode);
                setShowCustomerInfoModal(true);
              }}
              onSetDelivery={() => { }} // Disabled in Menu View
              customerName={currentCustomer?.name}
              customerPhone={currentCustomer?.phone}
              loyaltyDiscount={loyaltyDiscount}
              loyaltyPoints={loyaltyPoints}
              finalTotal={finalTotal}
              cartHistory={cartHistory}
            />
          </div>
        </div>

      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 px-4 z-50 pointer-events-none">
        <div className="pointer-events-auto transform transition-transform hover:scale-105 active:scale-95 shadow-orange-500/30">
          <CheckoutButton
            cartTotal={finalTotal}
            cartItems={cartItems}
            onInitiatePayment={handleInitiateCheckout}
            disabled={isProcessingOrder}
          />
        </div>
      </div>

      {/* Modals */}
      {showModifierModal && selectedItemForMod && (
        <ModifierModal
          isOpen={showModifierModal}
          selectedItem={selectedItemForMod}
          onClose={() => {
            setShowModifierModal(false);
            setSelectedItemForMod(null);
            setEditingCartItem(null);
          }}
          onAddItem={handleAddItemWithModifiers}
        />
      )}

      {/* 
         Legacy Modals (Payment/Delivery) removed from here as CheckoutWizard handles them.
         Keeping CustomerInfoModal for "My Account" interactions if needed, but CheckoutWizard calls OTPLogin internally.
      */}
      <CustomerInfoModal
        isOpen={showCustomerInfoModal}
        onClose={() => setShowCustomerInfoModal(false)}
        onCustomerUpdate={(customer: Customer) => {
          setCurrentCustomer(customer);
          localStorage.setItem('currentCustomer', JSON.stringify(customer));
          setShowCustomerInfoModal(false);
        }}
        initialMode={customerInfoModalMode}
      />

      <div className="fixed bottom-1 left-2 text-[10px] text-gray-300 font-mono z-50 opacity-30 hover:opacity-100 transition-opacity pointer-events-none">
        {APP_VERSION}
      </div>

      {/* Footer */}
      <StoreFooter currentStore="shop" accentColor="orange" />
    </div>
  );
};

const ShopPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
      <MenuOrderingInterface />
    </Suspense>
  );
};

export default ShopPage;
