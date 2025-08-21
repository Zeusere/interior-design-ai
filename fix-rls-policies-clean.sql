-- ===============================================
-- LIMPIEZA Y CORRECCIÓN DE POLÍTICAS RLS
-- ===============================================

-- 1. Habilitar RLS en la tabla images
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas duplicadas existentes
DROP POLICY IF EXISTS "Users can create own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete their own images" ON public.images;
DROP POLICY IF EXISTS "Users can insert their own images" ON public.images;
DROP POLICY IF EXISTS "Users can update own images" ON public.images;
DROP POLICY IF EXISTS "Users can update their own images" ON public.images;
DROP POLICY IF EXISTS "Users can view own images" ON public.images;
DROP POLICY IF EXISTS "Users can view their own images" ON public.images;

-- 3. Crear políticas limpias y correctas
CREATE POLICY "Users can insert their own images" ON public.images 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own images" ON public.images 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own images" ON public.images 
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images" ON public.images 
FOR DELETE USING (auth.uid() = user_id);

-- 4. Verificar que las políticas estén activas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'images';

-- 5. Verificar que RLS esté habilitado
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'images';
