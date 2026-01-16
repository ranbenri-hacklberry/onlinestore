'use client';

import React, { useMemo } from 'react';
import Icon from '@/components/AppIcon';
import { CartItem } from '../types';

interface CheckoutButtonProps {
    cartTotal: number;
    originalTotal?: number;
    loyaltyDiscount?: number;
    cartItems: CartItem[];
    onInitiatePayment: (orderData?: any) => void;
    disabled?: boolean;
    className?: string;
    isEditMode?: boolean;
    editingOrderData?: any;
}

const CheckoutButton = ({
    cartTotal = 0,
    originalTotal,
    loyaltyDiscount = 0,
    cartItems = [],
    onInitiatePayment,
    disabled = false,
    className = "",
    isEditMode = false,
    editingOrderData = null
}: CheckoutButtonProps) => {
    // Format price to Israeli Shekel (ILS)
    const formatPrice = (price: number) => {
        const num = Number(price);
        const hasDecimals = num % 1 !== 0;
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: hasDecimals ? 2 : 0,
            maximumFractionDigits: 2
        }).format(num);
    };

    const handlePaymentClick = () => {
        if (onInitiatePayment && cartItems.length > 0) {
            onInitiatePayment();
        }
    };

    const originalTotalAmount = editingOrderData?.totalAmount || 0;
    const originalIsPaid = editingOrderData?.isPaid || false;
    const priceDifference = cartTotal - originalTotalAmount;

    const isRefund = isEditMode && originalIsPaid && priceDifference < 0;
    const isDisabled = disabled || (cartItems.length === 0 && !isRefund);
    const isAdditionalCharge = isEditMode && originalIsPaid && priceDifference > 0;
    const isFinalizingOrder = isEditMode && !originalIsPaid;
    const isNoChangeUpdate = isEditMode && originalIsPaid && priceDifference === 0;

    const buttonText = useMemo(() => {
        if (isDisabled) return 'הוסף פריטים להזמנה';
        if (!isEditMode) return 'המשך לתשלום';
        if (isRefund) return 'החזר כספי';
        if (isAdditionalCharge) return 'חיוב נוסף';
        if (isFinalizingOrder) return 'לתשלום';
        return 'עדכן הזמנה';
    }, [isDisabled, isEditMode, isRefund, isAdditionalCharge, isFinalizingOrder]);

    const buttonAmount = useMemo(() => {
        if (isDisabled && !isEditMode && cartTotal <= 0 && loyaltyDiscount === 0) return '';
        if (isRefund) return formatPrice(Math.abs(priceDifference));
        if (isAdditionalCharge) return formatPrice(priceDifference);
        return formatPrice(cartTotal);
    }, [isDisabled, isEditMode, isRefund, isAdditionalCharge, cartTotal, priceDifference, loyaltyDiscount]);

    const buttonVariantClass = useMemo(() => {
        if (isDisabled) return 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300';
        if (isEditMode && isRefund) return 'bg-red-500 hover:bg-red-600 text-white shadow-xl';
        if (isAdditionalCharge || isFinalizingOrder || !isEditMode) return 'bg-orange-500 hover:bg-orange-600 text-white shadow-xl';
        return 'bg-gray-500 hover:bg-gray-600 text-white shadow-xl';
    }, [isDisabled, isEditMode, isRefund, isAdditionalCharge, isFinalizingOrder]);

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 lg:static lg:z-auto ${className}`} dir="rtl">
            {isEditMode && originalIsPaid && (
                <div className="flex flex-col gap-2 mb-3 bg-blue-50 border border-blue-100 rounded-xl p-3 shadow-sm text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">סטטוס תשלום</span>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500 text-white text-[10px] font-black rounded-full">
                            <Icon name="CheckCircle" size={10} /> שולם
                        </span>
                    </div>
                </div>
            )}

            <button
                onClick={handlePaymentClick}
                disabled={isDisabled && !isRefund}
                className={`
          w-full flex items-center justify-between px-6 py-4 rounded-xl font-extrabold text-xl transition-all duration-200
          ${buttonVariantClass}
        `}
            >
                <span>{buttonText}</span>
                <span className={`font-mono text-2xl ${isDisabled && !isEditMode ? 'hidden' : ''}`}>
                    {buttonAmount}
                </span>
            </button>

            {!isDisabled && !isEditMode && (
                <div className="flex items-center justify-center space-x-6 text-[10px] text-gray-400 mt-3 gap-4">
                    <div className="flex items-center gap-1">
                        <Icon name="CreditCard" size={12} />
                        <span>אשראי</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Icon name="Smartphone" size={12} />
                        <span>Apple Pay</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutButton;
