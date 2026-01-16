import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CartItem } from '../types';

export const useCart = (initialItems: CartItem[] = []) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(initialItems);
    const [cartHistory, setCartHistory] = useState<any[]>([]);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    const addItem = useCallback((item: any) => {
        setCartItems(prev => {
            const existing = prev.find(i =>
                i.id === item.id &&
                JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions) &&
                i.notes === item.notes
            );

            if (existing) {
                return prev.map(i => i === existing ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i);
            }

            const newItem: CartItem = {
                ...item,
                quantity: item.quantity || 1,
                tempId: uuidv4(),
                signature: uuidv4()
            };

            setCartHistory(h => [...h, { type: 'ADD', item: newItem }]);
            return [...prev, newItem];
        });
    }, []);

    const removeItem = useCallback((id: string | number, signature?: string, tempId?: string | number) => {
        setCartItems(prev => {
            const toRemove = prev.find(i =>
                (tempId && i.tempId === tempId) ||
                (signature && i.signature === signature) ||
                (i.id === id)
            );
            if (toRemove) {
                setCartHistory(h => [...h, { type: 'REMOVE', item: toRemove }]);
            }
            return prev.filter(i => i !== toRemove);
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setCartHistory([]);
    }, []);

    const normalizeSelectedOptions = useCallback((options: any) => {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        return Object.entries(options).map(([groupId, value]) => {
            if (typeof value === 'object' && value !== null) return value;
            return { groupId, valueId: value };
        });
    }, []);

    return {
        cartItems,
        cartHistory,
        cartTotal,
        addItem,
        removeItem,
        clearCart,
        normalizeSelectedOptions
    };
};

export default useCart;
