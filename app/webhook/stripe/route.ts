import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { stripe } from '@/utils/stripe/api'
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!signature || !webhookSecret) {
        return new Response('Missing Stripe signature or STRIPE_WEBHOOK_SECRET', { status: 400 })
    }

    let event
    try {
        // Only trust events that Stripe signed with this endpoint's secret
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
        return new Response(`Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`, {
            status: 400,
        })
    }

    try {
        // NOTE: handle other event types as you need
        switch (event.type) {
            case 'customer.subscription.created': {
                const subscription = event.data.object
                console.log("Subscription created")
                await db.update(usersTable).set({ plan: subscription.id }).where(eq(usersTable.stripe_id, subscription.customer as string));
                break
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response('Success', { status: 200 })
    } catch (err) {
        return new Response(`Webhook error: ${err instanceof Error ? err.message : "Unknown error"}`, {
            status: 400,
        })
    }
}
