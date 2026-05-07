-- ═══════════════════════════════════════════
-- MESAIO · Schema Supabase · Hackathon 2026
-- Reutiliza el proyecto Supabase de RNT (HernandoSilvaLeal)
-- URL: https://fttrbfntgxvbfdmndogo.supabase.co
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════

-- 1. USUARIOS (extiende Supabase Auth)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin','mesero','cocinero')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MESAS
CREATE TABLE IF NOT EXISTS mesas (
  id SERIAL PRIMARY KEY,
  numero INT UNIQUE NOT NULL,
  capacidad INT NOT NULL DEFAULT 4,
  estado TEXT NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre','ocupada','cobro')),
  ubicacion TEXT DEFAULT 'salón'
);

-- 3. PLATOS
CREATE TABLE IF NOT EXISTS platos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('entrada','fuerte','postre','bebida')),
  precio INT NOT NULL,
  disponible BOOLEAN DEFAULT true,
  descripcion TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ORDENES
CREATE TABLE IF NOT EXISTS ordenes (
  id SERIAL PRIMARY KEY,
  mesa_id INT REFERENCES mesas(id),
  mesero_nombre TEXT NOT NULL DEFAULT 'Demo',
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','preparando','listo','entregado','cobrado','cancelado')),
  total INT DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ORDEN_ITEMS
CREATE TABLE IF NOT EXISTS orden_items (
  id SERIAL PRIMARY KEY,
  orden_id INT REFERENCES ordenes(id) ON DELETE CASCADE,
  plato_id INT REFERENCES platos(id),
  plato_nombre TEXT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario INT NOT NULL,
  subtotal INT NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════

-- 12 Mesas
INSERT INTO mesas (numero, capacidad, ubicacion) VALUES
(1,2,'barra'),(2,4,'salón'),(3,4,'salón'),(4,6,'salón'),
(5,2,'terraza'),(6,4,'terraza'),(7,4,'salón'),(8,8,'privado'),
(9,4,'terraza'),(10,2,'barra'),(11,6,'salón'),(12,4,'terraza')
ON CONFLICT (numero) DO NOTHING;

-- 15 Platos colombianos
INSERT INTO platos (nombre, categoria, precio, disponible, descripcion) VALUES
('Empanadas de carne',    'entrada', 12000, true, 'Crujientes empanadas con ají'),
('Ajiaco santafereño',    'entrada', 36000, true, 'Sopa bogotana con pollo, papa y guascas'),
('Patacones con hogao',   'entrada', 15000, true, 'Plátano verde frito con salsa criolla'),
('Bandeja paisa',         'fuerte',  42000, true, 'El clásico antioqueño completo'),
('Lomo al trapo',         'fuerte',  58000, true, 'Lomo de res envuelto en tela, cocción lenta'),
('Cazuela de mariscos',   'fuerte',  62000, true, 'Mariscos frescos en salsa criolla'),
('Mojarra frita',         'fuerte',  45000, true, 'Pescado entero frito con patacón'),
('Pollo a la brasa',      'fuerte',  38000, true, 'Pollo marinado a las brasas con yuca'),
('Chuleta valluna',       'fuerte',  44000, true, 'Chuleta apanada gigante con arroz'),
('Tres leches',           'postre',  18000, true, 'Bizcocho húmedo de tres leches'),
('Cuajada con melao',     'postre',  14000, true, 'Queso fresco con miel de panela'),
('Arroz con leche',       'postre',  12000, true, 'Cremoso arroz con leche y canela'),
('Limonada de coco',      'bebida',   9000, true, 'Refrescante limonada con coco rallado'),
('Jugo de lulo',          'bebida',   8000, true, 'Jugo natural de lulo bien frío'),
('Agua de panela con limón','bebida', 6000, true, 'Tradicional bebida colombiana')
ON CONFLICT DO NOTHING;

-- 3 Usuarios demo
INSERT INTO usuarios (email, nombre, rol) VALUES
('admin@mesaio.co',   'Chef Administrador', 'admin'),
('mesero@mesaio.co',  'Carlos Ramírez',     'mesero'),
('cocina@mesaio.co',  'María Posada',       'cocinero')
ON CONFLICT (email) DO NOTHING;

-- RLS básico (todo público para demo)
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- DROP policies si existen previamente (idempotente)
DROP POLICY IF EXISTS "public_read_all" ON mesas;
DROP POLICY IF EXISTS "public_read_all" ON platos;
DROP POLICY IF EXISTS "public_read_all" ON ordenes;
DROP POLICY IF EXISTS "public_read_all" ON orden_items;
DROP POLICY IF EXISTS "public_read_all" ON usuarios;

CREATE POLICY "public_read_all" ON mesas       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_all" ON platos      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_all" ON ordenes     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_all" ON orden_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_all" ON usuarios    FOR ALL USING (true) WITH CHECK (true);

-- Realtime — permite a cocina recibir órdenes nuevas en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE ordenes;
ALTER PUBLICATION supabase_realtime ADD TABLE mesas;
ALTER PUBLICATION supabase_realtime ADD TABLE orden_items;
