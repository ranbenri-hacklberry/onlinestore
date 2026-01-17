const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gxzsxvbercpkgxraiaex.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g'
);

const BUSINESS_ID = '8e4e05da-2d99-4bd9-aedf-8e54cbde930a';

async function updateCatalog() {
    console.log('🚀 מעדכן קטלוג עם עצים חדשים ותת-קטגוריות...');

    const categories = [
        { name: 'ornamental_trees', name_he: 'עצי נוי', icon: '🌳', position: 2 },
        { name: 'fruit_trees', name_he: 'עצי פרי', icon: '🍋', position: 3 },
        { name: 'shrubs', name_he: 'שיחים', icon: '🌿', position: 4 }
    ];

    const categoryIds = {};

    for (const cat of categories) {
        const { data, error } = await supabase
            .from('item_category')
            .upsert({
                business_id: BUSINESS_ID,
                name: cat.name,
                name_he: cat.name_he,
                icon: cat.icon,
                position: cat.position
            }, { onConflict: 'business_id,name' })
            .select();

        if (error) console.error(`שגיאה ביצירת קטגוריה ${cat.name_he}:`, error);
        else categoryIds[cat.name] = data[0].id;
    }

    const ornamentalTrees = [
        { name: 'שיזף מצוי', p8: 75, p10: 105, p25: 145 },
        { name: 'ברוש/תויה', p8: 70, p10: 100, p25: 150 },
        { name: 'כסיית האבוב', p8: 80, p10: 110, p25: 160 },
        { name: 'אלת המסטיק', p8: 75, p10: 105, p25: 145 },
        { name: 'קסטנוספרמום אוסטרלי', p8: 80, p10: 110, p25: 150 },
        { name: 'אלה סינית', p8: 75, p10: 105, p25: 145 },
        { name: 'בוהיניה', p8: 75, p10: 105, p25: 145 },
        { name: 'כליל החורש', p8: 70, p10: 100, p25: 140 },
        { name: 'אלון מצוי', p8: 70, p10: 100, p25: 140 },
        { name: 'אלון הגלעין', p8: 70, p10: 100, p25: 140 },
        { name: 'אלון אנגלי', p8: 70, p10: 100, p25: 140 },
        { name: 'אלון תבור', p8: 70, p10: 100, p25: 140 },
        { name: 'ארגן', p8: 70, p10: 100, p25: 140 },
        { name: 'דולב מזרחי', p8: 85, p10: 115, p25: 155 },
        { name: 'הרדוף', p8: 65, p10: 100, p25: 140 },
        { name: 'קטלב', p8: 90, p10: 120, p25: 200 },
        { name: 'מכנף', p8: 90, p10: 120, p25: 160 },
        { name: 'לגסטרמיה', p8: 90, p10: 120, p25: 170 },
        { name: 'דק פרי הגר', p8: 85, p10: 120, p25: 165 }
    ];

    const fruitTrees = [
        { name: 'גויאבה אדומה/לבנה', p8: 75, p10: 100, p25: 150 },
        { name: 'מקדמיה', p8: 80, p10: 110, p25: 160 },
        { name: 'פינגרליים', p8: 135, p10: 165, p25: 200 },
        { name: 'תאנה', p8: 80, p10: 110, p25: 150 },
        { name: 'אבוקדו', p8: 115, p10: 145, p25: 185 },
        { name: 'מנגו', p8: 120, p10: 150, p25: 200 },
        { name: "ליצ'י הונג/לונג/מאוריציוס", p8: 160, p10: 190, p25: 230 },
        { name: 'גויאבה תותית אדומה', p8: 95, p10: 125, p25: 180 },
        { name: 'שסק', p8: 95, p10: 125, p25: 170 },
        { name: 'פקאן', p8: 135, p10: 165, p25: 200 },
        { name: 'אגוז מלך', p8: 130, p10: 160, p25: 200 },
        { name: 'תות שאמי', p8: 130, p10: 160, p25: 250 },
        { name: 'תות', p8: 75, p10: 105, p25: 145 },
        { name: 'שזיף אדום', p8: 85, p10: 115, p25: 155 },
        { name: 'רימון', p8: 75, p10: 105, p25: 150 },
        { name: 'חרוב', p8: 90, p10: 120, p25: 160 },
        { name: 'הדרים', p8: 80, p10: 110, p25: 200 },
        { name: 'בננה', p8: 100, p10: 130, p25: 170 }
    ];

    const allTreesToAdd = [
        ...ornamentalTrees.map(t => ({ ...t, cat_id: categoryIds['ornamental_trees'], cat_name: 'עצי נוי' })),
        ...fruitTrees.map(t => ({ ...t, cat_id: categoryIds['fruit_trees'], cat_name: 'עצי פרי' }))
    ];

    for (const tree of allTreesToAdd) {
        const sizesData = {
            '8L': tree.p8,
            '10L': tree.p10,
            '25L': tree.p25
        };

        const { error } = await supabase
            .from('menu_items')
            .upsert({
                business_id: BUSINESS_ID,
                name: tree.name,
                price: tree.p8,
                description: JSON.stringify(sizesData),
                category_id: tree.cat_id,
                category: tree.cat_name,
                is_in_stock: true
            }, { onConflict: 'business_id,name' });

        if (error) console.error(`שגיאה בהוספת ${tree.name}:`, error);
        else console.log(`✅ עודכן: ${tree.name}`);
    }

    console.log('✨ עדכון הקטלוג הסתיים בהצלחה!');
}

updateCatalog();
