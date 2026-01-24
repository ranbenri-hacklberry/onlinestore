const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://postgres.gxzsxvbercpkgxraiaex:hackl2025!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const businessId = '11111111-1111-1111-1111-111111111111';
    const start = '2026-01-11T00:00:00Z';
    const end = '2026-01-17T00:00:00Z';

    try {
        const dailyQuery = `
      SELECT 
        date_trunc('day', o.created_at) as day,
        COUNT(DISTINCT o.id) as orders,
        SUM(oi.quantity * oi.price) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE mi.business_id = $1
      AND o.created_at >= $2 AND o.created_at < $3
      GROUP BY 1
      ORDER BY 1;
    `;
        const daily = await pool.query(dailyQuery, [businessId, start, end]);

        const hourlyQuery = `
      SELECT 
        extract(hour from o.created_at) as hour,
        COUNT(DISTINCT o.id) as orders
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE mi.business_id = $1
      AND o.created_at >= $2 AND o.created_at < $3
      GROUP BY 1
      ORDER BY 2 DESC;
    `;
        const hourly = await pool.query(hourlyQuery, [businessId, start, end]);

        const itemsQuery = `
      SELECT 
        mi.name,
        SUM(oi.quantity) as qty,
        SUM(oi.quantity * oi.price) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE mi.business_id = $1
      AND o.created_at >= $2 AND o.created_at < $3
      GROUP BY 1
      ORDER BY 2 DESC
      LIMIT 5;
    `;
        const items = await pool.query(itemsQuery, [businessId, start, end]);

        console.log('DAILY:', JSON.stringify(daily.rows, null, 2));
        console.log('HOURLY:', JSON.stringify(hourly.rows, null, 2));
        console.log('ITEMS:', JSON.stringify(items.rows, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
