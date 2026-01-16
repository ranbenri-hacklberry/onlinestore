'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, User, Check, Loader2, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import NumericKeypad from './NumericKeypad';

const BUSINESS_ID = '22222222-2222-2222-2222-222222222222';

interface CustomerInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'phone' | 'name' | 'phone-then-name' | string;
    currentCustomer?: any;
    onCustomerUpdate?: (customer: any) => void;
    initialMode?: string;
    orderId?: string | null;
}

/**
 * CustomerInfoModal - Unified modal for collecting/editing customer phone and name
 * Replaces full-page phone/name screens with a popup accessible from cart and KDS
 */
const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({
    isOpen,
    onClose,
    mode = 'phone',
    currentCustomer = null,
    onCustomerUpdate,
    orderId = null,
    initialMode
}) => {
    // Mock user for Online Store
    const currentUser = { business_id: BUSINESS_ID };

    const [step, setStep] = useState(initialMode || mode || 'phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lookupResult, setLookupResult] = useState<any>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
    const [pendingCustomer, setPendingCustomer] = useState<any>(null);

    // Initialize state when modal opens
    useEffect(() => {
        if (isOpen) {
            // Reset state
            setPhoneNumber(currentCustomer?.phone || '');
            // Clear name if it's "הזמנה מהירה" or empty
            setCustomerName(currentCustomer?.name === 'הזמנה מהירה' ? '' : (currentCustomer?.name || ''));
            setError('');
            setLookupResult(null);
            setIsLoading(false);

            // Set initial step based on mode
            const startStep = initialMode || mode;
            if (startStep === 'phone' || startStep === 'phone-then-name') {
                setStep('phone');
            } else if (startStep === 'name') {
                setStep('name');
                // Focus name input after a short delay
                setTimeout(() => nameInputRef.current?.focus(), 100);
            }
        }
    }, [isOpen, mode, currentCustomer, initialMode]);

    if (!isOpen) return null;

    // Format phone number for display
    const formatPhoneDisplay = (phone: string) => {
        const digits = phone?.replace(/[^0-9]/g, '')?.split('') || [];
        if (digits.length > 3) digits.splice(3, 0, '-');
        if (digits.length > 7) digits.splice(7, 0, '-');
        return digits.join('');
    };

    // Handle phone keypad input
    const handleKeypadPress = (value: string) => {
        setError('');

        if (value === 'delete') {
            setPhoneNumber(prev => prev.slice(0, -1));
        } else if (value === '*') {
            return;
        } else if (phoneNumber.length < 10) {
            const newPhone = `${phoneNumber}${value}`;

            // Validation: Check if starts with 05
            if (newPhone.length >= 2 && !newPhone.startsWith('05')) {
                setError('מספר נייד חייב להתחיל ב-05');
            }

            setPhoneNumber(newPhone);
        }
    };

    // Lookup customer by phone
    const handlePhoneLookup = async () => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');

        if (cleanPhone.length !== 10) {
            setError('אנא הכנס מספר נייד תקין בן 10 ספרות');
            return;
        }

        if (!cleanPhone.startsWith('05')) {
            setError('מספר נייד חייב להתחיל ב-05');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // ONLINE: Use RPC (Simplified for Online Store - no Dexie logic)
            const result = await supabase.rpc('lookup_customer', {
                p_phone: cleanPhone,
                p_business_id: currentUser?.business_id || null
            });

            const data = result.data;
            const lookupError = result.error;

            if (lookupError) {
                console.error('❌ RPC Lookup Error:', lookupError);
                throw lookupError;
            }

            setLookupResult(data);

            if (data?.success && !data?.isNewCustomer) {
                // Existing customer found
                const foundCustomer = {
                    id: data.customer.id,
                    phone: cleanPhone,
                    name: data.customer.name,
                    loyalty_coffee_count: data.customer.loyalty_coffee_count || 0
                };

                setPendingCustomer(foundCustomer);
                setShowSwitchConfirm(true);
                setIsLoading(false);
                return;
            } else {
                // New customer - advance to name entry
                if (mode === 'phone-then-name' || true) { // Default to name entry for new
                    setStep('name');
                    setTimeout(() => nameInputRef.current?.focus(), 100);
                }
            }
        } catch (err) {
            console.error('Phone lookup error:', err);
            setError('שגיאה בחיפוש לקוח. אנא נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle customer switch confirmation
    const handleConfirmSwitch = async () => {
        if (!pendingCustomer) return;
        onCustomerUpdate?.(pendingCustomer);
        setShowSwitchConfirm(false);
        setPendingCustomer(null);
        onClose();
    };

    const handleCancelSwitch = () => {
        setShowSwitchConfirm(false);
        setPendingCustomer(null);
        setStep('name');
        setTimeout(() => nameInputRef.current?.focus(), 100);
    };

    // Handle name submission
    const handleNameSubmit = async () => {
        if (!customerName.trim()) {
            setError('אנא הכנס שם');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            let customerId = currentCustomer?.id;

            // Simple Flow: Create customer if phone is provided
            if (cleanPhone && cleanPhone.length === 10) {
                const { data: customerData, error: rpcError } = await supabase.rpc('create_or_update_customer', {
                    p_business_id: currentUser?.business_id,
                    p_phone: cleanPhone || null,
                    p_name: customerName.trim(),
                    p_id: customerId || null
                });

                if (rpcError) throw rpcError;
                customerId = customerData;
            }

            const customer = {
                id: customerId,
                phone: cleanPhone || null,
                name: customerName.trim(),
                loyalty_coffee_count: 0
            };

            onCustomerUpdate?.(customer);
            onClose();
        } catch (err) {
            console.error('Name submission error:', err);
            setError('שגיאה בשמירת הנתונים. אנא נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render phone entry step
    const renderPhoneStep = () => {
        const hasExistingPhone = currentCustomer?.phone && currentCustomer.phone.length >= 9;

        return (
            <>
                <div className="p-4 space-y-3">
                    {hasExistingPhone && phoneNumber === currentCustomer.phone && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Phone size={18} className="text-blue-600" />
                                <span className="text-blue-800 font-bold">טלפון קיים:</span>
                                <span className="text-blue-900 font-mono font-black text-lg" dir="ltr">
                                    {formatPhoneDisplay(currentCustomer.phone)}
                                </span>
                            </div>
                            <button
                                onClick={() => setPhoneNumber('')}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-100 transition"
                            >
                                <User size={18} />
                            </button>
                        </div>
                    )}

                    {(!hasExistingPhone || phoneNumber !== currentCustomer.phone) && (
                        <>
                            <div
                                className={`w-full h-14 bg-gray-50 rounded-xl border-2 flex items-center justify-center transition-colors ${error ? 'border-red-200 bg-red-50' : 'border-gray-100'
                                    }`}
                            >
                                <div className="text-2xl font-mono font-bold text-gray-800 tracking-wider" dir="ltr">
                                    {formatPhoneDisplay(phoneNumber) || '___-___-____'}
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm font-bold text-center flex items-center justify-center gap-1">
                                    <span>⚠️</span>
                                    {error}
                                </div>
                            )}

                            <NumericKeypad onKeyPress={handleKeypadPress} />
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold text-lg hover:bg-gray-300 transition"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={handlePhoneLookup}
                        disabled={phoneNumber.length !== 10 || isLoading}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${phoneNumber.length === 10 && !isLoading
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'המשך'}
                    </button>
                </div>
            </>
        );
    };

    // Render name entry step
    const renderNameStep = () => {
        return (
            <>
                <div className="p-4 space-y-3">
                    <input
                        ref={nameInputRef}
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                            setCustomerName(e.target.value);
                            setError('');
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && customerName.trim()) {
                                handleNameSubmit();
                            }
                        }}
                        placeholder="הכנס שם..."
                        className={`w-full h-14 bg-gray-50 rounded-xl border-2 px-4 text-xl font-bold text-gray-800 text-center transition-colors ${error ? 'border-red-200 bg-red-50' : 'border-gray-100 focus:border-purple-400'
                            } outline-none`}
                        dir="rtl"
                    />

                    {error && (
                        <div className="text-red-600 text-sm font-bold text-center flex items-center justify-center gap-1">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold text-lg hover:bg-gray-300 transition"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={handleNameSubmit}
                        disabled={!customerName.trim() || isLoading}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${customerName.trim() && !isLoading
                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> אישור</>}
                    </button>
                </div>
            </>
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-heebo"
            onClick={onClose}
            dir="rtl"
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {step === 'phone' && renderPhoneStep()}
                {step === 'name' && renderNameStep()}
            </div>

            {showSwitchConfirm && pendingCustomer && (
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    onClick={handleCancelSwitch}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <UserCheck size={32} className="text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">לקוח קיים נמצא</h2>
                            <p className="text-gray-500 font-medium mt-2">
                                הטלפון {pendingCustomer.phone} שייך ל-{pendingCustomer.name}
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={handleCancelSwitch}
                                className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold text-lg hover:bg-gray-300 transition"
                            >
                                לקוח חדש
                            </button>
                            <button
                                onClick={handleConfirmSwitch}
                                className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition"
                            >
                                ✅ כן
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInfoModal;
