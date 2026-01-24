const data = require('./rpc_full_data.json');

const daily = {};
const hourly = {};
const categoryRev = {};
const prepTimes = [];
const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

data.forEach(order => {
    const created = new Date(order.created_at);
    const ready = order.ready_at ? new Date(order.ready_at) : null;
    const dateStr = order.created_at.split('T')[0];
    const hour = created.getHours();
    const dayIndex = created.getDay();

    daily[dateStr] = daily[dateStr] || { rev: 0, count: 0, dayName: dayNames[dayIndex] };
    daily[dateStr].rev += (order.total_amount || 0);
    daily[dateStr].count += 1;

    hourly[hour] = (hourly[hour] || 0) + 1;

    if (ready) {
        const diff = (ready - created) / (1000 * 60); // minutes
        if (diff > 0 && diff < 120) { // filter outliers
            prepTimes.push({ hour, diff, day: dayIndex });
        }
    }

    if (order.order_items) {
        order.order_items.forEach(item => {
            const cat = item.menu_items?.category || 'אחר';
            categoryRev[cat] = (categoryRev[cat] || 0) + (item.quantity * item.price);
        });
    }
});

const avgPrepByHour = {};
prepTimes.forEach(p => {
    avgPrepByHour[p.hour] = avgPrepByHour[p.hour] || { sum: 0, count: 0 };
    avgPrepByHour[p.hour].sum += p.diff;
    avgPrepByHour[p.hour].count += 1;
});

const hourlyStats = Object.keys(hourly).map(h => ({
    hour: h + ':00',
    orders: hourly[h],
    avgPrep: avgPrepByHour[h] ? (avgPrepByHour[h].sum / avgPrepByHour[h].count).toFixed(1) : 'N/A'
})).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

const dailyStats = Object.keys(daily).map(d => ({
    date: d,
    dayName: daily[d].dayName,
    revenue: daily[d].rev,
    orders: daily[d].count
})).sort((a, b) => a.date.localeCompare(b.date));

console.log('STATS_READY');
console.log(JSON.stringify({ hourlyStats, dailyStats, categoryRev, totalOrders: data.length }));
