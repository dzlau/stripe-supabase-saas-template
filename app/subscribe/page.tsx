import StripePricingTable from "@/components/StripePricingTable";
import Image from "next/image"
import { createClient } from '@/utils/supabase/server'
import { createStripeCheckoutSession } from "@/utils/stripe/api";
export default async function Subscribe() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    const checkoutSessionSecret = await createStripeCheckoutSession(user!.email!)

    return (
        <div className="flex flex-col min-h-screen bg-secondary">
            <header className="px-4 lg:px-6 h-16 flex items-center  bg-white border-b fixed border-b-slate-200 w-full">
                <Image src="/logo.png" alt="logo" width={50} height={50} />
                <span className="sr-only">Acme Inc</span>
            </header>
            <div className="w-full py-20 lg:py-32 xl:py-40">
                <div className="text-center py-6 md:py-10 lg:py-12 ">
                    <h1 className="font-bold text-xl md:text-3xl lg:text-4xl ">Pricing</h1>
                    <h1 className="pt-4 text-muted-foreground text-sm md:text-md lg:text-lg">Choose the right plan for your team! Cancel anytime!</h1>
                </div>
                <StripePricingTable checkoutSessionSecret={checkoutSessionSecret} />
            </div>
        </div>
    )
}