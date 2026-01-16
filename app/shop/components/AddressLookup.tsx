'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';

interface AddressLookupProps {
    onAddressSelect: (address: string) => void;
    initialAddress?: string;
}

interface Suggestion {
    display_name: string;
    lat: string;
    lon: string;
    address: {
        road?: string;
        house_number?: string;
        city?: string;
        town?: string;
        village?: string;
    };
}

export default function AddressLookup({ onAddressSelect, initialAddress = '' }: AddressLookupProps) {
    const [query, setQuery] = useState(initialAddress);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 2 && isOpen) {
                fetchSuggestions(query);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const fetchSuggestions = async (q: string) => {
        setIsSearching(true);
        try {
            // Nominatim Free API
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=il&addressdetails=1&limit=5&accept-language=he`, {
                headers: {
                    'User-Agent': 'iCaffeOS_Demo/1.0',
                    'Accept-Language': 'he'
                }
            });
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error('Address fetch error', err);
        } finally {
            setIsSearching(false);
        }
    };

    const formatAddress = (s: Suggestion) => {
        if (!s.address) return s.display_name.split(',')[0];
        const road = s.address.road || '';
        const num = s.address.house_number || '';
        const city = s.address.city || s.address.town || s.address.village || '';

        let parts = [];
        if (road) parts.push(road + (num ? ' ' + num : ''));
        if (city) parts.push(city);

        return parts.length > 0 ? parts.join(', ') : s.display_name;
    };

    const handleSelect = (s: Suggestion) => {
        const clean = formatAddress(s);
        setQuery(clean);
        onAddressSelect(clean);
        setSuggestions([]);
        setIsOpen(false);
    };

    const handleGeolocation = () => {
        if (!navigator.geolocation) return;
        setIsSearching(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=he`, {
                    headers: {
                        'User-Agent': 'iCaffeOS_Demo/1.0',
                        'Accept-Language': 'he'
                    }
                });
                const data = await res.json();
                handleSelect(data as Suggestion);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        });
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="הכנס כתובת (רחוב ומספר)"
                    className="w-full h-14 pl-12 pr-4 bg-white border border-stone-200 rounded-xl focus:border-stone-400 outline-none text-stone-800 font-medium shadow-sm transition-all"
                    style={{ textAlign: 'right' }}
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />

                {query.length === 0 && (
                    <button
                        onClick={handleGeolocation}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-orange-100 transition-colors"
                    >
                        <Navigation size={14} />
                        מיקום נוכחי
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && query.length > 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-[100] max-h-60 overflow-y-auto">
                    {isSearching ? (
                        <div className="p-4 text-center text-stone-400 text-sm">מחפש כתובות...</div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(s)}
                                className="w-full text-right p-3 hover:bg-stone-50 border-b border-stone-50 last:border-0 flex items-start gap-3 transition-colors"
                            >
                                <MapPin size={16} className="mt-1 text-stone-400 shrink-0" />
                                <span className="text-sm font-medium text-stone-700 truncate">{formatAddress(s)}</span>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-stone-400 text-sm">לא נמצאו תוצאות</div>
                    )}
                </div>
            )}
        </div>
    );
}
