# iCaffe API Documentation 🚀

Welcome to the iCaffe Open API documentation. This system is designed with an **API-first approach**, allowing independent developers and future AI agents to build custom interfaces, mobile apps, or third-party integrations (like WooCommerce, specialized Kiosks, or IoT devices) on top of the robust iCaffe backend.

## Core Architecture

The backend is powered by **Supabase (PostgreSQL)**. Most business logic is encapsulated in **RPC (Remote Procedure Call)** functions to ensure data integrity, bypass complex RLS (Row Level Security) issues for customers, and provide a clean interface for front-end applications.

---

## 🛍️ Ordering API

### `submit_order_v3`

The primary function for placing orders. It handles inventory decrements, customer record creation, and order persistence in a single transaction.

**RPC Name:** `submit_order_v3`

| # | Parameter | Type | Description |
|---|-----------|------|-------------|
| 1 | `p_customer_phone` | `text` | Customer's phone (Format: `05XXXXXXXX`) |
| 2 | `p_customer_name` | `text` | Customer's full name |
| 3 | `p_items` | `jsonb` | Array of items: `[{menu_item_id, quantity, unit_price, mods: []}]` |
| 4 | `p_is_paid` | `boolean` | Payment status (usually `false` for pending manual pay) |
| 5 | `p_customer_id` | `uuid` | Optional. If null, lookup/create by phone. |
| 6 | `p_payment_method` | `text` | `bit`, `paybox`, `cash`, `credit-card`, etc. |
| 7 | `p_refund` | `boolean` | Always `false` for new orders. |
| 8 | `p_refund_amount` | `numeric` | Default `0`. |
| 9 | `p_refund_method` | `text` | Default `null`. |
| 10 | `p_edit_mode` | `boolean` | Always `false` for client-side creation. |
| 11 | `p_order_id` | `uuid` | Optional. `null` for new orders. |
| 12 | `p_original_total` | `numeric` | Subtotal before discounts. |
| 13 | `p_cancelled_items` | `jsonb` | Default `[]`. |
| 14 | `p_final_total` | `numeric` | Final amount to charge. |
| 15 | `p_original_coffee_count` | `integer` | Default `0`. |
| 16 | `p_is_quick_order` | `boolean` | Default `false`. |
| 17 | `p_discount_id` | `uuid` | UUID of the applied discount. |
| 18 | `p_discount_amount` | `numeric` | Amount subtracted. |
| 19 | `p_business_id` | `uuid` | **CRITICAL:** The target business UUID. |
| 20 | `p_order_type` | `text` | `pickup` or `delivery`. |
| 21 | `p_delivery_address` | `text` | Required if `p_order_type` is `delivery`. |
| 22 | `p_delivery_fee` | `numeric` | Fee charged for delivery. |
| 23 | `p_delivery_notes` | `text` | Any custom instruction for the courier. |

---

## 👤 Customer & Loyalty API

### `lookup_customer`

Fetch customer details and current loyalty profile.

**RPC Name:** `lookup_customer`

- `p_phone` (text): The phone number to search for.

**Returns:** Customer object including `loyalty_points`, `name`, and `id`.

---

## 🛠️ Internal Implementation Notes

- **Offline First:** The system uses **Dexie.js** for local storage. All orders are first saved locally to the `orders` table and then queued for sync via `services/offlineQueue.js`.
- **Sync Status:** Orders pending sync have `pending_sync: true` in Dexie.
- **Business IDs:** Every call MUST include the `business_id` to ensure multi-tenant isolation.

---

*This documentation is living and will be updated as we expand our API capabilities.*
