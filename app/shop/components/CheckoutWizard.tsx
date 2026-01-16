'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Customer, CartItem } from '../types';
import Button from '@/components/ui/Button';
import OTPLogin from './OTPLogin';
import AddressLookup from './AddressLookup';
import PaymentSelectionModal from './PaymentSelectionModal';
import OrderTracker from './OrderTracker';
import { ArrowLeft, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

interface CheckoutWizardProps {
    cartItems: CartItem[];
    cartTotal: number;
    initialCustomer: Customer | null;
    businessId: string;
    onBackToMenu: () => void;
    onOrderComplete: (order: any) => void;
}

export default function CheckoutWizard({
    cartItems,
    cartTotal,
    initialCustomer,
    businessId,
    onBackToMenu,
    onOrderComplete
}: CheckoutWizardProps) {
    const [step, setStep] = useState<'auth' | 'details' | 'payment-selection' | 'tracking'>('auth');
    const [customer, setCustomer] = useState<Customer | null>(initialCustomer);
    const [address, setAddress] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [entrance, setEntrance] = useState('');
    const [floor, setFloor] = useState('');
    const [apt, setApt] = useState('');
    const [notes, setNotes] = useState('');
    const [isPickup, setIsPickup] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<any>(null);

    // Skip auth if customer already exists
    React.useEffect(() => {
        if (initialCustomer && step === 'auth') {
            setStep('details');
        }
    }, [initialCustomer]);

    const handleAuthSuccess = (cust: any) => {
        setCustomer(cust);
        setStep('details');
    };

    const handleDetailsSubmit = () => {
        setStep('payment-selection');
    };

    const handlePaymentComplete = (orderData: any) => {
        console.log("Wizard Order Data:", orderData);

        let fullAddress = 'איסוף עצמי';
        if (!isPickup) {
            fullAddress = `${address} ${houseNumber}`;
            if (entrance) fullAddress += `, כניסה ${entrance}`;
            if (floor) fullAddress += `, קומה ${floor}`;
            if (apt) fullAddress += `, דירה ${apt}`;
        }

        const finalOrder = {
            ...orderData,
            customer_name: customer?.name,
            customer_phone: customer?.phone,
            delivery_address: fullAddress,
            order_type: 'delivery', // Force delivery to ensure 'pending' status
            notes: notes
        };

        onOrderComplete(finalOrder);
        setCompletedOrder(finalOrder);
        setStep('tracking');
    };

    if (step === 'tracking') {
        return <OrderTracker order={completedOrder || { id: 'TEMP-ID' }} customer={customer} />;
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            {/* Nav */}
            <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-40 border-b border-stone-100 shadow-sm">
                <button
                    onClick={() => step === 'auth' ? onBackToMenu() : setStep(prev => prev === 'payment-selection' ? 'details' : 'auth')}
                    className="p-2 -ml-2 hover:bg-stone-50 rounded-full"
                >
                    <ArrowLeft className="text-stone-600" />
                </button>
                <div className="flex-1 text-center font-bold text-stone-800">
                    {step === 'auth' && 'התחברות'}
                    {step === 'details' && 'פרטי משלוח'}
                    {step === 'payment-selection' && 'תשלום'}
                </div>
                <div className="w-8" />
            </div>

            <div className="flex-1 max-w-md mx-auto w-full p-6 pb-32">
                <AnimatePresence mode="wait">
                    {step === 'auth' && (
                        <motion.div
                            key="auth"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="h-full"
                        >
                            <OTPLogin
                                businessId={businessId}
                                onLoginSuccess={handleAuthSuccess}
                                onBack={onBackToMenu}
                                cartTotal={cartTotal}
                                cartItemsCount={cartItems.reduce((a, b) => a + b.quantity, 0)}
                            />
                        </motion.div>
                    )}

                    {step === 'details' && (
                        <motion.div
                            key="details"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Pickup Toggle */}
                            <div className="bg-white p-1 rounded-xl flex border border-stone-200 shadow-sm">
                                <button
                                    onClick={() => setIsPickup(false)}
                                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${!isPickup ? 'bg-orange-400 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
                                >
                                    משלוח עד הבית
                                </button>
                                <button
                                    onClick={() => setIsPickup(true)}
                                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${isPickup ? 'bg-orange-400 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
                                >
                                    איסוף עצמי
                                </button>
                            </div>

                            {/* Address Input */}
                            {!isPickup && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex gap-3">
                                        <div className="space-y-2 flex-1">
                                            <label className="text-sm font-bold text-stone-600">רחוב ועיר</label>
                                            <AddressLookup
                                                onAddressSelect={setAddress}
                                                initialAddress={address}
                                            />
                                        </div>
                                        <div className="space-y-2 w-24 shrink-0">
                                            <label className="text-sm font-bold text-stone-600">מספר בית</label>
                                            <input
                                                value={houseNumber}
                                                onChange={e => setHouseNumber(e.target.value)}
                                                placeholder="15"
                                                className="w-full h-14 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-400 text-center font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* 3 Boxes: Entrance, Floor, Apt */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-stone-600">כניסה</label>
                                            <select
                                                value={entrance}
                                                onChange={e => setEntrance(e.target.value)}
                                                className="w-full h-14 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-400 text-center font-bold appearance-none"
                                            >
                                                <option value="">-</option>
                                                {['א', 'ב', 'ג', 'ד'].map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-stone-600">קומה</label>
                                            <select
                                                value={floor}
                                                onChange={e => setFloor(e.target.value)}
                                                className="w-full h-14 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-400 text-center font-bold appearance-none"
                                            >
                                                <option value="">-</option>
                                                {Array.from({ length: 106 }, (_, i) => i - 5).map(i => (
                                                    <option key={i} value={i}>{i}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-stone-600">דירה</label>
                                            <input
                                                value={apt}
                                                onChange={e => setApt(e.target.value)}
                                                placeholder="מס'"
                                                className="w-full h-14 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-400 text-center font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-stone-600">הערות לשליח / קוד לבניין</label>
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="קומה 2, דירה 5, קוד 1234, להשאיר ליד הדלת..."
                                            rows={2}
                                            className="w-full p-4 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-400 resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {isPickup && (
                                <div className="space-y-4 animate-in zoom-in">
                                    <div className="p-6 text-center bg-white rounded-2xl border border-stone-200">
                                        <ShoppingBag size={48} className="mx-auto text-orange-400 mb-4" />
                                        <h3 className="text-xl font-bold mb-2">איסוף מהסניף</h3>
                                        <p className="text-stone-500 mb-6">ההזמנה תחכה לך מוכנה בסניף בעוד כ-15 דקות.</p>

                                        <div className="space-y-4 text-right">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-stone-600">שם למסירה (חובה)</label>
                                                <input
                                                    value={customer?.name || ''}
                                                    onChange={e => setCustomer(prev => ({ ...prev!, name: e.target.value }))}
                                                    placeholder="שם מלא"
                                                    className={`w-full h-12 px-4 bg-stone-50 border ${!customer?.name ? 'border-red-300' : 'border-stone-200'} rounded-xl outline-none focus:border-orange-400 transition-colors`}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-stone-600">הערות למטבח</label>
                                                <textarea
                                                    value={notes}
                                                    onChange={e => setNotes(e.target.value)}
                                                    placeholder="אלרגיות, בקשות מיוחדות..."
                                                    rows={2}
                                                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-orange-400 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleDetailsSubmit}
                                disabled={(!isPickup && (address.length < 2 || !houseNumber)) || (isPickup && (!customer?.name || customer.name.trim().length < 2))}
                                className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                המשך לתשלום
                            </button>
                        </motion.div>
                    )}

                    {step === 'payment-selection' && (
                        <PaymentSelectionModal
                            isOpen={true}
                            onClose={() => setStep('details')}
                            onPaymentSelect={handlePaymentComplete}
                            cartTotal={cartTotal}
                            cartItems={cartItems}
                            customerName={customer?.name}
                            customerPhone={customer?.phone}
                            businessId={businessId}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
