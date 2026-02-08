# 🔐 Crear Usuario Administrador

## Método 1: Página de Setup Automático (RECOMENDADO)

1. **Ve a la página de setup:**
   ```
   /setup-admin
   ```

2. **Haz clic en el botón "Crear Usuario Administrador"**
   - El sistema creará automáticamente el usuario
   - Email: `admin@digicash.academy`
   - Contraseña: `gmjhdigicash$`
   - Rol: `admin` (asignado automáticamente)

3. **Inicia sesión**
   - Serás redirigido a `/login`
   - Usa las credenciales creadas

---

## Método 2: Registro Manual

1. **Ve a la página de registro:**
   ```
   /register
   ```

2. **Completa el formulario con estos datos exactos:**
   - Email: `admin@digicash.academy`
   - Contraseña: `gmjhdigicash$`
   - Nombre: El que prefieras

3. **El sistema detectará tu email automáticamente y te asignará el rol de admin**

4. **Inicia sesión en `/login`**

---

## ✅ Verificación

Una vez iniciada la sesión, verás:
- 🛡️ Badge de "Admin" en el header
- 🔧 Opción "Panel de administración" en el menú de usuario
- ✏️ Permisos para editar todo el contenido

---

## 🔒 Seguridad

- Solo el email `admin@digicash.academy` recibe el rol de admin automáticamente
- Todos los demás usuarios se registran como "student" por defecto
- Las contraseñas están encriptadas en Supabase
- Row Level Security (RLS) protege los datos

---

## 🚨 Problemas Comunes

### "Usuario ya existe"
- El admin ya fue creado
- Ve directamente a `/login` e inicia sesión

### "Email not confirmed"
- Supabase requiere confirmación de email
- Desactiva la confirmación en Supabase Dashboard > Authentication > Email Auth Settings
- O confirma el email desde tu bandeja de entrada

### "Invalid login credentials"
- El usuario aún no existe
- Usa el método 1 o 2 para crearlo primero
