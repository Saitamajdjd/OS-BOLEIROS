-- Criar tabela para galeria da home
CREATE TABLE IF NOT EXISTS public.galeria_home (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  imagem_url TEXT NOT NULL,
  destaque BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.galeria_home ENABLE ROW LEVEL SECURITY;

-- Policy para permitir leitura pública
CREATE POLICY "Permitir leitura pública da galeria"
ON public.galeria_home FOR SELECT
USING (true);

-- Policy para permitir insert/update/delete apenas para authenticated (admin)
CREATE POLICY "Permitir gestão apenas para admin"
ON public.galeria_home FOR ALL
USING (
  auth.role() = 'authenticated'
);