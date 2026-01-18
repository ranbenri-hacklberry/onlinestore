/**
 * Offline Queue Service
 * Handles order synchronization with Supabase
 * VERSION: 10.0 (VERIFIED 23-PARAM SIGNATURE)
 */

import { db } from '../db/database';
import { supabase } from '../lib/supabase';

console.log('🚀 [OFFLINE QUEUE] V10.0 activated - Using verified signature from server hint.');

let isSyncing = false;

export const queueAction = async (type, payload) => {
    const action = {
        type,
        payload,
        status: 'pending',
        timestamp: new Date().toISOString(),
        retries: 0
    };
    return await db.offline_queue_v2.add(action);
};

export const syncQueue = async () => {
    if (isSyncing) return;
    isSyncing = true;
    try {
        const pending = await db.offline_queue_v2.where('status').equals('pending').toArray();
        for (const action of pending) {
            try {
                await processAction(action);
                await db.offline_queue_v2.update(action.id, { status: 'completed' });
            } catch (err) {
                console.error('❌ [Sync V10] Error:', err.message);
                await db.offline_queue_v2.update(action.id, { status: 'failed', lastError: err.message });
            }
        }
    } finally {
        isSyncing = false;
    }
};

const processAction = async (action) => {
    if (action.type === 'CREATE_ORDER') {
        const orderId = action.payload.localOrderId;
        const order = await db.orders.get(orderId);

        if (!order || order.serverOrderId) return;

        // EXACT 23-PARAMETER SIGNATURE AS PER POSTGRES HINT:
        const rpcParams = {
            p_business_id: order.business_id,
            p_cancelled_items: [], // Param 2
            p_customer_id: null,   // Param 3
            p_customer_name: order.customer_name,
            p_customer_phone: order.customer_phone,
            p_delivery_address: order.delivery_address || '',
            p_delivery_fee: 0,
            p_delivery_notes: '',
            p_discount_amount: 0,
            p_discount_id: null,
            p_edit_mode: false,
            p_final_total: order.total_amount || 0,
            p_is_paid: false,
            p_is_quick_order: false,
            p_items: action.payload.p_items || [],
            p_order_id: null,
            p_order_type: order.order_type || 'pickup',
            p_original_coffee_count: 0,
            p_original_total: order.total_amount || 0,
            p_payment_method: order.payment_method || 'bit',
            p_refund: false,
            p_refund_amount: 0,
            p_refund_method: null
        };

        console.log('📤 [Sync V10] Calling submit_order_v3 with 23 params...');
        const { data, error } = await supabase.rpc('submit_order_v3', rpcParams);

        if (error) {
            console.error('❌ [Sync V10] RPC FAILED:', error.message);
            console.error('Details:', error.details);
            throw error;
        }

        if (data?.order_id) {
            await db.orders.update(order.id, {
                serverOrderId: data.order_id,
                order_number: data.order_number,
                pending_sync: false
            });
            console.log('✅ [Sync V10] Success! Order ID:', data.order_id);
        }
    }
};

export default { queueAction, syncQueue };
