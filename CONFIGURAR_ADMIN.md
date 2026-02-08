# Configuración del Usuario Administrador

## Credenciales del Administrador

- **Email:** admin@digicash.academy
- **Contraseña:** gmjhdigicash$

## Pasos para Crear el Usuario Administrador

### Opción 1: Registro Manual (Recomendado)

1. Ve a la página de registro: `/register`
2. Completa el formulario con:
   - Nombre: Admin Digicash
   - Email: **admin@digicash.academy**
   - Contraseña: **gmjhdigicash$**
   - Confirmar contraseña: **gmjhdigicash$**
3. Acepta los términos y condiciones
4. Haz clic en "Crear Cuenta"
5. Confirma tu correo electrónico (revisa la bandeja de entrada)
6. Una vez confirmado, el sistema automáticamente asignará el rol de "admin"

### Opción 2: SQL Directo (Solo si ya ejecutaste los scripts)

Si ya ejecutaste el script `001_create_profiles.sql` en tu base de datos de Supabase:

1. Ve al dashboard de Supabase
2. En el menú lateral, selecciona "Authentication" > "Users"
3. Haz clic en "Add user" > "Create new user"
4. Ingresa:
   - Email: admin@digicash.academy
   - Contraseña: gmjhdigicash$
5. Marca "Auto Confirm User" para que no necesite confirmación por email
6. El trigger automáticamente creará el perfil con rol "admin"

### Opción 3: Desde SQL Editor

Si prefieres usar SQL directamente:

```sql
-- Crear el usuario admin (esto debe hacerse en el dashboard de Supabase Auth)
-- Luego de crear el usuario en Auth, ejecuta esto para verificar el perfil:

SELECT * FROM public.profiles WHERE email = 'admin@digicash.academy';

-- Si el perfil no se creó automáticamente, puedes crearlo manualmente:
-- Primero obtén el ID del usuario:
SELECT id FROM auth.users WHERE email = 'admin@digicash.academy';

-- Luego crea el perfil manualmente (reemplaza USER_ID_AQUI):
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('USER_ID_AQUI', 'admin@digicash.academy', 'Admin Digicash', 'admin');
```

## Verificación

Una vez creado el usuario administrador:

1. Inicia sesión con las credenciales
2. Deberías ver un badge "Admin" en la esquina superior derecha del header
3. En el menú de perfil, deberías ver la opción "Panel de administración"
4. Puedes acceder a `/admin` directamente

## Funcionalidades del Administrador

El usuario admin tiene acceso a:

- ✅ Panel de administración (`/admin`)
- ✅ Gestión de usuarios
- ✅ Gestión de cursos
- ✅ Gestión de contenido
- ✅ Estadísticas y reportes
- ✅ Configuración de la plataforma

## Solución de Problemas

### "Invalid login credentials"

Si recibes este error al intentar iniciar sesión:

1. Verifica que el usuario esté creado en Supabase Auth
2. Verifica que el email esté confirmado
3. Asegúrate de escribir correctamente las credenciales
4. Si creaste el usuario manualmente, confirma el email desde el dashboard de Supabase

### El rol de admin no se asigna

1. Verifica que ejecutaste el script `001_create_profiles.sql`
2. Verifica que el trigger `on_auth_user_created` existe
3. Si el usuario ya existía antes del trigger, actualiza manualmente:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@digicash.academy';
```

## Seguridad

⚠️ **IMPORTANTE:** 

- Cambia la contraseña después del primer inicio de sesión
- No compartas estas credenciales
- Usa un administrador de contraseñas
- Considera habilitar autenticación de dos factores (2FA)
