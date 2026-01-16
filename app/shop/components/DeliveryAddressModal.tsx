'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Truck, MapPin, Phone, User, Check, Home, Dog, Users, Building2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DELIVERY_NOTES_OPTIONS = [
    { id: 'door', label: 'להניח ליד הדלת', icon: Home },
    { id: 'dog', label: 'כלב נובח לא נושך', icon: Dog },
    { id: 'neighbor', label: 'להשאיר אצל השכן', icon: Users },
    { id: 'elevator', label: 'יש מעלית', icon: Building2 }
];

interface DeliveryAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
    initialData?: any;
    deliveryFee?: number;
}

const DeliveryAddressModal = ({
    isOpen,
    onClose,
    onConfirm,
    initialData = {},
    deliveryFee = 20
}: DeliveryAddressModalProps) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
    const [step, setStep] = useState('address');
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [foundCustomer, setFoundCustomer] = useState<any>(null);
    const [actualDeliveryFee, setActualDeliveryFee] = useState(deliveryFee);

    const inputRef = useRef<HTMLInputElement>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);

    const lookupCustomer = useCallback(async (phone: string) => {
        if (!phone || phone.length < 9) return;
        setIsLookingUp(true);
        try {
            const { data, error } = await supabase.rpc('lookup_delivery_customer', {
                p_phone: phone,
                p_business_id: initialData.businessId
            });
            if (error) throw error;
            const customer = (data && data.length > 0) ? data[0] : null;
            if (customer) {
                setFoundCustomer(customer);
                setCustomerName(customer.name || '');
                setDeliveryAddress(customer.delivery_address || '');
            } else {
                setFoundCustomer(null);
                setCustomerName('');
                setDeliveryAddress('');
            }
        } catch (err) {
            console.error('Lookup failed:', err);
        } finally {
            setIsLookingUp(false);
        }
    }, [initialData.businessId]);

    useEffect(() => {
        if (isOpen) {
            setCustomerName(initialData.name || '');
            setCustomerPhone(initialData.phone || '');
            setDeliveryAddress(initialData.address || '');
            setSelectedNotes([]);
            setStep(initialData.phone ? (initialData.name ? 'address' : 'name') : 'phone');
            if (initialData.phone && initialData.phone.length >= 9) lookupCustomer(initialData.phone);
        }
    }, [isOpen, initialData, lookupCustomer]);

    const handleNext = () => {
        if (step === 'phone' && customerPhone.length >= 9) {
            lookupCustomer(customerPhone);
            setStep('name');
        } else if (step === 'name' && customerName) {
            setStep('address');
        } else if (step === 'address' && deliveryAddress) {
            const notesText = selectedNotes
                .map(id => DELIVERY_NOTES_OPTIONS.find(n => n.id === id)?.label)
                .join(', ');
            onConfirm({
                customerName,
                customerPhone,
                deliveryAddress,
                deliveryNotes: notesText,
                deliveryFee: actualDeliveryFee
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" onClick={onClose}>
            <div className="bg-white w-[380px] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-purple-600 px-4 py-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <Truck size={20} />
                        <span className="font-bold">פרטי משלוח</span>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {step === 'phone' && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2"><Phone size={14} />טלפון</label>
                            <input ref={inputRef} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-3 border-2 rounded-xl" placeholder="טלפון" autoFocus />
                        </div>
                    )}
                    {step === 'name' && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2"><User size={14} />שם</label>
                            <input ref={inputRef} value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-3 border-2 rounded-xl" placeholder="שם" autoFocus />
                        </div>
                    )}
                    {step === 'address' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><MapPin size={14} />כתובת</label>
                                <input ref={addressInputRef} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full p-3 border-2 rounded-xl" placeholder="כתובת" autoFocus />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {DELIVERY_NOTES_OPTIONS.map(note => (
                                    <button key={note.id} onClick={() => setSelectedNotes(prev => prev.includes(note.id) ? prev.filter(id => id !== note.id) : [...prev, note.id])} className={`p-2.5 rounded-xl border text-sm flex items-center gap-2 ${selectedNotes.includes(note.id) ? 'bg-purple-600 text-white' : 'bg-white'}`}>
                                        <note.icon size={16} />{note.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 flex gap-2">
                    <button onClick={handleNext} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold">המשך</button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryAddressModal;
