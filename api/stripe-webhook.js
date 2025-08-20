const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleSubscriptionChange(subscription) {
  const customerId = subscription.customer
  const subscriptionId = subscription.id
  const status = subscription.status
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
  const cancelAtPeriodEnd = subscription.cancel_at_period_end

  // Obtener el precio para determinar el plan
  const priceId = subscription.items.data[0]?.price.id
  let planType = 'free'
  
  if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
    planType = 'monthly'
  } else if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
    planType = 'yearly'
  }

  // Obtener el usuario por customer ID
  const { data: userSub } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userSub) {
    await supabase
      .from('user_subscriptions')
      .update({
        plan: planType,
        subscription_id: subscriptionId,
        status: status,
        current_period_end: currentPeriodEnd.toISOString(),
        cancel_at_period_end: cancelAtPeriodEnd,
        max_usage: planType === 'free' ? 1 : -1, // -1 = ilimitado
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId)
  }
}

async function handleSubscriptionCanceled(subscription) {
  const customerId = subscription.customer

  await supabase
    .from('user_subscriptions')
    .update({
      plan: 'free',
      subscription_id: null,
      status: 'canceled',
      current_period_end: null,
      cancel_at_period_end: false,
      max_usage: 1,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer
  const subscriptionId = invoice.subscription

  await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer

  await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
}
