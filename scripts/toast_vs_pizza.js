const data = require('./rpc_full_data.json');

const targetDate = '2026-01-16'; // Last Friday
const hourlyData = {};

data.forEach(order => {
    const created = new Date(order.created_at);
    const dateStr = created.toISOString().split('T')[0];

    if (dateStr === targetDate) {
        const hour = created.getHours();
        if (!hourlyData[hour]) hourlyData[hour] = { toasts: 0, pizzas: 0 };

        order.order_items?.forEach(item => {
            const name = item.menu_items?.name || '';
            const qty = item.quantity || 1;

            if (name.includes('טוסט')) {
                hourlyData[hour].toasts += qty;
            } else if (name.includes('פיצה')) {
                hourlyData[hour].pizzas += qty;
            }
        });
    }
});

console.log(`ANALYSIS_FRIDAY_FOOD`);
console.log(`Date: ${targetDate} (Friday)`);
console.log(`-----------------------------------------`);
console.log(`| Hour  | Toasts (טוסט) | Pizzas (פיצה) |`);
console.log(`-----------------------------------------`);

Object.keys(hourlyData).sort((a, b) => a - b).forEach(hour => {
    const h = hour.padStart(2, '0') + ':00';
    const t = hourlyData[hour].toasts.toString().padEnd(13, ' ');
    const p = hourlyData[hour].pizzas.toString().padEnd(12, ' ');
    console.log(`| ${h} | ${t} | ${p} |`);
});
console.log(`-----------------------------------------`);
