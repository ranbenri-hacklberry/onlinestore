'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import NumericKeypad from '@/components/NumericKeypad';
import { supabase } from '@/lib/supabase';

interface OTPLoginProps {
    onLoginSuccess: (customer: any) => void;
    onBack: () => void;
    initialPhone?: string;
    businessId: string;
    cartTotal?: number;
    cartItemsCount?: number;
}

export default function OTPLogin({ onLoginSuccess, onBack, initialPhone = '', businessId, cartTotal = 0, cartItemsCount = 0 }: OTPLoginProps) {
    const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
    const [phone, setPhone] = useState(initialPhone);
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-submit OTP
    useEffect(() => {
        if (step === 'otp' && otp.length === 6 && !isLoading) {
            handleVerifyOTP();
        }
    }, [otp, step]);

    const handleKeypadPress = (val: string) => {
        setError('');
        if (step === 'phone') {
            if (val === 'delete') setPhone(p => p.slice(0, -1));
            else if (val === '*' || val === 'submit') return; // submit handled separately
            else if (phone.length < 10) setPhone(p => p + val);
        } else if (step === 'otp') {
            if (val === 'delete') setOtp(o => o.slice(0, -1));
            else if (val === '*' || val === 'submit') return;
            else if (otp.length < 6) setOtp(o => o + val);
        }
    };

    const handleSendOTP = async () => {
        if (!phone.startsWith('05') || phone.length !== 10) {
            setError('מספר לא תקין');
            return;
        }
        setIsLoading(true);
        // DEMO BYPASS
        setTimeout(() => {
            setIsLoading(false);
            setStep('otp');
        }, 1000);
    };

    const handleVerifyOTP = async () => {
        if (isLoading) return; // Prevent double submission

        let currentOtp = otp;
        // If called immediately after state update, otp might be stale in closure? 
        // No, useEffect ensures we have latest otp.

        // Use functional state to be safe if checking length inside handlers, but useEffect matches current render cycle.

        if (phone === '0500000000' && otp === '123456') {
            setIsLoading(true);
            // Bypass login
            setTimeout(() => {
                checkCustomerExistence();
            }, 800);
            return;
        }

        // In a real app, verify against Supabase here
        // For demo, if length is 6, assume valid or show error
        if (otp.length === 6) {
            // Logic for real verification would go here
            // For now we simulate success/fail
            if (otp === '123456' || otp === '111111') {
                setIsLoading(true);
                checkCustomerExistence();
            } else {
                setError('קוד שגוי');
            }
        }
    };

    const checkCustomerExistence = async () => {
        try {
            const { data, error } = await supabase.rpc('lookup_customer', {
                p_phone: phone,
                p_business_id: businessId
            });

            if (data?.success && !data?.isNewCustomer) {
                // Determine loyalty count safely
                const loyaltyCount = data.customer.loyalty_coffee_count ||
                    data.customer.loyalty_points || 0;

                onLoginSuccess({
                    id: data.customer.id,
                    name: data.customer.name,
                    phone: phone,
                    loyalty_coffee_count: loyaltyCount
                });
            } else {
                setStep('name');
            }
        } catch (err) {
            console.error(err);
            setStep('name'); // Assume new if logic fails
        } finally {
            setIsLoading(false);
        }
    };

    const handleNameSubmit = async () => {
        if (!name.trim()) return;
        setIsLoading(true);
        try {
            const { data: customerId, error } = await supabase.rpc('create_or_update_customer', {
                p_business_id: businessId,
                p_phone: phone,
                p_name: name,
                p_id: null
            });

            if (error) throw error;

            onLoginSuccess({
                id: customerId,
                name: name,
                phone: phone,
                loyalty_coffee_count: 0
            });
        } catch (err) {
            console.error(err);
            setError('שגיאה ביצירת לקוח');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-stone-50/50">
            <div className="flex-1 flex flex-col items-center justify-start pt-4 px-6 text-center space-y-4 overflow-y-auto">

                {/* Header */}
                <div className="space-y-2 w-full max-w-xs transition-all duration-300">
                    {/* Mini Order Summary - Compact */}
                    <div className="bg-white rounded-xl px-4 py-2 border border-stone-200 shadow-sm flex items-center justify-between w-full">
                        <div className="text-right">
                            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">סיכום</span>
                            <span className="font-bold text-stone-800 text-sm">{cartItemsCount} פריטים</span>
                        </div>
                        <div className="text-left py-1 px-2 bg-stone-100 rounded-lg">
                            <span className="text-lg font-black text-stone-900">{cartTotal.toFixed(0)} ₪</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <h2 className="text-xl font-black text-stone-800">
                            {step === 'phone' && 'הזדהות מהירה'}
                            {step === 'otp' && 'קוד אימות'}
                            {step === 'name' && 'נעים להכיר!'}
                        </h2>
                        <p className="text-xs text-stone-500 font-medium">
                            {step === 'phone' && 'הזן את הנייד לקבלת קוד'}
                            {step === 'otp' && `נשלח קוד ל-${phone}`}
                            {step === 'name' && 'איך קוראים לך?'}
                        </p>
                    </div>
                </div>

                {/* Input Display */}
                <div className="w-full max-w-xs py-2">
                    {step === 'name' ? (
                        <input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="הכנס שם מלא"
                            className="w-full text-center text-xl font-bold py-3 bg-white border-2 border-stone-200 rounded-xl focus:border-stone-800 outline-none placeholder:font-normal transition-all"
                        />
                    ) : step === 'otp' ? (
                        // 6 Boxes Layout
                        <div className="flex items-center justify-center gap-2" dir="ltr">
                            {[0, 1, 2, 3, 4, 5].map((idx) => {
                                const digit = otp[idx] || '';
                                return (
                                    <div key={idx} className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 rounded-lg text-xl font-bold transition-all shadow-sm ${digit ? 'border-stone-800 text-stone-900' : 'border-stone-200'}`}>
                                        {digit}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // Phone Input
                        <div className={`w-full py-3 text-2xl font-mono font-bold bg-white border-2 rounded-xl flex items-center justify-center tracking-widest shadow-sm ${error ? 'border-red-300 text-red-500' : 'border-stone-200 text-stone-800'}`}>
                            {phone || '___-___-____'}
                        </div>
                    )}
                    {error && <p className="text-red-500 text-xs font-bold mt-2 animate-pulse">{error}</p>}
                </div>

                {/* Keypad */}
                {step !== 'name' && (
                    <div className="w-full max-w-xs mt-auto pb-2">
                        <NumericKeypad onKeyPress={handleKeypadPress} />
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-stone-100 flex gap-3 shrink-0">
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="px-4 py-3 rounded-xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
                >
                    ביטול
                </button>

                <button
                    onClick={() => {
                        if (step === 'phone') handleSendOTP();
                        else if (step === 'otp') handleVerifyOTP();
                        else handleNameSubmit();
                    }}
                    disabled={isLoading || (step === 'phone' && phone.length < 10) || (step === 'otp' && otp.length < 6) || (step === 'name' && !name)}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-stone-900 hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-stone-200"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> :
                        step === 'otp' ? 'אמת קוד' : 'המשך'
                    }
                    {!isLoading && <ArrowRight size={18} />}
                </button>
            </div>
        </div>
    );
}
