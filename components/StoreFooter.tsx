'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface StoreFooterProps {
    currentStore: 'shop' | 'nursery' | 'bakery';
    accentColor?: string;
}

const stores = [
    { id: 'shop', name: 'iCaffeOS', description: 'בית קפה', href: '/shop', icon: '☕', color: 'from-orange-500 to-amber-500' },
    { id: 'nursery', name: 'שפת המדבר', description: 'משתלה ועגלת קפה', href: '/nursery', icon: '🌿', color: 'from-emerald-500 to-teal-500' },
    { id: 'bakery', name: 'לשה', description: 'מאפייה', href: '/bakery', icon: '🥐', color: 'from-amber-500 to-orange-500' },
];

export default function StoreFooter({ currentStore, accentColor = 'amber' }: StoreFooterProps) {
    const gradientClass = {
        'orange': 'from-orange-900 to-orange-800',
        'amber': 'from-amber-900 to-amber-800',
        'emerald': 'from-emerald-900 to-emerald-800',
    }[accentColor] || 'from-gray-900 to-gray-800';

    return (
        <footer className={`bg-gradient-to-br ${gradientClass} text-white mt-16`}>
            {/* Other Stores Section */}
            <div className="border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <h3 className="text-center text-xl font-bold mb-8 text-white/90">
                        בקרו גם בחנויות שלנו 🛍️
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stores.filter(s => s.id !== currentStore).map((store, i) => (
                            <Link key={store.id} href={store.href}>
                                <motion.div
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                                    viewport={{ once: true }}
                                >
                                    <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${store.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                                        {store.icon}
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-1">{store.name}</h4>
                                    <p className="text-sm text-white/60">{store.description}</p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Links */}
                    <div className="flex gap-6 text-sm text-white/60">
                        <a href="#" className="hover:text-white transition-colors">תנאי שימוש</a>
                        <a href="#" className="hover:text-white transition-colors">מדיניות פרטיות</a>
                        <a href="#" className="hover:text-white transition-colors">צור קשר</a>
                    </div>

                    {/* Credit */}
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-white/80 text-sm flex items-center gap-2">
                            <span>נבנה באהבה</span>
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                ❤️
                            </motion.span>
                            <span>על ידי</span>
                            <span className="font-bold text-white">רן</span>
                            <span>&</span>
                            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Claude Opus 4.5
                            </span>
                        </p>
                    </motion.div>

                    {/* Year */}
                    <p className="text-white/40 text-sm">
                        © {new Date().getFullYear()} כל הזכויות שמורות
                    </p>
                </div>
            </div>
        </footer>
    );
}
