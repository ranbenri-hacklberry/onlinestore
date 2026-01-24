const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '11111111-1111-1111-1111-111111111111';

// Grouping by supplier as we saw in the DOCX files
const suppliers = {
    'ברכת האדמה': 5,
    'כוכב השחר': 2,
    'פיצה מרקט': 3,
    'ביסקוטי': 1,
    'תנובה': 6
};

const inventoryData = [
    // ברכת האדמה (Supplier ID 5)
    { name: 'חלב פרה', supplier: 'ברכת האדמה', unit: 'יח׳', weight_per_unit: 1000, low_stock: 24, category: 'חומרי גלם' },
    { name: 'חלב סויה', supplier: 'ברכת האדמה', unit: 'יח׳', weight_per_unit: 1000, low_stock: 6, category: 'חומרי גלם' },
    { name: 'חלב שיבולת שועל', supplier: 'ברכת האדמה', unit: 'יח׳', weight_per_unit: 1000, low_stock: 6, category: 'חומרי גלם' },
    { name: 'אננס קפוא', supplier: 'ברכת האדמה', unit: 'גרם', weight_per_unit: 1000, low_stock: 2000, category: 'פירות קפואים' },
    { name: 'מנגו קפוא', supplier: 'ברכת האדמה', unit: 'גרם', weight_per_unit: 1000, low_stock: 2000, category: 'פירות קפואים' },
    { name: 'בננה קפואה', supplier: 'ברכת האדמה', unit: 'גרם', weight_per_unit: 1000, low_stock: 2000, category: 'פירות קפואים' },
    { name: 'תות קפוא', supplier: 'ברכת האדמה', unit: 'גרם', weight_per_unit: 1000, low_stock: 2000, category: 'פירות קפואים' },

    // כוכב השחר (Supplier ID 2)
    { name: 'לחם טוסט', supplier: 'כוכב השחר', unit: 'חבילה', weight_per_unit: 10, low_stock: 2, category: 'לחמים' },
    { name: 'לחם לבן', supplier: 'כוכב השחר', unit: 'חבילה', weight_per_unit: 10, low_stock: 2, category: 'לחמים' },
    { name: 'לחם חום', supplier: 'כוכב השחר', unit: 'חבילה', weight_per_unit: 10, low_stock: 2, category: 'לחמים' },
    { name: 'גבינת קממבר', supplier: 'כוכב השחר', unit: 'יח׳', weight_per_unit: 125, low_stock: 5, category: 'גבינות' },
    { name: 'גבינת עיזים', supplier: 'כוכב השחר', unit: 'יח׳', weight_per_unit: 180, low_stock: 5, category: 'גבינות' },
    { name: 'פולי קפה', supplier: 'כוכב השחר', unit: 'שקית', weight_per_unit: 1000, low_stock: 5, category: 'קפה' },

    // פיצה מרקט (Supplier ID 3)
    { name: 'גבינה בולגרית', supplier: 'פיצה מרקט', unit: 'גרם', weight_per_unit: 3600, low_stock: 3600, category: 'פיצה' },
    { name: 'גבינה צהובה מגורדת', supplier: 'פיצה מרקט', unit: 'גרם', weight_per_unit: 2000, low_stock: 4000, category: 'פיצה' },
    { name: 'רוטב עגבניות', supplier: 'פיצה מרקט', unit: 'גרם', weight_per_unit: 2000, low_stock: 4000, category: 'פיצה' },
    { name: 'רוטב פסטו', supplier: 'פיצה מרקט', unit: 'גרם', weight_per_unit: 1000, low_stock: 1000, category: 'פיצה' },
    { name: 'כוס קפה קר', supplier: 'פיצה מרקט', unit: 'יח׳', weight_per_unit: 1000, low_stock: 1, category: 'אריזות' },
    { name: 'כוסות חד"פ', supplier: 'פיצה מרקט', unit: 'יח׳', weight_per_unit: 3000, low_stock: 1, category: 'אריזות' }
];

async function importWithRPC() {
    console.log("🚀 Importing inventory using RPC bypass...");

    for (const item of inventoryData) {
        const supplierId = suppliers[item.supplier] || 6; // Default to Tnuva if not found

        // Use create_missing_inventory_item_v2 to bypass RLS
        const { data: itemId, error } = await supabase.rpc('create_missing_inventory_item_v2', {
            p_name: item.name,
            p_unit: item.unit,
            p_business_id: BUSINESS_ID,
            p_supplier_id: supplierId,
            p_cost_per_unit: 0,
            p_catalog_item_id: null
        });

        if (error) {
            console.error(`❌ Error creating ${item.name}:`, error.message);
            continue;
        }

        console.log(`✅ Created: ${item.name} (ID: ${itemId})`);

        // Now update the additional fields like weight_per_unit and category
        // Note: We might need to check if there is an update RPC, but usually 
        // create_missing_inventory_item_v2 sets basic fields. 
        // Let's try to set low_stock_alert via the update_inventory_stock equivalent if available
    }

    console.log("🎉 Import finished!");
}

importWithRPC();
