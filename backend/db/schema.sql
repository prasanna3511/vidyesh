CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS murti_history (
  id BIGSERIAL PRIMARY KEY,
  murti_id VARCHAR(100) NOT NULL,
  size VARCHAR(50) NOT NULL,
  final_price NUMERIC(12, 2) NOT NULL,
  booking_status VARCHAR(30) NOT NULL DEFAULT 'available',
  image TEXT,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(30),
  customer_email VARCHAR(150),
  address TEXT,
  paid_amount NUMERIC(12, 2),
  discount_price NUMERIC(12, 2),
  paid_amount_sc TEXT,
  payment_mode VARCHAR(50),
  suggestions TEXT,
  booked_by VARCHAR(150),
  booking_date DATE,
  supplier VARCHAR(50),
  murti_design VARCHAR(100),
  stored_at VARCHAR(100),
  roundup_amount NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT murti_booking_status_check
    CHECK (booking_status IN ('available', 'pending', 'booked', 'delivered'))
);

CREATE TABLE IF NOT EXISTS murti_images (
  id BIGSERIAL PRIMARY KEY,
  murti_history_id BIGINT NOT NULL REFERENCES murti_history(id) ON DELETE CASCADE,
  image_ref TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS advertisement_messages (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  placement VARCHAR(30) NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT advertisement_placement_check
    CHECK (placement IN ('general', 'upper', 'lower'))
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'staff'))
);

CREATE INDEX IF NOT EXISTS idx_murti_history_status ON murti_history (booking_status);
CREATE INDEX IF NOT EXISTS idx_murti_history_design ON murti_history (murti_design);
CREATE INDEX IF NOT EXISTS idx_murti_history_stored_at ON murti_history (stored_at);
CREATE INDEX IF NOT EXISTS idx_murti_images_murti_history_id ON murti_images (murti_history_id);
CREATE INDEX IF NOT EXISTS idx_advertisement_messages_placement ON advertisement_messages (placement);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

ALTER TABLE murti_history
  ALTER COLUMN paid_amount_sc TYPE TEXT
  USING paid_amount_sc::TEXT;

ALTER TABLE murti_history
  DROP CONSTRAINT IF EXISTS murti_history_murti_id_key;

CREATE INDEX IF NOT EXISTS idx_murti_history_murti_id ON murti_history (murti_id);

DROP TRIGGER IF EXISTS trg_murti_history_updated_at ON murti_history;
CREATE TRIGGER trg_murti_history_updated_at
BEFORE UPDATE ON murti_history
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_advertisement_messages_updated_at ON advertisement_messages;
CREATE TRIGGER trg_advertisement_messages_updated_at
BEFORE UPDATE ON advertisement_messages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
