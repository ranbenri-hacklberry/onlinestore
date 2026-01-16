'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
    X, Check, Coffee, Milk, Leaf, Wheat, Nut,
    Cloud, Thermometer, Flame, Droplets,
    Zap, Ban, Puzzle, ArrowUpFromLine, ArrowDownToLine, Blend, Gauge, Apple, Disc
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { db } from '../../../db/database';

interface ModifierValue {
    id: string | number;
    name: string;
    priceAdjustment: number;
    is_default?: boolean;
}

interface ModifierGroup {
    id: string | number;
    name: string;
    title?: string;
    values: ModifierValue[];
    min_selection?: number;
    max_selection?: number;
    is_required?: boolean;
    is_multiple_select?: boolean;
    type?: string;
}

interface ModifierModalProps {
    isOpen: boolean;
    selectedItem: any;
    onClose: () => void;
    onAddItem: (item: any) => void;
    extraGroups?: any[];
    allowAutoAdd?: boolean;
}

const ModifierModal = ({ isOpen, selectedItem, onClose, onAddItem, extraGroups = [], allowAutoAdd = true }: ModifierModalProps) => {
    const [optionSelections, setOptionSelections] = useState<Record<string, any>>({});
    const [orderNote, setOrderNote] = useState('');

    const targetItemId = useMemo(() => {
        if (!selectedItem) return null;
        return selectedItem.id ? Number(selectedItem.id) : null;
    }, [selectedItem]);

    const [remoteGroups, setRemoteGroups] = useState<ModifierGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !targetItemId) return;

        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                const { data: privGroups } = await supabase.from('optiongroups').select('*').eq('menu_item_id', targetItemId);
                const { data: links } = await supabase.from('menuitemoptions').select('group_id').eq('item_id', targetItemId);

                let allGroupIds = (privGroups || []).map(g => g.id);
                if (links && links.length > 0) {
                    allGroupIds = [...allGroupIds, ...links.map(l => l.group_id)];
                }

                if (allGroupIds.length === 0) {
                    setRemoteGroups([]);
                    return;
                }

                const { data: groups } = await supabase.from('optiongroups').select('*').in('id', allGroupIds);
                const { data: values } = await supabase.from('optionvalues').select('*').in('group_id', allGroupIds);

                const merged = (groups || []).map(g => ({
                    ...g,
                    values: (values || [])
                        .filter(v => v.group_id === g.id)
                        .map((v: any) => ({
                            id: v.id,
                            name: v.name || v.value_name,
                            priceAdjustment: Number(v.price_adjustment || 0),
                            is_default: v.is_default
                        }))
                }));
                setRemoteGroups(merged);
            } catch (err) {
                console.error('Failed to fetch modifiers:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [isOpen, targetItemId]);

    const optionGroups = useMemo(() => {
        return [...extraGroups, ...remoteGroups];
    }, [extraGroups, remoteGroups]);

    const handleAdd = () => {
        const selectedOptions = optionGroups.flatMap(group => {
            const valId = optionSelections[group.id];
            if (!valId) return [];
            if (Array.isArray(valId)) {
                return valId.map((id: string) => group.values.find((v: ModifierValue) => String(v.id) === String(id))).filter(Boolean);
            }
            return [group.values.find((v: ModifierValue) => String(v.id) === String(valId))].filter(Boolean);
        });

        onAddItem({
            ...selectedItem,
            selectedOptions: selectedOptions,
            notes: orderNote
        });
    };

    if (!isOpen) return null;

    // Helper to check selection
    const isSelected = (groupId: string | number, valueId: string | number, isMulti = false) => {
        const current = optionSelections[groupId];
        if (isMulti && Array.isArray(current)) return current.includes(String(valueId));
        return current === String(valueId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm transition-all" dir="rtl" onClick={onClose}>
            <div
                className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col md:max-h-[85vh] h-[90vh] md:h-auto animate-in slide-in-from-bottom-10"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b shrink-0 flex justify-between items-center bg-white rounded-t-2xl z-10 sticky top-0">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 leading-none">{selectedItem?.name}</h2>
                        <span className="text-sm text-slate-500 font-medium">+ תוספות ושינויים</span>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 overscroll-contain">
                    {/* Notes Input as first item for easy access */}
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder="הערות מיוחדות למנה..."
                            className="w-full text-sm resize-none outline-none text-slate-700 placeholder:text-slate-400"
                            rows={2}
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
                    ) : (
                        optionGroups.map(group => (
                            <div key={group.id} className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="font-bold text-slate-700 text-sm">{group.name}</h3>
                                    {group.is_required && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">חובה</span>}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {group.values.map((val: ModifierValue) => {
                                        const active = isSelected(group.id, val.id, group.is_multiple_select);
                                        return (
                                            <button
                                                key={val.id}
                                                onClick={() => {
                                                    setOptionSelections(prev => {
                                                        const gId = group.id;
                                                        if (group.is_multiple_select) {
                                                            const current = prev[gId] || [];
                                                            return {
                                                                ...prev,
                                                                [gId]: current.includes(String(val.id))
                                                                    ? current.filter((id: string) => id !== String(val.id))
                                                                    : [...current, String(val.id)]
                                                            };
                                                        }
                                                        // Toggle logic for single select if desired, or just select
                                                        return { ...prev, [gId]: String(val.id) };
                                                    });
                                                }}
                                                className={`
                                                    relative p-2.5 rounded-lg border text-sm font-bold transition-all flex items-center justify-between gap-2
                                                    ${active
                                                        ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm ring-1 ring-orange-500/20'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }
                                                `}
                                            >
                                                <span className="truncate">{val.name}</span>
                                                {val.priceAdjustment > 0 && (
                                                    <span className="text-[10px] bg-white/50 px-1.5 rounded-md border border-black/5">
                                                        +{val.priceAdjustment}
                                                    </span>
                                                )}
                                                {active && <Check size={14} className="bg-orange-500 text-white rounded-full p-0.5" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer - Always Visible */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0 sticky bottom-0 z-10 pb-8 md:pb-4 safe-area-pb">
                    <button
                        onClick={handleAdd}
                        className="w-full h-12 bg-stone-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span>הוסף להזמנה</span>
                        <div className="w-px h-4 bg-white/20 mx-1"></div>
                        <span>{(selectedItem?.price || 0) + (
                            optionGroups.flatMap(g => {
                                const selected = optionSelections[g.id];
                                if (!selected) return [];
                                const ids = Array.isArray(selected) ? selected : [selected];
                                return ids.map((id: string) => g.values.find((v: any) => String(v.id) === String(id))?.priceAdjustment || 0);
                            }).reduce((a: number, b: number) => a + b, 0)
                        )} ₪</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModifierModal;
