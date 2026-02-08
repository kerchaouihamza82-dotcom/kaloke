-- Script para insertar datos de ejemplo y configurar usuarios admin
-- Asegúrate de reemplazar 'TU_USER_ID' con tu ID real de usuario

-- Primero, actualiza tu perfil para ser admin
-- Reemplaza el ID con tu propio user ID de Supabase Auth
-- Puedes obtenerlo ejecutando: SELECT id FROM auth.users WHERE email = 'tu-email@example.com';

-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con tu ID real
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'TU_USER_ID_AQUI';

-- Insertar temas de ejemplo (solo si ejecutas como admin o temporalmente desactivas RLS)
INSERT INTO public.topics (name, slug, description, icon, color, order_index) VALUES
  ('Bitcoin', 'bitcoin', 'Aprende todo sobre Bitcoin, blockchain y minería', '₿', 'bg-orange-500/10 text-orange-500', 0),
  ('Trading', 'trading', 'Estrategias de trading y análisis técnico', '📈', 'bg-green-500/10 text-green-500', 1),
  ('DeFi', 'defi', 'Finanzas descentralizadas y protocolos DeFi', '🏦', 'bg-blue-500/10 text-blue-500', 2),
  ('NFTs', 'nfts', 'Tokens no fungibles y coleccionables digitales', '🎨', 'bg-purple-500/10 text-purple-500', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insertar cursos de ejemplo para Bitcoin
INSERT INTO public.courses (topic_id, name, slug, description, level, order_index)
SELECT 
  t.id,
  'Introducción a Bitcoin',
  'introduccion-bitcoin',
  'Fundamentos de Bitcoin y tecnología blockchain',
  'beginner',
  0
FROM public.topics t
WHERE t.slug = 'bitcoin'
ON CONFLICT (topic_id, slug) DO NOTHING;

INSERT INTO public.courses (topic_id, name, slug, description, level, order_index)
SELECT 
  t.id,
  'Minería de Bitcoin',
  'mineria-bitcoin',
  'Aprende sobre la minería y el proceso de validación',
  'intermediate',
  1
FROM public.topics t
WHERE t.slug = 'bitcoin'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- Insertar módulos de ejemplo
INSERT INTO public.modules (course_id, name, slug, description, order_index)
SELECT 
  c.id,
  '¿Qué es Bitcoin?',
  'que-es-bitcoin',
  'Introducción y conceptos básicos',
  0
FROM public.courses c
WHERE c.slug = 'introduccion-bitcoin'
ON CONFLICT (course_id, slug) DO NOTHING;

INSERT INTO public.modules (course_id, name, slug, description, order_index)
SELECT 
  c.id,
  'Blockchain explicado',
  'blockchain-explicado',
  'Cómo funciona la tecnología blockchain',
  1
FROM public.courses c
WHERE c.slug = 'introduccion-bitcoin'
ON CONFLICT (course_id, slug) DO NOTHING;

-- Insertar lecciones de ejemplo
INSERT INTO public.lessons (module_id, title, slug, description, content_type, content_url, duration_minutes, order_index)
SELECT 
  m.id,
  'Historia de Bitcoin',
  'historia-bitcoin',
  'Conoce el origen y evolución de Bitcoin',
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  15,
  0
FROM public.modules m
WHERE m.slug = 'que-es-bitcoin'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO public.lessons (module_id, title, slug, description, content_type, content_text, order_index)
SELECT 
  m.id,
  'Conceptos clave de Bitcoin',
  'conceptos-clave',
  'Términos y definiciones importantes',
  'text',
  'Bitcoin es una criptomoneda descentralizada que funciona sin un banco central o administrador único. Las transacciones se verifican por los nodos de la red mediante criptografía y se registran en un libro de contabilidad público distribuido llamado blockchain.',
  1
FROM public.modules m
WHERE m.slug = 'que-es-bitcoin'
ON CONFLICT (module_id, slug) DO NOTHING;
