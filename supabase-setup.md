# Configuración de Supabase para SouthGenetics

## Paso 1: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## Paso 2: Ejecutar el Esquema SQL

1. Ve a tu proyecto de Supabase Dashboard
2. Ve a **SQL Editor**
3. Copia y pega todo el contenido del archivo `database.sql`
4. Ejecuta el script

## Paso 3: Verificar la Configuración

### Verificar que las tablas se crearon:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Verificar que el trigger existe:
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Verificar las políticas RLS:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Paso 4: Configurar Autenticación

1. Ve a **Authentication > Settings**
2. Asegúrate de que **Enable email confirmations** esté habilitado
3. Configura tu **Site URL** (ej: http://localhost:3000)
4. Configura **Redirect URLs** para incluir:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

## Paso 5: Probar el Registro

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000/register`
3. Intenta crear una cuenta
4. Verifica que recibas el email de confirmación

## Solución de Problemas

### Error: "database error saving new user"

Si sigues viendo este error:

1. **Verifica que el trigger se ejecutó correctamente:**
```sql
-- Verificar que la función existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Verificar que el trigger existe
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

2. **Si el trigger no existe, ejecuta manualmente:**
```sql
-- Crear la función para manejar nuevos usuarios
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

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. **Verificar permisos:**
```sql
-- Dar permisos a la función
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
```

### Error: "RLS policy violation"

Si ves errores de políticas RLS:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can manage categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage transactions" ON public.transactions
    FOR ALL USING (auth.role() = 'authenticated');
```

## Verificación Final

Después de completar todos los pasos, deberías poder:

1. ✅ Registrarte sin errores
2. ✅ Recibir email de confirmación
3. ✅ Iniciar sesión después de confirmar
4. ✅ Acceder al dashboard
5. ✅ Ver y gestionar productos, categorías, etc. 