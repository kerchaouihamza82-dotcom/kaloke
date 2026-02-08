# 🔐 Configuración del Administrador - Digicash Academy

## ⚠️ IMPORTANTE: El usuario admin no existe aún

El usuario administrador **NO se ha creado todavía**. Debes registrarte primero.

---

## 📝 Pasos para crear la cuenta de administrador

### Paso 1: Ir a la página de Registro

Ve a: **`/register`** (no a `/login`)

### Paso 2: Completar el formulario con estos datos exactos

```
Nombre completo: Admin Digicash (o el nombre que prefieras)
Correo electrónico: admin@digicash.academy
Contraseña: gmjhdigicash$
Confirmar contraseña: gmjhdigicash$
```

✅ Acepta los términos y condiciones

### Paso 3: Confirmar el correo electrónico

Después de registrarte, Supabase enviará un correo de confirmación a **admin@digicash.academy**.

**Opciones:**

1. **Si tienes acceso al correo:** Abre el email y haz clic en el enlace de confirmación
2. **Si NO tienes acceso al correo:** Necesitas desactivar la confirmación de email en Supabase

---

## 🔧 Desactivar confirmación de email (opcional)

Si no tienes acceso al correo admin@digicash.academy:

1. Ve al panel de Supabase
2. Navega a **Authentication > Settings**
3. Desactiva **"Enable email confirmations"**
4. Guarda los cambios
5. Vuelve a registrarte

---

## ✅ Verificar que eres Admin

Una vez registrado y confirmado:

1. Inicia sesión en `/login` con:
   - Email: `admin@digicash.academy`
   - Contraseña: `gmjhdigicash$`

2. Verás un **badge verde "Admin"** en el header
3. Tendrás acceso al **Panel de Administración** en el menú de usuario

---

## 🎯 Características de Admin

Como administrador tendrás:

- ✅ Badge de "Admin" visible en el header
- ✅ Acceso al panel de administración (`/admin`)
- ✅ Permisos para editar cursos y contenido
- ✅ Gestión de usuarios
- ✅ Acceso a todas las secciones

---

## ❓ Problemas comunes

### "Correo o contraseña incorrectos"
- ✅ El usuario no existe → **Ve a /register primero**

### "Por favor confirma tu correo electrónico"
- ✅ Revisa tu bandeja de entrada
- ✅ O desactiva la confirmación en Supabase

### No veo el badge de Admin
- ✅ Cierra sesión y vuelve a iniciar
- ✅ Verifica que el trigger se ejecutó correctamente

---

## 🔍 Verificar en la base de datos

Para verificar que el usuario se creó correctamente, ejecuta en Supabase SQL Editor:

```sql
SELECT 
  auth.users.email, 
  profiles.role, 
  profiles.full_name
FROM auth.users 
LEFT JOIN public.profiles ON auth.users.id = profiles.id
WHERE auth.users.email = 'admin@digicash.academy';
```

Deberías ver:
- email: `admin@digicash.academy`
- role: `admin`
- full_name: El nombre que pusiste al registrarte
