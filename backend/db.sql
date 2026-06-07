-- Şirketler tablosu
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    tax_document_url TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcılar tablosu (Geliştirilmiş v3)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('shipper', 'logistician', 'admin')) DEFAULT 'shipper',
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    coin_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E-posta Doğrulama Tokenları
CREATE TABLE verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- İlanlar (Listings) tablosu - Gelişmiş
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    cargo_type VARCHAR(100) NOT NULL,
    is_dangerous BOOLEAN DEFAULT FALSE,
    danger_code VARCHAR(50),
    volume NUMERIC,
    load_type VARCHAR(100),
    loading_date DATE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, closed, expired
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teklifler (Offers) tablosu
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    forwarder_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) CHECK (currency IN ('TRY', 'USD', 'EUR')) NOT NULL,
    price_type VARCHAR(20) CHECK (price_type IN ('all-in', 'freight', 'customs')) NOT NULL,
    transit_time VARCHAR(100) NOT NULL,
    note TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, forwarder_id) -- Aynı kullanıcı aynı ilana sadece 1 teklif verebilir
);

-- Eşleşmeler (Matches) tablosu - Gelişmiş
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    shipper_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    forwarder_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bildirimler (Notifications) tablosu
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Denetim Kayıtları (Audit Logs)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, ACCEPT etc.
    entity_type VARCHAR(50) NOT NULL, -- listings, offers, matches
    entity_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokenlar
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Coin İşlemleri (Coin Transactions)
CREATE TABLE coin_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'reward'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Taşıyıcılar (Faz 1'deki localStorage'dan taşınıyor)
CREATE TABLE IF NOT EXISTS pricing_carriers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- ARMATÖR, NVOCC, ACENTE, HAVAYOLU, KARA
  regions TEXT[], -- Far East, Med, Karadeniz vb.
  transport_modes TEXT[], -- DENIZ_FCL, DENIZ_LCL, HAVA, KARA
  template_type VARCHAR(50), -- hangi şablon gönderilsin
  preference_score INTEGER DEFAULT 3, -- 1-5 yıldız
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mail şablonları (Faz 1'deki localStorage'dan taşınıyor)
CREATE TABLE IF NOT EXISTS pricing_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  template_key VARCHAR(100) NOT NULL, -- FCL_RATE_REQUEST, LCL_OFFER vb.
  transport_mode VARCHAR(20) NOT NULL, -- DENIZ_FCL, DENIZ_LCL, HAVA, KARA, ORTAK
  template_type VARCHAR(50) NOT NULL, -- RATE_REQUEST, OFFER, NEGOTIATION, FOLLOW_UP, MISSING_INFO
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_key)
);

-- Gelen navlun talepleri
CREATE TABLE IF NOT EXISTS pricing_rfqs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  outlook_message_id VARCHAR(500) UNIQUE,
  sender_email VARCHAR(255),
  sender_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  received_at TIMESTAMP,
  category VARCHAR(50), -- RFQ, RATE_RESPONSE, NEGOTIATION, FOLLOW_UP, OTHER
  transport_mode VARCHAR(20), -- DENIZ_FCL, DENIZ_LCL, HAVA, KARA
  extracted_data JSONB, -- AI'ın mailden çıkardığı veriler
  missing_fields TEXT[], -- eksik alanlar listesi
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, MISSING_INFO_SENT, RATES_REQUESTED, OFFER_SENT, COMPLETED, CANCELLED
  missing_info_round INTEGER DEFAULT 0, -- kaçıncı eksik bilgi turu
  lost_reason TEXT, -- kaybetme nedeni (Faz 6 / Lost deal)
  competitor_price DECIMAL(10,2), -- rakip navlun fiyatı
  conversation_id VARCHAR(500),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bekleyen aksiyonlar (kullanıcı onayı bekleyen işlemler)
CREATE TABLE IF NOT EXISTS pricing_actions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rfq_id INTEGER REFERENCES pricing_rfqs(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- SEND_MISSING_INFO, SEND_RATE_REQUEST, SEND_OFFER, SEND_NEGOTIATION, SEND_FOLLOW_UP
  title VARCHAR(255),
  description TEXT,
  suggested_mail JSONB, -- AI'ın önerdiği mail (to, subject, body)
  carriers_to_contact JSONB, -- rate request gidecek taşıyıcılar
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, SENT
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Taşıyıcılardan gelen fiyatlar
CREATE TABLE IF NOT EXISTS pricing_rates (
  id SERIAL PRIMARY KEY,
  rfq_id INTEGER REFERENCES pricing_rfqs(id) ON DELETE CASCADE,
  carrier_id INTEGER REFERENCES pricing_carriers(id),
  carrier_name VARCHAR(255),
  outlook_message_id VARCHAR(500),
  raw_mail TEXT,
  extracted_price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  price_per VARCHAR(50), -- konteyner, CBM, KG, araç
  validity_date DATE,
  transit_time VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'RECEIVED', -- RECEIVED, SELECTED, REJECTED
  received_at TIMESTAMP DEFAULT NOW()
);

-- Outlook bağlantı bilgileri
CREATE TABLE IF NOT EXISTS pricing_outlook_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  home_account_id VARCHAR(500),
  email VARCHAR(255),
  is_connected BOOLEAN DEFAULT true,
  last_scan_at TIMESTAMP,
  last_scanned_message_id VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Margin Kuralları (Faz 5)
CREATE TABLE IF NOT EXISTS pricing_margins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  region VARCHAR(100),
  transport_mode VARCHAR(20), -- DENIZ_FCL, DENIZ_LCL, HAVA, KARA, ORTAK
  margin_percent DECIMAL(5,2),
  customer_type VARCHAR(20) DEFAULT 'STANDARD', -- STANDARD, VIP, SENSITIVE
  created_at TIMESTAMP DEFAULT NOW()
);

-- Müşteri Profilleri (Faz 5)
CREATE TABLE IF NOT EXISTS pricing_customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  active_regions TEXT[],
  monthly_volume INTEGER DEFAULT 0,
  price_sensitivity VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH
  customer_type VARCHAR(20) DEFAULT 'STANDARD', -- STANDARD, VIP, SENSITIVE
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Taşıyıcı Performans Skoru (Faz 5)
CREATE TABLE IF NOT EXISTS pricing_carrier_performance (
  id SERIAL PRIMARY KEY,
  carrier_id INTEGER REFERENCES pricing_carriers(id) ON DELETE CASCADE,
  response_hours DECIMAL(5,1),
  was_cheapest BOOLEAN DEFAULT false,
  was_selected BOOLEAN DEFAULT false,
  rfq_id INTEGER REFERENCES pricing_rfqs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
 
-- Rate Geçmişi (Faz 6)
CREATE TABLE IF NOT EXISTS pricing_rate_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  pol VARCHAR(100),
  pod VARCHAR(100),
  transport_mode VARCHAR(20),
  container_type VARCHAR(20),
  carrier_name VARCHAR(255),
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
