'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

interface AddressSuggest {
    street: string;
    city: string;
}

interface AddressInputProps {
    onAddressChange: (details: any) => void;
}

const AddressSearch = ({ onAddressChange }: AddressInputProps) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggest[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Detailed fields
    const [city, setCity] = useState('');
    const [street, setStreet] = useState('');
    const [houseNum, setHouseNum] = useState('');
    const [apartment, setApartment] = useState('');
    const [entrance, setEntrance] = useState('');
    const [floor, setFloor] = useState('');

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`https://data.gov.il/api/3/action/datastore_search?resource_id=bf185c7f-1a4e-4662-88c5-fa118a244bda&q=${encodeURIComponent(query)}&limit=10`);
                const data = await res.json();

                if (data.success) {
                    const records = data.result.records;
                    const formatted = records.map((r: any) => ({
                        street: r.street_name?.trim(),
                        city: r.city_name?.trim()
                    })).filter((v: any, i: number, a: any[]) =>
                        a.findIndex(t => (t.street === v.street && t.city === v.city)) === i
                    );
                    setSuggestions(formatted);
                }
            } catch (e) {
                console.error('Error fetching addresses:', e);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (s: AddressSuggest) => {
        setStreet(s.street);
        setCity(s.city);
        setQuery(`${s.street}, ${s.city}`);
        setShowSuggestions(false);
        updateParent(s.street, s.city, houseNum, apartment, entrance, floor);
    };

    const updateParent = (s: string, c: string, h: string, a: string, e: string, f: string) => {
        onAddressChange({
            street: s,
            city: c,
            houseNum: h,
            apartment: a,
            entrance: e,
            floor: f,
            formatted: `${s} ${h}, ${c}${a ? ` (דירה ${a})` : ''}${e ? ` (כניסה ${e})` : ''}${f ? ` (קומה ${f})` : ''}`
        });
    };

    const handleFieldChange = (field: string, val: string) => {
        let ns = street, nc = city, nh = houseNum, na = apartment, ne = entrance, nf = floor;
        if (field === 'houseNum') nh = val;
        if (field === 'apartment') na = val;
        if (field === 'entrance') ne = val;
        if (field === 'floor') nf = val;

        setHouseNum(nh);
        setApartment(na);
        setEntrance(ne);
        setFloor(nf);

        updateParent(ns, nc, nh, na, ne, nf);
    };

    return (
        <div className="space-y-4 font-heebo" dir="rtl" ref={wrapperRef}>
            {/* Main Search and House Number */}
            <div className="flex gap-2">
                {/* Street & City Search */}
                <div className="relative flex-[3]">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="חפש רחוב ועיר..."
                            className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-12 font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        {loading && <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 animate-spin" size={20} />}
                        {!loading && query && (
                            <button
                                onClick={() => { setQuery(''); setStreet(''); setCity(''); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Suggestions list */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelect(s)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-right transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{s.street}</div>
                                            <div className="text-xs text-gray-400 font-medium">{s.city}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* House Number */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={houseNum}
                        onChange={(e) => handleFieldChange('houseNum', e.target.value)}
                        placeholder="מס'"
                        className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
                    />
                </div>
            </div>

            {/* Optional Fields (Apartment, Entrance, Floor) */}
            <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                    <label className="text-[10px] pr-2 text-gray-400 font-bold uppercase">דירה</label>
                    <input
                        type="text"
                        value={apartment}
                        onChange={(e) => handleFieldChange('apartment', e.target.value)}
                        placeholder="דירה"
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl text-center font-bold focus:border-orange-200 focus:bg-white outline-none transition-all text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] pr-2 text-gray-400 font-bold uppercase">כניסה</label>
                    <input
                        type="text"
                        value={entrance}
                        onChange={(e) => handleFieldChange('entrance', e.target.value)}
                        placeholder="כניסה"
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl text-center font-bold focus:border-orange-200 focus:bg-white outline-none transition-all text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] pr-2 text-gray-400 font-bold uppercase">קומה</label>
                    <input
                        type="text"
                        value={floor}
                        onChange={(e) => handleFieldChange('floor', e.target.value)}
                        placeholder="קומה"
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl text-center font-bold focus:border-orange-200 focus:bg-white outline-none transition-all text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

import { AnimatePresence } from 'framer-motion';
export default AddressSearch;
