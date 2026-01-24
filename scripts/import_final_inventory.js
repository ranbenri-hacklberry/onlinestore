const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '11111111-1111-1111-1111-111111111111';

// Data parsed from the DOCX files
const inventoryData = [
    // ברכת האדמה
    { name: 'חלב פרה', category: 'חומרי גלם', unit: 'יח׳', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 24 },
    { name: 'חלב סויה', category: 'חומרי גלם', unit: 'יח׳', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 6 },
    { name: 'חלב שיבולת שועל', category: 'חומרי גלם', unit: 'יח׳', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 6 },
    { name: 'אננס קפוא', category: 'פירות קפואים', unit: 'גרם', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 2000 },
    { name: 'מנגו קפוא', category: 'פירות קפואים', unit: 'גרם', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 2000 },
    { name: 'בננה קפואה', category: 'פירות קפואים', unit: 'גרם', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 2000 },
    { name: 'תות קפוא', category: 'פירות קפואים', unit: 'גרם', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 2000 },
    { name: 'מיץ תפוחים', category: 'מיצים', unit: 'יח׳', weight_per_unit: 2000, current_stock: 0, low_stock_alert: 4 },
    { name: 'מיץ תפוזים', category: 'מיצים', unit: 'יח׳', weight_per_unit: 2000, current_stock: 0, low_stock_alert: 4 },
    { name: 'לימונדה', category: 'מיצים', unit: 'יח׳', weight_per_unit: 2000, current_stock: 0, low_stock_alert: 4 },

    // כוכב השחר
    { name: 'לחם טוסט', category: 'לחמים', unit: 'חבילה', weight_per_unit: 10, current_stock: 0, low_stock_alert: 2 },
    { name: 'לחם לבן', category: 'לחמים', unit: 'חבילה', weight_per_unit: 10, current_stock: 0, low_stock_alert: 2 },
    { name: 'לחם חום', category: 'לחמים', unit: 'חבילה', weight_per_unit: 10, current_stock: 0, low_stock_alert: 2 },
    { name: 'גבינת קממבר', category: 'גבינות', unit: 'יח׳', weight_per_unit: 125, current_stock: 0, low_stock_alert: 5 },
    { name: 'גבינת עיזים', category: 'גבינות', unit: 'יח׳', weight_per_unit: 180, current_stock: 0, low_stock_alert: 5 },
    { name: 'סלמון מעושן', category: 'שונות', unit: 'יח׳', weight_per_unit: 100, current_stock: 0, low_stock_alert: 5 },
    { name: 'פולי קפה', category: 'קפה', unit: 'שקית', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 5 },

    // פיצה מרקט
    { name: 'גבינה בולגרית', category: 'פיצה', unit: 'גרם', weight_per_unit: 3600, current_stock: 0, low_stock_alert: 3600 },
    { name: 'גבינה צהובה מגורדת', category: 'פיצה', unit: 'גרם', weight_per_unit: 2000, current_stock: 0, low_stock_alert: 4000 },
    { name: 'רוטב עגבניות', category: 'פיצה', unit: 'גרם', weight_per_unit: 2000, current_stock: 0, low_stock_alert: 4000 },
    { name: 'רוטב אלפרדו', category: 'פיצה', unit: 'גרם', weight_per_unit: 4000, current_stock: 0, low_stock_alert: 4000 },
    { name: 'רוטב פסטו', category: 'פיצה', unit: 'גרם', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 1000 },
    { name: 'כוס קפה קר', category: 'אריזות', unit: 'יח׳', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 1 },
    { name: 'כוסות חד"פ', category: 'אריזות', unit: 'יח׳', weight_per_unit: 3000, current_stock: 0, low_stock_alert: 1 },
    { name: 'מכסה לקפה קר', category: 'אריזות', unit: 'יח׳', weight_per_unit: 1000, current_stock: 0, low_stock_alert: 1 },
    { name: 'פסטה', category: 'שונות', unit: 'גרם', weight_per_unit: 5000, current_stock: 0, low_stock_alert: 5000 },
    { name: 'שמן זית', category: 'שונות', unit: 'מ"ל', weight_per_unit: 3800, current_stock: 0, low_stock_alert: 3800 }
];

async function importInventory() {
    console.log(`🚀 Starting inventory import for Business ID: ${BUSINESS_ID}`);

    for (const item of inventoryData) {
        const { data, error } = await supabase
            .from('inventory_items')
            .upsert({
                ...item,
                business_id: BUSINESS_ID,
                last_updated: new Date().toISOString()
            }, { onConflict: 'name,business_id' });

        if (error) {
            console.error(`❌ Error importing ${item.name}:`, error.message);
        } else {
            console.log(`✅ Imported: ${item.name}`);
        }
    }

    console.log('🎉 Porting complete!');
}

importInventory();
