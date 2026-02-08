-- Insert sample courses
insert into public.courses (title, description, level, duration_hours) values
  ('Fundamentos de Bitcoin', 'Aprende los conceptos básicos de Bitcoin y la tecnología blockchain', 'beginner', 8),
  ('Trading Avanzado', 'Estrategias avanzadas de trading en criptomonedas', 'advanced', 12),
  ('DeFi Masterclass', 'Domina las finanzas descentralizadas', 'intermediate', 10),
  ('Ethereum para Desarrolladores', 'Desarrollo de Smart Contracts en Ethereum', 'advanced', 15),
  ('Análisis Técnico', 'Aprende a leer gráficos y patrones de trading', 'intermediate', 6),
  ('Seguridad en Cripto', 'Protege tus activos digitales', 'beginner', 4)
on conflict do nothing;
