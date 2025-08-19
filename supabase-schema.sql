-- ===============================================
-- ESQUEMA DE BASE DE DATOS PARA INTERIOR DESIGN APP
-- ===============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. TABLA DE PERFILES DE USUARIO
-- ===============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
    subscription_type TEXT CHECK (subscription_type IN ('monthly', 'annual')),
    subscription_expires_at TIMESTAMPTZ,
    trial_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    credits_remaining INTEGER DEFAULT 10, -- Créditos para período de prueba
    total_images_processed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 2. TABLA DE PROYECTOS
-- ===============================================
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    property_type TEXT DEFAULT 'residential' CHECK (property_type IN ('residential', 'commercial', 'office', 'hotel', 'restaurant')),
    address TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    cover_image_url TEXT,
    total_images INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 3. TABLA DE IMÁGENES
-- ===============================================
CREATE TABLE public.images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE, -- NULL para imágenes sueltas
    original_url TEXT NOT NULL,
    processed_url TEXT,
    enhanced_url TEXT, -- Para imágenes mejoradas
    room_type TEXT NOT NULL,
    style_applied TEXT,
    processing_options JSONB, -- Almacenar las opciones de diseño
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    file_size_mb DECIMAL(10,2),
    dimensions JSONB, -- {width: 1024, height: 768}
    is_temporary BOOLEAN DEFAULT FALSE, -- TRUE para imágenes que se borrarán automáticamente
    auto_delete_at TIMESTAMPTZ, -- Fecha de borrado automático (30 días)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 4. TABLA DE RELACIÓN PROYECTO-IMÁGENES
-- ===============================================
CREATE TABLE public.project_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    image_type TEXT NOT NULL CHECK (image_type IN ('original', 'processed', 'enhanced')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, image_id)
);

-- ===============================================
-- 5. TABLA DE HISTORIAL DE FACTURACIÓN
-- ===============================================
CREATE TABLE public.billing_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT,
    stripe_payment_intent_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'eur',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    subscription_type TEXT CHECK (subscription_type IN ('monthly', 'annual')),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 5. TABLA DE USO DE CRÉDITOS
-- ===============================================
CREATE TABLE public.credit_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('design_generation', 'image_enhancement')),
    credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===============================================
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_images_user_id ON public.images(user_id);
CREATE INDEX idx_images_project_id ON public.images(project_id);
CREATE INDEX idx_images_auto_delete ON public.images(auto_delete_at) WHERE is_temporary = TRUE;
CREATE INDEX idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX idx_project_images_image_id ON public.project_images(image_id);
CREATE INDEX idx_billing_user_id ON public.billing_history(user_id);
CREATE INDEX idx_credit_usage_user_id ON public.credit_usage(user_id);

-- ===============================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ===============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para projects
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Políticas para images
CREATE POLICY "Users can view own images" ON public.images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own images" ON public.images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own images" ON public.images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own images" ON public.images FOR DELETE USING (auth.uid() = user_id);

-- Políticas para billing_history (solo lectura para usuarios)
CREATE POLICY "Users can view own billing" ON public.billing_history FOR SELECT USING (auth.uid() = user_id);

-- Políticas para project_images
CREATE POLICY "Users can view project images" ON public.project_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_images.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create project images" ON public.project_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_images.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update project images" ON public.project_images FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_images.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete project images" ON public.project_images FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_images.project_id AND projects.user_id = auth.uid())
);

-- Políticas para credit_usage (solo lectura para usuarios)
CREATE POLICY "Users can view own credit usage" ON public.credit_usage FOR SELECT USING (auth.uid() = user_id);

-- ===============================================
-- FUNCIONES Y TRIGGERS
-- ===============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON public.images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para marcar imágenes temporales para auto-borrado
CREATE OR REPLACE FUNCTION mark_temporary_images()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.project_id IS NULL THEN
        NEW.is_temporary = TRUE;
        NEW.auto_delete_at = NOW() + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para marcar imágenes como temporales
CREATE TRIGGER mark_images_temporary
    BEFORE INSERT ON public.images
    FOR EACH ROW EXECUTE FUNCTION mark_temporary_images();

-- ===============================================
-- FUNCIONES PARA LIMPIEZA AUTOMÁTICA
-- ===============================================

-- Función para limpiar imágenes expiradas (ejecutar con cron)
CREATE OR REPLACE FUNCTION cleanup_expired_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.images 
    WHERE is_temporary = TRUE 
    AND auto_delete_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- VISTAS ÚTILES
-- ===============================================

-- Vista de estadísticas por usuario
CREATE VIEW user_stats AS
SELECT 
    p.id,
    p.email,
    p.subscription_status,
    p.credits_remaining,
    p.total_images_processed,
    COUNT(DISTINCT pr.id) as total_projects,
    COUNT(DISTINCT i.id) as total_images,
    COUNT(DISTINCT CASE WHEN i.created_at > NOW() - INTERVAL '30 days' THEN i.id END) as images_last_30_days
FROM public.profiles p
LEFT JOIN public.projects pr ON p.id = pr.user_id
LEFT JOIN public.images i ON p.id = i.user_id
GROUP BY p.id, p.email, p.subscription_status, p.credits_remaining, p.total_images_processed;

-- ===============================================
-- DATOS INICIALES (OPCIONAL)
-- ===============================================

-- Insertar tipos de suscripción como constantes si necesario
-- CREATE TABLE subscription_plans...

-- ===============================================
-- STORAGE BUCKETS CONFIGURATION
-- ===============================================

-- Nota: Estas configuraciones se deben hacer desde el dashboard de Supabase o via SQL:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('user-images', 'user-images', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', false);

-- Storage policies (añadir después de crear los buckets):
-- CREATE POLICY "Users can view own images" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
