import { Hono } from 'hono'
import Stripe from 'stripe'
import { Document } from 'mongodb'
import { getCollection } from '../lib/db'
import { success, error } from '../lib/response'
import { authMiddleware } from '../middleware/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

export const COIN_PACKS = [
  { id: 'coins_100', coins: 100, price: 100, label: '100 Monedas', description: 'Paquete pequeño de monedas' },
  { id: 'coins_500', coins: 500, price: 400, label: '500 Monedas', description: 'Paquete estándar (ahorra 20%)' },
  { id: 'coins_1200', coins: 1200, price: 900, label: '1200 Monedas', description: 'Paquete grande (ahorra 25%)' },
  { id: 'coins_3000', coins: 3000, price: 2000, label: '3000 Monedas', description: 'Paquete premium (ahorra 33%)' },
]

const router = new Hono()

router.get('/packs', (c) => {
  return c.json(success(COIN_PACKS.map(p => ({
    id: p.id,
    coins: p.coins,
    price: p.price,
    label: p.label,
    description: p.description,
  }))))
})

router.post('/create-checkout', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const { packId } = body

    if (!packId) {
      return c.json(error('INVALID_REQUEST', 'packId is required'), 400)
    }

    const pack = COIN_PACKS.find(p => p.id === packId)
    if (!pack) {
      return c.json(error('INVALID_REQUEST', 'Invalid pack ID'), 400)
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pack.label,
              description: pack.description,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        packId: pack.id,
        coins: pack.coins.toString(),
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/marketplace?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/marketplace?payment=cancelled`,
    })

    return c.json(success({ url: session.url }))
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return c.json(error('CHECKOUT_FAILED', err.message || 'Failed to create checkout session'), 500)
  }
})

router.post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return c.json(error('WEBHOOK_FAILED', 'Missing signature or webhook secret'), 400)
  }

  try {
    const body = await c.req.text()
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const coins = parseInt(session.metadata?.coins || '0')

      if (userId && coins > 0) {
        const users = getCollection<Document>('users')
        await users.updateOne(
          { clerkId: userId },
          { $inc: { coins } }
        )
        console.log(`Credited ${coins} coins to user ${userId}`)
      }
    }

    return c.json(success({ message: 'Webhook processed' }))
  } catch (err: any) {
    console.error('Stripe webhook error:', err)
    return c.json(error('WEBHOOK_FAILED', err.message || 'Webhook verification failed'), 400)
  }
})

export default router