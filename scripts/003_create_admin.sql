-- IMPORTANT: This script creates the admin user manually
-- The password hash is for: gmjhdigicash$
-- After running this script, you can login with:
-- Email: admin@digicash.academy
-- Password: gmjhdigicash$

-- Note: Run this script AFTER the profile trigger is set up
-- The actual admin user should be created through the signup flow
-- This is just a reference for the admin credentials

-- To create the admin user properly:
-- 1. Sign up at /register with email: admin@digicash.academy and password: gmjhdigicash$
-- 2. Then run the following update to make them admin:

-- UPDATE public.profiles 
-- SET role = 'admin'
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'admin@digicash.academy'
-- );
