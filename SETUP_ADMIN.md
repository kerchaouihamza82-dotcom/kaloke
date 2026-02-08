# Configuración del Sistema de Administrador

## Credenciales de Administrador

- **Usuario:** admin@digicash.academy
- **Contraseña:** gmjhdigicash$

## Pasos de Configuración

### 1. Ejecutar el Script SQL en Supabase

Copia y ejecuta el siguiente script en el **SQL Editor** de tu proyecto Supabase:

```sql
-- Create profiles table with role support
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
create policy "profiles_delete_admin" on public.profiles for delete using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Function to automatically create profile and assign role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case 
      when new.email = 'admin@digicash.academy' then 'admin'
      else 'student'
    end
  );
  return new;
end;
$$;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 2. Crear el Usuario Administrador

1. Ve a la página de registro: `/register`
2. Regístrate con:
   - **Email:** admin@digicash.academy
   - **Contraseña:** gmjhdigicash$
   - **Nombre:** Administrador
3. Confirma el email (revisa tu bandeja de entrada)
4. Una vez confirmado, el trigger asignará automáticamente el rol de "admin"

### 3. Verificar el Rol de Admin

Después de registrarte y confirmar el email, puedes verificar que tienes rol de admin ejecutando esta consulta en Supabase:

```sql
select * from public.profiles where email = 'admin@digicash.academy';
```

Deberías ver `role = 'admin'` en el resultado.

## Funcionalidades de Admin

Una vez configurado, el administrador tendrá acceso a:

- **Badge de Admin** en el header (icono de escudo)
- **Panel de Administración** en `/admin`
- **Opciones adicionales** en el menú de usuario
- **Permisos especiales** para editar contenido y usuarios

## Solución de Problemas

### El rol no se asigna como admin

Si después de registrarte el rol sigue siendo "student", actualízalo manualmente:

```sql
update public.profiles 
set role = 'admin' 
where email = 'admin@digicash.academy';
```

### No puedo acceder al panel de admin

1. Verifica que estás logueado con admin@digicash.academy
2. Asegúrate de haber confirmado tu email
3. Verifica que tu perfil tiene `role = 'admin'` en la base de datos
4. Cierra sesión y vuelve a iniciar sesión

## Seguridad

- Las contraseñas se almacenan de forma segura usando Supabase Auth
- Las políticas RLS protegen los datos sensibles
- Solo el email admin@digicash.academy puede tener rol de admin automáticamente
- Los administradores pueden asignar roles a otros usuarios desde el panel de admin
