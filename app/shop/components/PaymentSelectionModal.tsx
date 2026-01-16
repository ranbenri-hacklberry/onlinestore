'use client';

import React, { useState, useEffect } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { CartItem } from '../types';

interface PaymentSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSelect: (orderData: any) => void;
    cartTotal?: number;
    subtotal?: number;
    loyaltyDiscount?: number;
    soldierDiscountAmount?: number;
    cartItems?: CartItem[];
    isRefund?: boolean;
    refundAmount?: number;
    originalPaymentMethod?: string | null;
    businessId?: string | null;
    customerName?: string;
    customerPhone?: string | null;
}

const PaymentSelectionModal = ({
    isOpen,
    onClose,
    onPaymentSelect,
    cartTotal = 0,
    loyaltyDiscount = 0,
    soldierDiscountAmount = 0,
    cartItems = [],
    customerName = '',
    customerPhone = ''
}: PaymentSelectionModalProps) => {
    const [step, setStep] = useState<'selection' | 'processing'>('selection');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMethod, setProcessingMethod] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep('selection');
            setIsProcessing(false);
            setProcessingMethod(null);
            setSelectedMethod(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatPrice = (num = 0) => {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            maximumFractionDigits: 2
        }).format(num);
    };

    const handleConfirmPayment = () => {
        if (!selectedMethod) return;
        handleStartPayment(selectedMethod);
    }

    const handleStartPayment = (method: string) => {
        setProcessingMethod(method);
        setStep('processing');
        setIsProcessing(true);

        const isManual = ['bit', 'paybox', 'transfer'].includes(method);
        const delay = isManual ? 1000 : 2500; // Faster for manual

        setTimeout(() => {
            const orderData = {
                customer_phone: customerPhone,
                customer_name: customerName,
                payment_method: method,
                is_paid: !isManual, // Manual methods are pending verification
                total_amount: cartTotal,
                discount_amount: loyaltyDiscount + soldierDiscountAmount,
                items: cartItems.map(item => ({
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    mods: item.selectedOptions ? JSON.stringify(item.selectedOptions) : null
                }))
            };
            onPaymentSelect?.(orderData);
            setIsProcessing(false);
        }, delay);
    };

    if (step === 'processing') {
        const isManual = ['bit', 'paybox', 'transfer'].includes(processingMethod || '');
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100]" dir="rtl">
                <div className="bg-white rounded-3xl p-10 flex flex-col items-center space-y-6 max-w-sm w-full shadow-2xl">
                    <div className="relative">
                        <div className={`w-20 h-20 border-4 rounded-full animate-spin ${isManual ? 'border-purple-100 border-t-purple-500' : 'border-amber-100 border-t-amber-500'}`}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            {isManual ? <Check size={32} /> : <Check size={32} />}
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-800 mb-1">{isManual ? 'יוצר הזמנה...' : 'מעבד תשלום...'}</h2>
                        <p className="text-slate-400 font-medium">{isManual ? 'מיד נעבור להעלאת אישור' : 'אנא המתן לאישור העסקה'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const getButtonClass = (method: string) => {
        const isSelected = selectedMethod === method;
        const base = "relative overflow-hidden transition-all duration-200 ";

        // Special styling for primary methods
        if (method === 'apple_pay') return `${base} col-span-1 h-20 bg-black text-white rounded-xl flex flex-col items-center justify-center gap-1 ${isSelected ? 'ring-4 ring-offset-2 ring-black scale-[1.02]' : 'hover:opacity-90 active:scale-95'}`;
        if (method === 'google_pay') return `${base} col-span-1 h-20 bg-white border border-slate-200 text-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 ${isSelected ? 'ring-4 ring-offset-2 ring-blue-500 border-blue-500 scale-[1.02]' : 'hover:bg-slate-50 active:scale-95'}`;
        if (method === 'credit_card') return `${base} w-full py-4 bg-amber-500 text-white rounded-xl flex items-center justify-center gap-3 font-bold shadow-md shadow-amber-200 ${isSelected ? 'ring-4 ring-offset-2 ring-amber-500 scale-[1.02]' : 'hover:bg-amber-600 active:scale-95'}`;

        // Manual methods styling
        if (method === 'bit') return `${base} aspect-square bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex flex-col items-center justify-center gap-1 ${isSelected ? 'ring-4 ring-offset-2 ring-blue-400 border-blue-400 scale-[1.02] bg-blue-100' : 'hover:bg-blue-100 active:scale-95'}`;
        if (method === 'paybox') return `${base} aspect-square bg-purple-50 text-purple-600 border border-purple-100 rounded-xl flex flex-col items-center justify-center gap-1 ${isSelected ? 'ring-4 ring-offset-2 ring-purple-400 border-purple-400 scale-[1.02] bg-purple-100' : 'hover:bg-purple-100 active:scale-95'}`;
        if (method === 'transfer') return `${base} aspect-square bg-slate-50 text-slate-600 border border-slate-100 rounded-xl flex flex-col items-center justify-center gap-1 ${isSelected ? 'ring-4 ring-offset-2 ring-slate-400 border-slate-400 scale-[1.02] bg-slate-100' : 'hover:bg-slate-100 active:scale-95'}`;

        return base;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl" onClick={onClose}>
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 pb-2 text-center shrink-0">
                    <h2 className="text-2xl font-black text-slate-800 mb-1">תשלום בקופה</h2>
                    <p className="text-slate-500 font-medium text-sm">סה״כ לתשלום: <span className="font-bold text-slate-900">{formatPrice(cartTotal)}</span></p>
                </div>

                {/* Payment Options - Scrollable */}
                <div className="p-6 space-y-3 overflow-y-auto">

                    <div className="grid grid-cols-2 gap-3">
                        {/* Apple Pay */}
                        <button onClick={() => setSelectedMethod('apple_pay')} className={getButtonClass('apple_pay')}>
                            {selectedMethod === 'apple_pay' && <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"><Check size={10} className="text-black" /></div>}
                            <span className="text-2xl leading-none"></span> <span className="text-xs font-bold font-sans">Pay</span>
                        </button>
                        {/* Google Pay */}
                        <button onClick={() => setSelectedMethod('google_pay')} className={getButtonClass('google_pay')}>
                            {selectedMethod === 'google_pay' && <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                            <span className="flex items-center gap-1 text-xl"><span className="text-blue-500 font-bold">G</span></span> <span className="text-xs font-bold font-sans">Pay</span>
                        </button>
                    </div>

                    <button onClick={() => setSelectedMethod('credit_card')} className={getButtonClass('credit_card')}>
                        {selectedMethod === 'credit_card' && <div className="absolute right-4"><Check size={20} /></div>}
                        <CreditCard size={20} /> אשראי רגיל
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">העברה / אפליקציות</span></div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setSelectedMethod('bit')} className={getButtonClass('bit')}>
                            {selectedMethod === 'bit' && <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                            <span className="font-black italic text-xl">Bit</span>
                            <span className="text-[10px] font-bold">ביט</span>
                        </button>
                        <button onClick={() => setSelectedMethod('paybox')} className={getButtonClass('paybox')}>
                            {selectedMethod === 'paybox' && <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                            <span className="font-black text-lg">PayBox</span>
                        </button>
                        <button onClick={() => setSelectedMethod('transfer')} className={getButtonClass('transfer')}>
                            {selectedMethod === 'transfer' && <div className="absolute top-2 right-2 w-4 h-4 bg-slate-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                            <span className="text-xl">🏦</span>
                            <span className="text-[10px] font-bold text-center leading-tight">העברה<br />בנקאית</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 shrink-0 space-y-3">
                    <button
                        onClick={handleConfirmPayment}
                        disabled={!selectedMethod}
                        className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-all shadow-lg shadow-stone-200"
                    >
                        {selectedMethod ? `שלם ${formatPrice(cartTotal)}` : 'בחר אמצעי תשלום'}
                    </button>
                    <button onClick={() => onClose()} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                        ביטול וחזרה
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSelectionModal;
