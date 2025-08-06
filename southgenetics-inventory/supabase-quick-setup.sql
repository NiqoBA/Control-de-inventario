-- Script de configuración rápida para Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de proveedores
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    min_quantity INTEGER DEFAULT 0 CHECK (min_quantity >= 0),
    unit_price INTEGER DEFAULT 0 CHECK (unit_price >= 0),
    unit_currency TEXT DEFAULT 'USD' CHECK (unit_currency IN ('USD', 'UYU')),
    supplier TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 6. Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 7. Crear tabla de empleados
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Crear tabla de asignaciones de productos a empleados
CREATE TABLE IF NOT EXISTS public.product_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Crear tabla de solicitudes de stock
CREATE TABLE IF NOT EXISTS public.stock_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    priority TEXT NOT NULL CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada', 'completada')),
    reason TEXT NOT NULL,
    notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Crear trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_requests ENABLE ROW LEVEL SECURITY;

-- 13. Crear políticas RLS básicas
-- Políticas para usuarios
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para categorías
CREATE POLICY "Authenticated users can manage categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para proveedores
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para productos
CREATE POLICY "Authenticated users can manage products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para transacciones
CREATE POLICY "Authenticated users can manage transactions" ON public.transactions
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para empleados
CREATE POLICY "Authenticated users can manage employees" ON public.employees
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para asignaciones de productos
CREATE POLICY "Authenticated users can manage product assignments" ON public.product_assignments
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para solicitudes de stock
CREATE POLICY "Authenticated users can manage stock requests" ON public.stock_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- 14. Insertar datos de ejemplo
INSERT INTO public.categories (name, description) VALUES
('Reactivos', 'Reactivos de laboratorio'),
('Equipos', 'Equipos y dispositivos'),
('Consumibles', 'Materiales consumibles'),
('Herramientas', 'Herramientas de laboratorio')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.suppliers (name, email, phone) VALUES
('BioSupply Co.', 'contact@biosupply.com', '+1-555-0123'),
('LabEquip Inc.', 'sales@labequip.com', '+1-555-0456'),
('ChemCorp Ltd.', 'info@chemcorp.com', '+1-555-0789')
ON CONFLICT DO NOTHING;

-- 12. Dar permisos necesarios
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- Mensaje de confirmación
SELECT 'Configuración completada exitosamente!' as status; 