const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUSINESS_ID = '11111111-1111-1111-1111-111111111111';

async function setupRecipes() {
    console.log("🥣 Setting up recipes for 'עגלת קפה'...");

    const recipes = [
        {
            menu_item_id: 13, // הפוך גדול
            name: 'הפוך גדול',
            ingredients: [
                { id: 350, qty: 220, unit: 'מ"ל' }, // חלב פרה
                { id: 363, qty: 18, unit: 'גרם' },   // פולי קפה
                { id: 369, qty: 1, unit: 'יח׳' }     // כוסות חד"פ
            ]
        },
        {
            menu_item_id: 12, // הפוך קטן
            name: 'הפוך קטן',
            ingredients: [
                { id: 350, qty: 160, unit: 'מ"ל' },
                { id: 363, qty: 9, unit: 'גרם' },
                { id: 369, qty: 1, unit: 'יח׳' }
            ]
        },
        {
            menu_item_id: 8, // טוסט פסטו
            name: 'טוסט פסטו',
            ingredients: [
                { id: 358, qty: 1, unit: 'יח׳' },   // לחם טוסט
                { id: 424, qty: 45, unit: 'גרם' },  // גבנצ
                { id: 367, qty: 15, unit: 'גרם' },  // רוטב פסטו
                { id: 430, qty: 1, unit: 'יח׳' }    // שקיות חומות
            ]
        },
        {
            menu_item_id: 1, // סלט יווני
            name: 'סלט יווני',
            ingredients: [
                { id: 373, qty: 150, unit: 'גרם' }, // חסה
                { id: 384, qty: 100, unit: 'גרם' }, // עגבניה
                { id: 382, qty: 100, unit: 'גרם' }, // מלפפון
                { id: 423, qty: 40, unit: 'גרם' },  // בולגרית
                { id: 421, qty: 20, unit: 'גרם' },  // זיתים
                { id: 428, qty: 1, unit: 'יח׳' },   // קופסה
                { id: 429, qty: 1, unit: 'יח׳' }    // מכסה
            ]
        },
        {
            menu_item_id: 53, // מרגריטה
            name: 'פיצה מרגריטה',
            ingredients: [
                { id: 420, qty: 1, unit: 'יח׳' },   // בצק
                { id: 366, qty: 60, unit: 'גרם' },  // רוטב עגבניות
                { id: 424, qty: 100, unit: 'גרם' }  // גבנצ
            ]
        }
    ];

    for (const r of recipes) {
        console.log(`\nCreating recipe for: ${r.name}`);

        // 1. Double check if recipe exists for this menu item
        const { data: existing } = await supabase
            .from('recipes')
            .select('id')
            .eq('menu_item_id', r.menu_item_id)
            .eq('business_id', BUSINESS_ID)
            .maybeSingle();

        let recipeId;
        if (existing) {
            recipeId = existing.id;
            console.log(`   Using existing recipe ID: ${recipeId}`);
        } else {
            const { data: newRecipe, error: rErr } = await supabase
                .from('recipes')
                .insert({
                    menu_item_id: r.menu_item_id,
                    business_id: BUSINESS_ID,
                    preparation_quantity: 1,
                    quantity_unit: 'Unit',
                    instructions: 'Standard automated recipe'
                })
                .select()
                .single();

            if (rErr) {
                console.error(`   ❌ Failed to create recipe:`, rErr.message);
                continue;
            }
            recipeId = newRecipe.id;
            console.log(`   Created new recipe ID: ${recipeId}`);
        }

        // 2. Clear old ingredients if any
        await supabase
            .from('recipe_ingredients')
            .delete()
            .eq('recipe_id', recipeId);

        // 3. Insert new ingredients
        const ingredientRows = r.ingredients.map(ing => ({
            recipe_id: recipeId,
            inventory_item_id: ing.id,
            quantity_used: ing.qty,
            unit_of_measure: ing.unit,
            cost_per_unit: 0
        }));

        const { error: iErr } = await supabase
            .from('recipe_ingredients')
            .insert(ingredientRows);

        if (iErr) {
            console.error(`   ❌ Failed to insert ingredients for ${r.name}:`, iErr.message);
        } else {
            console.log(`   ✅ Success! ${r.ingredients.length} ingredients linked.`);
        }
    }

    console.log("\n✨ Recipe setup complete!");
}

setupRecipes();
