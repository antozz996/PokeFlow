-- supabase/migrations/001_initial.sql

-- ============================================
-- TABELLA ORDERS
-- ============================================

CREATE TABLE orders (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_num   SMALLINT NOT NULL,
  customer_name TEXT NOT NULL,
  status      SMALLINT NOT NULL DEFAULT 0,
  -- 0 = preso_in_carico
  -- 1 = in_preparazione
  -- 2 = pronto (RITIRA)
  -- 3 = consegnato (soft, poi delete)
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index per ordinamento display
CREATE INDEX orders_status_created_idx ON orders(status, created_at ASC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Chiunque può leggere (monitor pubblico)
CREATE POLICY "public_select"
  ON orders FOR SELECT
  USING (true);

-- Solo utenti autenticati possono inserire
CREATE POLICY "auth_insert"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Solo utenti autenticati possono aggiornare
CREATE POLICY "auth_update"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

-- Solo utenti autenticati possono eliminare
CREATE POLICY "auth_delete"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
