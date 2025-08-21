-- ===============================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA TABLA IMAGES
-- ===============================================

-- 1. Habilitar RLS en la tabla images (si no está habilitado)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "Users can view their own images" ON public.images;
DROP POLICY IF EXISTS "Users can insert their own images" ON public.images;
DROP POLICY IF EXISTS "Users can update their own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete their own images" ON public.images;

-- 3. Crear políticas correctas para la tabla images
-- Política para INSERT: usuarios autenticados pueden insertar sus propias imágenes
CREATE POLICY "Users can insert their own images" ON public.images
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Política para SELECT: usuarios pueden ver sus propias imágenes
CREATE POLICY "Users can view their own images" ON public.images
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política para UPDATE: usuarios pueden actualizar sus propias imágenes
CREATE POLICY "Users can update their own images" ON public.images
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para DELETE: usuarios pueden eliminar sus propias imágenes
CREATE POLICY "Users can delete their own images" ON public.images
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. Verificar que las políticas están activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'images';
