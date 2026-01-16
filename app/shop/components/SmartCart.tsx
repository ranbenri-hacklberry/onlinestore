'use client';

import React, { useMemo } from 'react';
import { Trash2, ShoppingBag, Edit2, CreditCard, RefreshCw, Clock, Phone, User, Truck, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getShortName, getModColorClass } from '@/config/modifierShortNames';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
    item: CartItemType;
    onRemove?: (id: string | number, signature?: string, tempId?: string | number) => void;
    onEdit?: (item: CartItemType) => void;
    onToggleDelay?: (id: string | number, signature?: string) => void;
}

const formatPrice = (price = 0) => {
    const num = Number(price);
    const hasDecimals = num % 1 !== 0;
    return new Intl.NumberFormat('he-IL', {
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: 2
    }).format(num);
};

const CartItem = React.memo(({ item, onRemove, onEdit }: CartItemProps) => {
    const cleanName = item.name ? item.name.replace(/<[^>]+>/g, '').trim() : '';

    const mods = useMemo(() => {
        let rawMods: any[] = [];
        if (Array.isArray(item.selectedOptions)) {
            rawMods = item.selectedOptions;
        } else if (item.options) {
            rawMods = item.options;
        }

        const modNames = rawMods
            .map(m => {
                if (typeof m === 'object') return m.valueName || m.name;
                return m;
            })
            .filter(Boolean)
            .filter(modName => {
                const lower = String(modName).toLowerCase();
                return !lower.includes('רגיל') && !lower.includes('default') && lower.trim() !== '';
            });

        return [...new Set(modNames)] as string[];
    }, [item]);

    return (
        <div
            onClick={() => onEdit?.(item)}
            className="group flex items-center justify-between bg-white px-2 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        >
            <div className="flex-1 flex flex-col items-start min-w-0">
                <div className="flex items-center gap-1.5 w-full">
                    {item.quantity > 1 && (
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-1 rounded">
                            x{item.quantity}
                        </span>
                    )}
                    <span className="font-bold text-gray-800 truncate">{cleanName}</span>
                    <span className="font-mono font-bold text-gray-900 mr-auto">
                        {formatPrice(item.price * item.quantity)}
                    </span>
                </div>
                {mods.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {mods.map((mod, i) => {
                            const short = getShortName(mod);
                            if (!short) return null;
                            return (
                                <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${getModColorClass(mod, short)}`}>
                                    {short}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onRemove?.(item.id, item.signature, item.tempId); }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
                <Trash2 size={20} />
            </button>
        </div>
    );
});

interface SmartCartProps {
    cartItems: CartItemType[];
    onRemoveItem?: (id: string | number, signature?: string, tempId?: string | number) => void;
    onEditItem?: (item: CartItemType) => void;
    onInitiatePayment?: () => void;
    onAddCustomerDetails?: (mode: string) => void;
    onSetDelivery?: () => void;
    customerName?: string;
    customerPhone?: string | null;
    loyaltyDiscount?: number;
    finalTotal: number;
    loyaltyPoints?: number;
    cartHistory?: any[];
}

const SmartCart = ({
    cartItems = [],
    onRemoveItem,
    onEditItem,
    onInitiatePayment,
    onAddCustomerDetails,
    onSetDelivery,
    customerName,
    customerPhone,
    loyaltyDiscount = 0,
    finalTotal,
    loyaltyPoints = 0
}: SmartCartProps) => {

    const cartTotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header - Identical to Original */}
            <div className="p-4 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    {!customerPhone ? (
                        <>
                            <button
                                onClick={() => onAddCustomerDetails?.('phone')}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 shadow-sm"
                            >
                                <Phone size={16} />
                                <span>טלפון</span>
                            </button>
                            <button
                                onClick={() => onAddCustomerDetails?.('name')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm flex items-center gap-1.5"
                            >
                                <User size={16} />
                                <span>שם</span>
                            </button>
                            <button
                                onClick={() => onSetDelivery?.()}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold text-sm flex items-center gap-1.5"
                            >
                                <Truck size={16} />
                                <span>משלוח</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col">
                            <span className="font-black text-gray-800 text-xl">{customerName || 'לקוח'}</span>
                            <span className="text-gray-500 font-mono text-sm">{customerPhone}</span>
                        </div>
                    )}
                </div>

                {customerPhone && (
                    <div className="mt-2">
                        <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded-full border border-orange-100">
                            ☕ {loyaltyPoints ?? 0}/10 לקפה חינם
                        </span>
                    </div>
                )}
            </div>

            {/* Items List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-gray-400">
                        <ShoppingBag size={48} className="mb-2" />
                        <span className="font-bold">העגלה ריקה</span>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <CartItem
                            key={item.tempId || item.signature || item.id}
                            item={item}
                            onRemove={onRemoveItem}
                            onEdit={onEditItem}
                        />
                    ))
                )}
            </div>

            {/* Footer - Static at Bottom */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {loyaltyDiscount > 0 && (
                    <div className="flex justify-between items-center mb-3 p-2 bg-green-50 text-green-700 rounded-lg border border-green-100 font-bold text-sm">
                        <span>🎁 הנחת נאמנות</span>
                        <span>-{formatPrice(loyaltyDiscount)}</span>
                    </div>
                )}

                <button
                    onClick={onInitiatePayment}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-black text-xl shadow-lg transition-all flex items-center justify-between px-6"
                >
                    <span>לתשלום</span>
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-lg">
                        ₪{formatPrice(finalTotal)}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default React.memo(SmartCart);
