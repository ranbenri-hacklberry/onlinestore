const data = require('/Users/user/.gemini/antigravity/scratch/onlinestore/scripts/weekly_raw.json');
const daily = {};
const hourly = {};
const items = {};
let totalRevenue = 0;

data.forEach(item => {
    if (!item.menu_items) return;
    const dateStr = item.created_at.split('T')[0];
    const hour = (new Date(item.created_at).getHours() + 2) % 24; // Simple UTC to local adjustment if needed, but let's stick to raw for now
    const rev = item.quantity * item.price;

    totalRevenue += rev;
    daily[dateStr] = (daily[dateStr] || 0) + rev;
    hourly[hour] = (hourly[hour] || 0) + item.quantity;

    const name = item.menu_items.name || 'Unknown';
    items[name] = (items[name] || 0) + item.quantity;
});

console.log('--- Sales Analysis (עגת קפה - 11/01 to 16/01) ---');
console.log('Total Revenue:', totalRevenue.toFixed(2), 'NIS');

console.log('\n--- Daily Revenue ---');
const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
Object.keys(daily).sort().forEach((d, i) => {
    console.log((dayNames[i] || 'אחר') + ' (' + d + '):', daily[d].toFixed(2), 'NIS');
});

console.log('\n--- Peak Hours (Items Sold Sum) ---');
Object.entries(hourly).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([h, qty]) => {
    console.log(h + ':00 -', qty, 'items');
});

console.log('\n--- Best Sellers (Qty) ---');
Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([name, qty]) => {
    console.log(name + ':', qty);
});
