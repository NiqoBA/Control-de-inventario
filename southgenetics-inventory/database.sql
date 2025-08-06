-- SouthGenetics Inventory System Database Schema
-- Este archivo contiene la estructura completa de la base de datos

-- Habilitar RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (extendida desde auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
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

-- Tabla de transacciones
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

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignaciones de productos a empleados
CREATE TABLE IF NOT EXISTS public.product_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de stock
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON public.products(quantity);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON public.transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(name);
CREATE INDEX IF NOT EXISTS idx_product_assignments_employee_id ON public.product_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_product_assignments_product_id ON public.product_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_requests_employee_id ON public.stock_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_stock_requests_product_id ON public.stock_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_requests_status ON public.stock_requests(status);
CREATE INDEX IF NOT EXISTS idx_stock_requests_priority ON public.stock_requests(priority);
CREATE INDEX IF NOT EXISTS idx_stock_requests_requested_at ON public.stock_requests(requested_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_requests_updated_at BEFORE UPDATE ON public.stock_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar stock cuando se crea una transacción
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'in' THEN
        UPDATE public.products 
        SET quantity = quantity + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    ELSIF NEW.type = 'out' THEN
        UPDATE public.products 
        SET quantity = quantity - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar stock automáticamente
CREATE TRIGGER update_stock_on_transaction
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Función para crear usuario automáticamente cuando se registra
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
$$ language 'plpgsql';

-- Trigger para crear usuario automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Configurar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para categorías (todos los usuarios autenticados pueden ver/crear/editar)
CREATE POLICY "Authenticated users can manage categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas RLS para proveedores
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas RLS para productos
CREATE POLICY "Authenticated users can manage products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas RLS para transacciones
CREATE POLICY "Authenticated users can manage transactions" ON public.transactions
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas RLS para empleados
CREATE POLICY "Authenticated users can manage employees" ON public.employees
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas RLS para asignaciones de productos
CREATE POLICY "Authenticated users can manage product assignments" ON public.product_assignments
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas RLS para solicitudes de stock
CREATE POLICY "Authenticated users can manage stock requests" ON public.stock_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- Insertar datos de ejemplo
INSERT INTO public.categories (name, description) VALUES
    ('Reactivos', 'Reactivos de laboratorio y químicos'),
    ('Equipos', 'Equipos de laboratorio y dispositivos'),
    ('Consumibles', 'Materiales consumibles y desechables'),
    ('Software', 'Software y licencias'),
    ('Herramientas', 'Herramientas y utensilios')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.suppliers (name, email, phone) VALUES
    ('Sigma-Aldrich', 'ventas@sigmaaldrich.com', '+1-800-325-3010'),
    ('Thermo Fisher Scientific', 'info@thermofisher.com', '+1-800-766-7000'),
    ('VWR International', 'ventas@vwr.com', '+1-800-932-5000'),
    ('Fisher Scientific', 'customer.service@fishersci.com', '+1-800-766-7000'),
    ('MilliporeSigma', 'ventas@milliporesigma.com', '+1-800-645-5476')
ON CONFLICT DO NOTHING;

-- Crear vista para productos con información de categoría
CREATE OR REPLACE VIEW products_with_category AS
SELECT 
    p.*,
    c.name as category_name,
    c.description as category_description
FROM public.products p
LEFT JOIN public.categories c ON p.category = c.name;

-- Crear vista para transacciones con información del producto
CREATE OR REPLACE VIEW transactions_with_product AS
SELECT 
    t.*,
    p.name as product_name,
    p.sku as product_sku,
    u.name as created_by_name
FROM public.transactions t
LEFT JOIN public.products p ON t.product_id = p.id
LEFT JOIN public.users u ON t.created_by = u.id;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_products BIGINT,
    low_stock_count BIGINT,
    total_value DECIMAL,
    recent_transactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.products) as total_products,
        (SELECT COUNT(*) FROM public.products WHERE quantity <= min_quantity) as low_stock_count,
        (SELECT COALESCE(SUM(quantity * unit_price), 0) FROM public.products) as total_value,
        (SELECT COUNT(*) FROM public.transactions WHERE created_at >= NOW() - INTERVAL '7 days') as recent_transactions;
END;
$$ LANGUAGE plpgsql; 