import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
export async function POST(request: Request) {
    console.log('Webhook received')
    try {
        const response = await request.json()
        console.log(response)
        // On subscribe, write to db
        console.log(response.data.object.customer)
        await db.update(usersTable).set({ plan: response.data.object.id }).where(eq(usersTable.stripe_id, response.data.object.customer));
        // Process the webhook payload
    } catch (error: any) {
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        })
    }
    return new Response('Success', { status: 200 })
}