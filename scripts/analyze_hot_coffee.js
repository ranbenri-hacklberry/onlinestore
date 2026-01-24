const data = require('./rpc_full_data.json');

let totalPrepTime = 0;
let count = 0;
const hourly = {};

data.forEach(order => {
    const created = new Date(order.created_at);
    const day = created.getDay();

    // Midweek only (Sunday to Thursday)
    if (day >= 0 && day <= 4) {
        const hasHotCoffee = order.order_items?.some(item =>
            item.menu_items?.category === 'שתיה חמה' ||
            item.menu_items?.name?.includes('הפוך') ||
            item.menu_items?.name?.includes('קפוצ') ||
            item.menu_items?.name?.includes('נס')
        );

        if (hasHotCoffee && order.ready_at) {
            const ready = new Date(order.ready_at);
            const diff = (ready - created) / (1000 * 60);

            if (diff > 0 && diff < 60) {
                totalPrepTime += diff;
                count++;

                const hr = created.getHours();
                if (!hourly[hr]) hourly[hr] = { total: 0, count: 0 };
                hourly[hr].total += diff;
                hourly[hr].count++;
            }
        }
    }
});

if (count > 0) {
    const avg = totalPrepTime / count;
    console.log(`HOT_COFFEE_ANALYSIS`);
    console.log(`Average Prep Time for Hot Coffee (Midweek): ${avg.toFixed(2)} minutes`);
    console.log(`Based on ${count} orders.`);
    console.log(`\nHourly Breakdown (Midweek):`);
    Object.keys(hourly).sort((a, b) => a - b).forEach(hr => {
        const hAvg = hourly[hr].total / hourly[hr].count;
        console.log(`${hr}:00 - ${hAvg.toFixed(2)} mins (${hourly[hr].count} orders)`);
    });
} else {
    console.log('No matching data found.');
}
