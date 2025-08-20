-- Tabla para manejar suscripciones de usuarios
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  subscription_id TEXT,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT 1, -- -1 para ilimitado
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices únicos
  UNIQUE(user_id),
  UNIQUE(stripe_customer_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON user_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Función para actualizar automatically updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propia información de suscripción
CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden insertar su propia información (para nuevos registros)
CREATE POLICY "Users can insert own subscription" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su propia información
CREATE POLICY "Users can update own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Función para obtener el estado de suscripción de un usuario
CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id UUID)
RETURNS TABLE (
  is_active BOOLEAN,
  plan TEXT,
  usage_count INTEGER,
  max_usage INTEGER,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN us.status = 'active' AND 
           (us.plan = 'monthly' OR us.plan = 'yearly') AND
           (us.current_period_end IS NULL OR us.current_period_end > NOW())
      THEN TRUE
      ELSE FALSE
    END as is_active,
    us.plan,
    COALESCE(us.usage_count, 0) as usage_count,
    COALESCE(us.max_usage, CASE WHEN us.plan = 'free' THEN 1 ELSE -1 END) as max_usage,
    us.current_period_end,
    COALESCE(us.cancel_at_period_end, FALSE) as cancel_at_period_end
  FROM user_subscriptions us
  WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario puede usar una función
CREATE OR REPLACE FUNCTION can_user_use_feature(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_info RECORD;
BEGIN
  SELECT * INTO subscription_info
  FROM get_user_subscription_status(p_user_id);
  
  -- Si tiene suscripción activa, puede usar ilimitadamente
  IF subscription_info.is_active AND (subscription_info.plan = 'monthly' OR subscription_info.plan = 'yearly') THEN
    RETURN TRUE;
  END IF;
  
  -- Si es plan gratuito, verificar límite de uso
  RETURN subscription_info.usage_count < subscription_info.max_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar el contador de uso
CREATE OR REPLACE FUNCTION increment_usage_count(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  usage_count INTEGER,
  max_usage INTEGER,
  limit_reached BOOLEAN
) AS $$
DECLARE
  current_subscription RECORD;
  new_usage_count INTEGER;
BEGIN
  -- Obtener información actual
  SELECT * INTO current_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Si no existe, crear registro por defecto
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, plan, usage_count, max_usage)
    VALUES (p_user_id, 'free', 1, 1);
    
    RETURN QUERY SELECT TRUE, 1, 1, TRUE;
    RETURN;
  END IF;
  
  -- Si es usuario Pro activo, no incrementar (uso ilimitado)
  IF current_subscription.status = 'active' AND 
     (current_subscription.plan = 'monthly' OR current_subscription.plan = 'yearly') THEN
    RETURN QUERY SELECT TRUE, current_subscription.usage_count, -1, FALSE;
    RETURN;
  END IF;
  
  -- Verificar límite para usuarios gratuitos
  IF current_subscription.usage_count >= current_subscription.max_usage THEN
    RETURN QUERY SELECT FALSE, current_subscription.usage_count, current_subscription.max_usage, TRUE;
    RETURN;
  END IF;
  
  -- Incrementar contador
  new_usage_count := current_subscription.usage_count + 1;
  
  UPDATE user_subscriptions
  SET usage_count = new_usage_count
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT TRUE, new_usage_count, current_subscription.max_usage, 
                     new_usage_count >= current_subscription.max_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
