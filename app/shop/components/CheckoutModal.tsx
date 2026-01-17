'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Phone, ArrowRight, ArrowLeft, Check, Loader2, Truck, Store, CreditCard, Banknote, Smartphone, Trash2, Plus, Minus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: any[];
    cartTotal: number;
    onUpdateQuantity: (id: any, sig: string, delta: number) => void;
    onRemoveItem: (id: any, sig: string) => void;
}

type Step = 'cart' | 'auth' | 'otp' | 'details' | 'payment';

export default function CheckoutModal({ isOpen, onClose, cartItems, cartTotal, onUpdateQuantity, onRemoveItem }: CheckoutModalProps) {
    const [step, setStep] = useState<Step>('cart');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Details
    const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
    const [address, setAddress] = useState('');
    const [customerName, setCustomerName] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setStep('cart');
            setError('');
            setLoading(false);
        }
    }, [isOpen]);

    const handleSendOTP = async () => {
        if (phone.length < 10) {
            setError('מספר טלפון לא תקין');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);

            // Insert into sms_queue
            const { error: smsError } = await supabase
                .from('sms_queue')
                .insert({
                    phone: phone,
                    message: `קוד האימות שלך ל-iCaffe הוא: ${code} ☕ בתיאבון!`,
                    status: 'pending'
                });

            if (smsError) throw smsError;

            setStep('otp');
        } catch (e) {
            console.error('OTP Send Error:', e);
            setError('שגיאה בשליחת SMS. נסה שנית.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = () => {
        setLoading(true);
        // Simulate verification against generated code (or hacky client-side check for now)
        if (otp === generatedOtp || otp === '123456') { // 123456 as master bypass for testing
            setStep('details');
        } else {
            setError('קוד שגוי. נסה שנית.');
        }
        setLoading(false);
    };

    const renderCart = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-gray-900">הסל שלך</h3>
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{cartItems.length} פריטים</span>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                    <div key={item.id + item.signature} className="flex gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <span className="font-mono font-bold">₪{item.price * item.quantity}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {Object.values(item.selectedOptions || {}).map((opt: any, i) => (
                                    <span key={i} className="text-[10px] bg-white border border-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md">
                                        {opt.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-2 py-1">
                                    <button onClick={() => onUpdateQuantity(item.id, item.signature, -1)} className="text-gray-400 hover:text-orange-500 transition-colors">
                                        <Minus size={16} />
                                    </button>
                                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.signature, 1)} className="text-gray-400 hover:text-orange-500 transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button onClick={() => onRemoveItem(item.id, item.signature)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-bold">סה"כ לתשלום:</span>
                    <span className="text-3xl font-black text-gray-900">₪{cartTotal}</span>
                </div>
                <button
                    onClick={() => setStep('auth')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
                >
                    <span>המשך לפרטי משלח</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );

    const renderAuth = () => (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-12">
                    <Phone size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">בוא נכיר</h3>
                <p className="text-gray-400 font-medium">הכנס מספר טלפון לקבלת קוד אימות</p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="05X-XXXXXXX"
                        className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-2xl font-mono font-bold text-center tracking-[0.2em] focus:border-orange-500 focus:bg-white transition-all outline-none"
                    />
                    {phone.length === 10 && <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={24} />}
                </div>
                {error && <p className="text-red-500 text-sm font-bold text-center animate-pulse">{error}</p>}

                <button
                    onClick={handleSendOTP}
                    disabled={phone.length < 10 || loading}
                    className="w-full h-16 bg-gray-900 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><span>שלח קוד ב-SMS</span><ArrowRight size={20} /></>}
                </button>

                <button onClick={() => setStep('cart')} className="w-full text-gray-400 font-bold text-sm py-2">חזרה לסל</button>
            </div>
        </div>
    );

    const renderOTP = () => (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 -rotate-12">
                    <Check size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">אימות מספר</h3>
                <p className="text-gray-400 font-medium">הכנס את הקוד בן 6 הספרות ששלחנו ל-{phone}</p>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="------"
                    className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-3xl font-mono font-bold text-center tracking-[0.5em] focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
                {error && <p className="text-red-500 text-sm font-bold text-center animate-pulse">{error}</p>}

                <button
                    onClick={handleVerifyOTP}
                    disabled={otp.length < 6 || loading}
                    className="w-full h-16 bg-blue-600 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <span>אמת והמשך</span>}
                </button>

                <button onClick={() => setStep('auth')} className="w-full text-gray-400 font-bold text-sm py-2">שלח קוד חדש</button>
            </div>
        </div>
    );

    const renderDetails = () => (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-gray-900">איך תרצה לקבל?</h3>
                <p className="text-gray-400 font-medium">בחר צורת משלוח ופרטים</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setOrderType('pickup')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${orderType === 'pickup' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                >
                    <Store size={32} />
                    <span className="font-bold">איסוף עצמי</span>
                </button>
                <button
                    onClick={() => setOrderType('delivery')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${orderType === 'delivery' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                >
                    <Truck size={32} />
                    <span className="font-bold">משלוח עד הבית</span>
                </button>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="שם מלא"
                    className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 font-bold focus:border-orange-500 focus:bg-white outline-none"
                />

                {orderType === 'delivery' && (
                    <motion.input
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="כתובת מלאה (עיר, רחוב, מספר)"
                        className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 font-bold focus:border-orange-500 focus:bg-white outline-none"
                    />
                )}
            </div>

            <button
                onClick={() => setStep('payment')}
                disabled={!customerName || (orderType === 'delivery' && !address)}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <span>המשך לבחירת תשלום</span>
                <ArrowLeft size={20} />
            </button>
        </div>
    );

    const renderPayment = () => (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-gray-900">בחירת תשלום</h3>
                <p className="text-gray-400 font-medium">איך תרצה לשלם על הפינוק?</p>
            </div>

            <div className="space-y-3">
                {[
                    { id: 'credit', label: 'כרטיס אשראי', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { id: 'cash', label: 'מזומן (באיסוף/לשליח)', icon: Banknote, color: 'text-green-500', bg: 'bg-green-50' },
                    { id: 'bit', label: 'תשלום ב-Bit', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((p) => (
                    <button
                        key={p.id}
                        className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-orange-200 bg-white hover:bg-orange-50/20 transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${p.bg} ${p.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <p.icon size={24} />
                            </div>
                            <span className="text-lg font-bold text-gray-700">{p.label}</span>
                        </div>
                        <ArrowLeft size={20} className="text-gray-300 group-hover:text-orange-500 group-hover:-translate-x-1 transition-all" />
                    </button>
                )).reverse()} {/* Reverse for RTL flow if needed, but here it's just list */}
            </div>

            <p className="text-center text-xs text-gray-400 font-medium">
                * עם סיום הבחירה תועבר לדף סיכום ואישור סופי
            </p>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[151] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl font-heebo"
                        dir="rtl"
                    >
                        {/* Drag Handle */}
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2" />

                        <div className="p-8 pb-12 overflow-y-auto">
                            {step === 'cart' && renderCart()}
                            {step === 'auth' && renderAuth()}
                            {step === 'otp' && renderOTP()}
                            {step === 'details' && renderDetails()}
                            {step === 'payment' && renderPayment()}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
