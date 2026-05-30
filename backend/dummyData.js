const dummyData = {
    users: [
        { id: 1, email: 'test@pruva.com', company_id: 1, role: 'shipper' },
        { id: 2, email: 'forwarder@pruva.com', company_id: 2, role: 'logistician' }
    ],
    companies: [
        { id: 1, name: 'Pruva İthalat A.Ş.', approved: true, logo_url: null },
        { id: 2, name: 'Global Lojistik LTD.', approved: true, logo_url: null }
    ],
    listings: [
        { 
            id: 1, 
            origin: 'İstanbul', 
            destination: 'Hamburg', 
            cargo_type: '20ft Konteyner', 
            status: 'pending', 
            company_id: 1, 
            company_name: 'Pruva İthalat A.Ş.',
            created_at: new Date()
        },
        { 
            id: 2, 
            origin: 'İzmir', 
            destination: 'Marsilya', 
            cargo_type: 'Parsiyel Yük', 
            status: 'pending', 
            company_id: 1, 
            company_name: 'Pruva İthalat A.Ş.',
            created_at: new Date()
        }
    ],
    notifications: [
        { id: 1, user_id: 1, message: 'İlanınıza yeni bir teklif geldi!', is_read: false, created_at: new Date() },
        { id: 2, user_id: 1, message: 'Hoş geldiniz!', is_read: true, created_at: new Date() }
    ],
    offers: [],
    audit_logs: [],
    pricing_carriers: [
        { id: 1, user_id: 1, name: 'MSC', email: 'pricing@msc.com', category: 'armator', regions: ['Far East', 'Med'], preference_score: 5, template_type: 'fcl-request', is_active: true },
        { id: 2, user_id: 1, name: 'Maersk', email: 'quotes@maersk.com', category: 'armator', regions: ['Far East', 'Kuzey Avrupa'], preference_score: 4, template_type: 'fcl-request', is_active: true }
    ],
    pricing_templates: [],
    pricing_rfqs: [],
    pricing_actions: [],
    pricing_rates: [],
    pricing_outlook_accounts: [],
    pricing_margins: [
        { id: 1, user_id: 1, region: 'Far East', transport_mode: 'DENIZ_FCL', margin_percent: 12.00, customer_type: 'STANDARD' },
        { id: 2, user_id: 1, region: 'Med', transport_mode: 'DENIZ_FCL', margin_percent: 8.00, customer_type: 'STANDARD' },
        { id: 3, user_id: 1, region: 'Tüm Bölgeler', transport_mode: 'HAVA', margin_percent: 15.00, customer_type: 'STANDARD' },
        { id: 4, user_id: 1, region: 'Ortak', transport_mode: 'ORTAK', margin_percent: -5.00, customer_type: 'VIP' }
    ],
    pricing_customers: [
        { id: 1, user_id: 1, company_name: 'Arçelik A.Ş.', email: 'import@arcelik.com', active_regions: ['Far East', 'Med'], monthly_volume: 85, price_sensitivity: 'NORMAL', customer_type: 'STANDARD', notes: 'Düzenli FCL ithalat yüklemeleri yapmaktadır.' },
        { id: 2, user_id: 1, company_name: 'Vestel Lojistik', email: 'quotes@vestel.com', active_regions: ['Far East', 'Kuzey Avrupa', 'Amerika'], monthly_volume: 120, price_sensitivity: 'HIGH', customer_type: 'STANDARD', notes: 'Fiyat hassasiyeti yüksektir, alternatif navlun talep eder.' },
        { id: 3, user_id: 1, company_name: 'VIP Dış Ticaret A.Ş.', email: 'cargo@vipcorp.com', active_regions: ['Far East', 'Med', 'Karadeniz'], monthly_volume: 250, price_sensitivity: 'LOW', customer_type: 'VIP', notes: 'Premium VIP müşteri profilindedir, özel indirim uygulanır.' }
    ],
    pricing_carrier_performance: [
        { id: 1, carrier_id: 1, response_hours: 2.5, was_cheapest: true, was_selected: true, rfq_id: 1 },
        { id: 2, carrier_id: 2, response_hours: 4.2, was_cheapest: false, was_selected: false, rfq_id: 1 }
    ],
    pricing_rate_history: [
        { id: 1, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'MSC', price: 2100.00, currency: 'USD', valid_until: '2026-04-30', created_at: '2026-04-15T10:00:00Z' },
        { id: 2, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Maersk', price: 2250.00, currency: 'USD', valid_until: '2026-04-30', created_at: '2026-04-15T11:00:00Z' },
        { id: 3, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Hapag-Lloyd', price: 2200.00, currency: 'USD', valid_until: '2026-04-30', created_at: '2026-04-16T09:30:00Z' },
        { id: 4, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'MSC', price: 1950.00, currency: 'USD', valid_until: '2026-05-30', created_at: '2026-05-15T10:00:00Z' },
        { id: 5, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Maersk', price: 2050.00, currency: 'USD', valid_until: '2026-05-30', created_at: '2026-05-15T11:00:00Z' },
        { id: 6, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Hapag-Lloyd', price: 2000.00, currency: 'USD', valid_until: '2026-05-30', created_at: '2026-05-16T09:30:00Z' },
        { id: 7, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'MSC', price: 1850.00, currency: 'USD', valid_until: '2026-06-30', created_at: '2026-06-15T10:00:00Z' },
        { id: 8, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Maersk', price: 1900.00, currency: 'USD', valid_until: '2026-06-30', created_at: '2026-06-15T11:00:00Z' },
        { id: 9, user_id: 1, pol: 'Şangay', pod: 'Ambarlı', transport_mode: 'DENIZ_FCL', container_type: '40HC', carrier_name: 'Hapag-Lloyd', price: 1880.00, currency: 'USD', valid_until: '2026-06-30', created_at: '2026-06-16T09:30:00Z' }
    ]
};

module.exports = dummyData;
