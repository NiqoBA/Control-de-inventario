# Manual de Usuario - Sistema de Inventario SouthGenetics

## 📋 Índice
1. [Acceso al Sistema](#acceso-al-sistema)
2. [Flujo de Trabajo Principal](#flujo-de-trabajo-principal)
3. [Gestión de Proveedores](#gestión-de-proveedores)
4. [Gestión de Productos](#gestión-de-productos)
5. [Gestión de Empleados](#gestión-de-empleados)
6. [Asignación de Productos](#asignación-de-productos)
7. [Transacciones de Inventario](#transacciones-de-inventario)
8. [Solicitudes de Stock](#solicitudes-de-stock)
9. [Dashboard y Reportes](#dashboard-y-reportes)
10. [Solución de Problemas](#solución-de-problemas)

---

## 🔐 Acceso al Sistema

### Registro de Usuario
1. Ve a la página de registro
2. Completa tu información:
   - Nombre completo
   - Email
   - Contraseña
3. Confirma tu email (revisa tu bandeja de entrada)
4. Inicia sesión con tus credenciales

### Inicio de Sesión
1. Ve a la página de login
2. Ingresa tu email y contraseña
3. Haz clic en "Iniciar Sesión"

---

## 🔄 Flujo de Trabajo Principal

**IMPORTANTE: Sigue este orden para un funcionamiento correcto del sistema:**

1. **Crear Proveedor** → 2. **Crear Producto** → 3. **Registrar Entrada/Salida** → 4. **Crear Empleado** → 5. **Asignar Producto**

---

## 🏢 Gestión de Proveedores

### Crear un Nuevo Proveedor
1. Ve al menú **Proveedores**
2. Haz clic en **"Agregar Proveedor"**
3. Completa la información:
   - **Nombre del proveedor** (obligatorio)
   - **Email** (opcional)
   - **Teléfono** (opcional)
   - **Dirección** (opcional)
4. Haz clic en **"Guardar"**

### Editar Proveedor
1. En la lista de proveedores, haz clic en el botón **"Editar"**
2. Modifica la información necesaria
3. Haz clic en **"Actualizar"**

### Eliminar Proveedor
1. En la lista de proveedores, haz clic en el botón **"Eliminar"**
2. Confirma la acción

---

## 📦 Gestión de Productos

### Crear un Nuevo Producto
1. Ve al menú **Productos**
2. Haz clic en **"Agregar Producto"**
3. Completa la información:
   - **Nombre del producto** (obligatorio)
   - **Descripción** (opcional)
   - **SKU** (código único, obligatorio)
   - **Categoría** (selecciona de la lista existente)
   - **Cantidad inicial** (número, obligatorio)
   - **Cantidad mínima** (para alertas de stock bajo)
   - **Precio unitario** (obligatorio)
   - **Moneda** (USD o UYU)
   - **Proveedor** (selecciona de la lista existente)
   - **Ubicación** (opcional)
4. Haz clic en **"Guardar"**

### Editar Producto
1. En la lista de productos, haz clic en el botón **"Editar"**
2. Modifica la información necesaria
3. Haz clic en **"Actualizar"**

### Eliminar Producto
1. En la lista de productos, haz clic en el botón **"Eliminar"**
2. Confirma la acción

---

## 👥 Gestión de Empleados

### Crear un Nuevo Empleado
1. Ve al menú **Empleados**
2. Haz clic en **"Agregar Empleado"**
3. Completa la información:
   - **Nombre** (obligatorio)
   - **Apellido** (obligatorio)
4. Haz clic en **"Guardar"**

### Editar Empleado
1. En la lista de empleados, haz clic en el botón **"Editar"**
2. Modifica la información necesaria
3. Haz clic en **"Actualizar"**

### Eliminar Empleado
1. En la lista de empleados, haz clic en el botón **"Eliminar"**
2. Confirma la acción

---

## 🔗 Asignación de Productos

### Asignar Producto a Empleado
1. Ve al menú **Asignaciones** (o desde la página de empleados)
2. Haz clic en **"Nueva Asignación"**
3. Completa la información:
   - **Empleado** (selecciona de la lista)
   - **ID del Producto** (ingresa el ID exacto del producto)
   - **Cantidad** (número mayor a 0)
4. Haz clic en **"Asignar"**

### Ver Productos Asignados
1. Ve al menú **Empleados**
2. Haz clic en el nombre del empleado
3. Verás una lista de todos los productos asignados con:
   - **ID del producto**
   - **Nombre del producto**
   - **Cantidad asignada**
   - **Fecha de asignación**

### Desasignar Producto
1. En la lista de productos asignados del empleado
2. Haz clic en **"Desasignar"**
3. Confirma la acción

---

## 📊 Transacciones de Inventario

### Registrar Entrada de Productos
1. Ve al menú **Transacciones**
2. Haz clic en **"Nueva Transacción"**
3. Selecciona **"Entrada"** como tipo
4. Completa la información:
   - **Producto** (selecciona de la lista)
   - **Cantidad** (número mayor a 0)
   - **Motivo** (ej: "Compra", "Devolución", "Ajuste de inventario")
   - **Notas** (opcional)
5. Haz clic en **"Registrar"**

### Registrar Salida de Productos
1. Ve al menú **Transacciones**
2. Haz clic en **"Nueva Transacción"**
3. Selecciona **"Salida"** como tipo
4. Completa la información:
   - **Producto** (selecciona de la lista)
   - **Cantidad** (número mayor a 0)
   - **Motivo** (ej: "Uso", "Venta", "Pérdida", "Asignación a empleado")
   - **Notas** (opcional)
5. Haz clic en **"Registrar"**

### Ver Historial de Transacciones
1. Ve al menú **Transacciones**
2. Verás una lista cronológica de todas las transacciones
3. Puedes filtrar por:
   - Tipo (Entrada/Salida)
   - Producto
   - Fecha

---

## 📝 Solicitudes de Stock

### Crear Solicitud de Stock
1. Ve al menú **Solicitudes de Stock**
2. Haz clic en **"Nueva Solicitud"**
3. Completa la información:
   - **Empleado** (selecciona de la lista)
   - **Producto** (nombre del producto o selecciona de la lista)
   - **Cantidad solicitada** (número mayor a 0)
   - **Prioridad** (Baja, Media, Alta, Urgente)
   - **Motivo** (obligatorio)
   - **Notas** (opcional)
4. Haz clic en **"Enviar Solicitud"**

### Gestionar Solicitudes
1. Ve al menú **Solicitudes de Stock**
2. Para cada solicitud puedes:
   - **Aprobar**: Cambia el estado a "Aprobada"
   - **Rechazar**: Cambia el estado a "Rechazada"
   - **Completar**: Cambia el estado a "Completada" después de procesar

---

## 📈 Dashboard y Reportes

### Vista General
El dashboard muestra:
- **Total de productos** en inventario
- **Productos con stock bajo** (cantidad < cantidad mínima)
- **Transacciones recientes**
- **Solicitudes pendientes**

### Filtros y Búsquedas
- Usa la barra de búsqueda para encontrar productos rápidamente
- Filtra por categoría, proveedor o ubicación
- Ordena por nombre, cantidad o fecha

---

## 🚨 Solución de Problemas

### Error: "Producto no encontrado"
- Verifica que el ID del producto sea correcto
- Asegúrate de que el producto exista en el sistema
- Revisa que no haya espacios adicionales

### Error: "Cantidad insuficiente"
- Verifica el stock disponible del producto
- Revisa las transacciones recientes
- Contacta al administrador si es necesario

### Error: "SKU duplicado"
- Cada producto debe tener un SKU único
- Verifica que no exista otro producto con el mismo código

### Error: "Usuario no autorizado"
- Verifica que hayas iniciado sesión
- Contacta al administrador si necesitas permisos adicionales

---

## 📞 Contacto y Soporte

Si encuentras algún problema o tienes preguntas:
- Revisa este manual primero
- Contacta al administrador del sistema
- Documenta el error para facilitar la solución

---

## 🔄 Mejores Prácticas

1. **Siempre verifica** la información antes de guardar
2. **Usa descripciones claras** para productos y motivos
3. **Revisa regularmente** el stock de productos críticos
4. **Mantén actualizada** la información de proveedores
5. **Documenta** cualquier cambio importante en las notas

---

*Última actualización: [Fecha actual]*
*Versión del sistema: 1.0*
