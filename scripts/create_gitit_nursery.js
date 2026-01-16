// Script to create new business: שפת המדבר - Gitit Nursery
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxzsxvbercpkgxraiaex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enN4dmJlcmNwa2d4cmFpYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMyNzAsImV4cCI6MjA3NzEzOTI3MH0.6sJ7PJ2imo9-mzuYdqRlhQty7PCQAzpSKfcQ5ve571g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createGititNursery() {
    console.log('🌿 Creating new business: שפת המדבר - Gitit Nursery...\n');

    const newBusiness = {
        name: 'שפת המדבר',
        phone_number: '+972556822072',
        whatsapp_number: '972556822072',
        bit_phone: '972556822072',
        paybox_phone: '972556822072',
        settings: {
            subdomain: 'gititnursery.huckleberryfinn.com',
            description: 'משתלה ועגלת קפה בגיתית',
            business_type: 'nursery',
            location: 'גיתית',
            currency: 'ILS',
            theme: {
                primaryColor: '#10b981', // emerald
                secondaryColor: '#14b8a6' // teal
            }
        }
    };

    const { data, error } = await supabase
        .from('businesses')
        .insert([newBusiness])
        .select();

    if (error) {
        console.error('❌ Error creating business:', error.message);
        console.error('Details:', error);
        return null;
    }

    console.log('✅ Business created successfully!');
    console.log('📋 Business ID:', data[0].id);
    console.log('📛 Name:', data[0].name);
    console.log('📞 WhatsApp:', data[0].whatsapp_number);
    console.log('🔗 Subdomain:', data[0].settings?.subdomain);

    return data[0];
}

createGititNursery().then((business) => {
    if (business) {
        console.log('\n🎉 Done! Business ID:', business.id);
    }
    process.exit(0);
});
