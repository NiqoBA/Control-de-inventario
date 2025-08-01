# SouthGenetics - Sistema de Control de Inventario

Sistema de control de inventario desarrollado con Next.js, TypeScript, Tailwind CSS y Supabase para la empresa SouthGenetics.

## 🚀 Características

- **Autenticación completa** con Supabase Auth
- **Dashboard interactivo** con estadísticas en tiempo real
- **Gestión de productos** con CRUD completo
- **Control de categorías** para organizar productos
- **Sistema de transacciones** para entradas y salidas de stock
- **Gestión de proveedores** con información de contacto
- **Interfaz moderna** con tema de color mostaza
- **Responsive design** para todos los dispositivos

## 🛠️ Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Supabase** - Backend como servicio
- **PostgreSQL** - Base de datos

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd southgenetics-inventory
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Configurar Supabase** (ver sección de configuración)

5. **Ejecutar la aplicación**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔐 Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda la URL y las claves del proyecto

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 3. Configurar la base de datos

1. Ve al panel de Supabase de tu proyecto
2. Navega a **SQL Editor**
3. Ejecuta el script SQL que se encuentra en `database.sql`

```sql
-- Ejecutar el contenido completo del archivo database.sql
-- Este script creará todas las tablas, funciones y políticas necesarias
```

### 4. Configurar autenticación

1. En el panel de Supabase, ve a **Authentication > Settings**
2. Configura las URLs de redirección:
   - Site URL: `http://localhost:3000` (desarrollo)
   - Redirect URLs: `http://localhost:3000/auth/callback`

3. **Opcional**: Configura el proveedor de email para confirmación de cuentas

## 📊 Estructura de la Base de Datos

### Tablas principales:

- **users** - Usuarios del sistema
- **products** - Productos del inventario
- **categories** - Categorías de productos
- **suppliers** - Proveedores
- **transactions** - Transacciones de entrada/salida

### Funciones automáticas:

- Actualización automática de stock al crear transacciones
- Creación automática de usuarios al registrarse
- Actualización automática de timestamps

## 🎨 Personalización del Tema

El sistema utiliza un tema de color mostaza personalizado. Para modificar los colores:

1. Edita `src/app/globals.css`
2. Modifica las variables CSS:
   ```css
   --mustard: 218, 165, 32;
   --mustard-light: 255, 215, 0;
   --mustard-dark: 184, 134, 11;
   ```

## 📱 Funcionalidades

### Dashboard
- Estadísticas en tiempo real
- Resumen de productos
- Alertas de stock bajo
- Acciones rápidas

### Productos
- CRUD completo de productos
- Gestión de stock
- Categorización
- Información de proveedores

### Transacciones
- Registro de entradas y salidas
- Historial completo
- Razones y notas
- Actualización automática de stock

### Categorías
- Gestión de categorías
- Descripciones personalizadas
- Organización jerárquica

### Proveedores
- Información de contacto
- Gestión completa de proveedores
- Integración con productos

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Autenticación** requerida para todas las operaciones
- **Políticas de acceso** configuradas por defecto
- **Validación** de datos en frontend y backend

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Actualiza las URLs de redirección en Supabase
4. Despliega automáticamente

### Otros proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica las variables de entorno
- Confirma que las claves son correctas
- Revisa la configuración de RLS

### Error de autenticación
- Verifica las URLs de redirección en Supabase
- Confirma que el dominio está autorizado
- Revisa la configuración de email

### Problemas de base de datos
- Ejecuta el script SQL completo
- Verifica que las políticas RLS están configuradas
- Revisa los logs de Supabase

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:

- Email: soporte@southgenetics.com
- Documentación: [Link a documentación]
- Issues: [Link al repositorio de issues]

---

**Desarrollado para SouthGenetics** 🧬
