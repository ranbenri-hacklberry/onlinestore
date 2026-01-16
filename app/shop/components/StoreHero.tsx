'use client';

import { motion } from 'framer-motion';

export default function StoreHero() {
    return (
        <div className="relative h-64 md:h-[400px] w-full overflow-hidden bg-gray-900 mx-auto w-full md:rounded-b-[2.5rem] shadow-2xl mb-8">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transform scale-105"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2670&auto=format&fit=crop')",
                    filter: 'brightness(0.8)'
                }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto text-white pb-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="inline-block px-3 py-1 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 rounded-full text-amber-300 text-sm font-medium mb-3">
                        ✨ פתוחים להזמנות
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight tracking-tight">
                        חווית הקפה <span className="text-amber-400">החדשה שלכם</span> ☕
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 max-w-xl font-light">
                        הכירו את iCaffeOS - המערכת המושלמת להזמנה מהירה, תשלום מאובטח וצבירת נקודות בכל ביקור.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
