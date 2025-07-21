# 🏗️ Arquitectura de Bases de Datos - Ecommerce

## 📊 **Estrategia de Bases de Datos Híbrida**

### **PostgreSQL (Neon) - Datos Estructurados**
Base de datos principal para datos transaccionales y relacionales.

#### **Tablas Principales:**
-  **users** - Información de usuarios y autenticación
-  **categories** - Categorías de productos
-  **products** - Catálogo de productos
-  **orders** - Órdenes de compra
-  **order_items** - Detalles de órdenes
-  **addresses** - Direcciones de envío
-  **payments** - Métodos de pago
-  **inventory** - Control de inventario

### **MongoDB Atlas - Datos Flexibles y Analytics**
Base de datos para datos no estructurados, analytics y logs.

#### **Colecciones:**
-  **user_sessions** - Sesiones de usuario activas
-  **product_analytics** - Métricas de productos (vistas, clicks)
-  **search_logs** - Historial de búsquedas
-  **user_behavior** - Comportamiento de navegación
-  **cart_sessions** - Carritos abandonados
-  **reviews** - Reseñas y calificaciones de productos
-  **notifications** - Sistema de notificaciones
-  **audit_logs** - Logs de auditoría del sistema

## **Complementariedad**

### **PostgreSQL** → Datos críticos del negocio
- Transacciones financieras
- Inventario
- Datos de usuarios
- Órdenes y pagos

### **MongoDB** → Analytics y datos variables
- Métricas y reportes
- Comportamiento del usuario
- Contenido generado por usuarios
- Logs y auditoría

