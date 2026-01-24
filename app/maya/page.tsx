'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Mic, MicOff, Coffee, TrendingUp, Users, RefreshCw,
    Loader2, Brain, Sparkles, ChevronLeft, Bot, User,
    Calendar, CloudRain, Clock, Trophy, Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import { chatWithMaya } from '@/services/geminiService';

const BUSINESS_ID = '11111111-1111-1111-1111-111111111111';
const BUSINESS_NAME = 'עגלת קפה';

const MayaPage = () => {
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isContextLoading, setIsContextLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [inventoryCount, setInventoryCount] = useState(0);
    const [recipeCount, setRecipeCount] = useState(0);
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);

    const businessContext = `
=== ניתוח ביצועים שבועי (11/01 - 16/01) ===
סה"כ פדיון: ₪23,706
סה"כ הזמנות: 368
זמן הכנה ממוצע: 16.2 דקות

פדיון יומי:
- ראשון: ₪4,965 (חזק)
- שני: ₪2,918
- שלישי: ₪973 (גשם כבד במעלה אפרים - שפל שבועי)
- רביעי: ₪1,846
- חמישי: ₪4,043
- שישי: ₪8,959 (שיא שבועי - 38% מהפדיון!)

צוואר בקבוק:
בשעה 10:00 בבוקר זמן ההכנה קופץ ל-20.3 דקות.

הכי נמכרים:
1. הפוך גדול (100 יח')
2. הפוך קטן (89 יח')
3. קפה קר (56 יח')
4. טוסט פסטו (35 יח')
5. סלט יווני (30 יח')

תחזית לשבוע הקרוב (19/01-23/01):
יום שני (מחר): 14 מעלות, 45% סיכוי לגשם.
יום שישי: 18 מעלות, נעים - פוטנציאל לשיא מכירות חדש.
`;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: invCount } = await supabase
                    .from('inventory_items')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', BUSINESS_ID);

                const { count: recCount } = await supabase
                    .from('recipes')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', BUSINESS_ID);

                const { data: lowItems } = await supabase
                    .from('inventory_items')
                    .select('name, current_stock, low_stock_alert')
                    .eq('business_id', BUSINESS_ID)
                    .filter('current_stock', 'lte', 'low_stock_alert')
                    .filter('low_stock_alert', 'gt', 0);

                setInventoryCount(invCount || 0);
                setRecipeCount(recCount || 0);
                setLowStockItems(lowItems || []);
            } catch (err) {
                console.error('Fetch Stats Error:', err);
            } finally {
                setIsContextLoading(false);
            }
        };

        fetchStats();

        const welcomeMessage = {
            role: 'assistant',
            content: `שלום! אני מאיה, העוזרת החכמה שלך. 🌸
סיימתי לנתח את נתוני המכירות, המלאי והמתכונים של **עגלת קפה**. 

ראיתי שהזנו רשימת מלאי מלאה (83 פריטים) והגדרנו מתכונים לכל המנות המובילות.
איך אוכל לעזור לך לייעל את העסק היום?`
        };
        setMessages([welcomeMessage]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMsg = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        const dynamicContext = `
${businessContext}
=== נתונים חיים מהמערכת (Real-time) ===
- מספר פריטי מלאי מנוהלים: ${inventoryCount}
- מספר מתכונים פעילים: ${recipeCount}
- פריטים בחוסר/קריטיים: ${lowStockItems.length > 0 ? lowStockItems.map(i => i.name).join(', ') : 'אין כרגע'}
`;

        try {
            const payload = [
                {
                    role: 'user',
                    parts: [{
                        text: `
את מאיה (Maya AI), היועצת העסקית והמנהלת הדיגיטלית של "עגלת קפה".
האישיות שלך: חכמה, חדה, קצת קולית, עם הבנה עמוקה בנתונים.
את משתמשת במודל Deep Thinking כדי לתת תובנות "מחוץ לקופסה".

הנה הנתונים העדכניים של העסק:
${dynamicContext}

שאלת המשתמש: ${inputText}

הנחיות למענה:
1. עני בעברית.
2. תהיי סופר חכמה - נתחי את המשמעות של המספרים.
3. אם שואלים על שיפור, תני הצעות אופרטיביות.
4. אל תהיי רובוטית. תהיי מאיה.
` }]
                }
            ];

            const response = await chatWithMaya(payload);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Maya Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'סליחה, נתקלתי בבעיה בחיבור למוח שלי. נסה שוב בעוד רגע.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] font-heebo" dir="rtl">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-stone-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-stone-800">מאיה AI <span className="text-[10px] font-mono opacity-50">v2.1 THINK</span></h1>
                    </div>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} mb-6`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-stone-200' : 'bg-gradient-to-tr from-purple-500 to-pink-500'
                                    }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-white" />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-white border border-stone-100 text-stone-800' : 'bg-stone-900 text-stone-50'
                                    }`}>
                                    <div className="prose prose-sm prose-invert max-w-none">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-6">
                        <div className="bg-stone-100 p-4 rounded-2xl flex items-center gap-3">
                            <Brain className="animate-pulse text-purple-500" size={20} />
                            <span className="text-sm font-bold text-stone-500 italic">מאיה חושבת לעומק...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-stone-200 p-4 md:p-6">
                <div className="max-w-4xl mx-auto relative group">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="שאלי אותי משהו על העסק..."
                        className="w-full h-14 bg-stone-100 border-2 border-stone-200 rounded-2xl px-6 pr-14 text-lg focus:border-purple-500 focus:bg-white transition-all outline-none"
                    />
                    <button onClick={handleSendMessage} disabled={!inputText.trim() || isLoading} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors disabled:opacity-20">
                        <Send size={20} />
                    </button>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button className="p-2 text-stone-400 hover:text-stone-600 transition-colors"><Mic size={20} /></button>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto flex justify-center gap-4 mt-3 overflow-x-auto pb-2 no-scrollbar">
                    <button onClick={() => setInputText('מה היתה השעה הכי עמוסה שבוע שעבר?')} className="whitespace-nowrap bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full text-xs font-bold text-stone-500 transition-all">📊 שעת שיא</button>
                    <button onClick={() => setInputText('איך מזג האוויר מחר משפיע על המלאי?')} className="whitespace-nowrap bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full text-xs font-bold text-stone-500 transition-all">🌤️ מזג אוויר ומלאי</button>
                    <button onClick={() => setInputText('מה כדאי להזמין מהספקים לקראת יום שישי?')} className="whitespace-nowrap bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full text-xs font-bold text-stone-500 transition-all">📦 המלצות ספקים</button>
                </div>
            </div>
        </div>
    );
};

export default MayaPage;
