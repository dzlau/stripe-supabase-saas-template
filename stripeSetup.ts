if (process.env.NODE_ENV === 'production') {
    require('dotenv').config(); // Load from .env in production
} else {
    require('dotenv').config({ path: '.env.local' }); // Load from .env.local in development
}

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Types
interface Plan {
    name: string;
    price: number;
    description: string;
    features: string[];
}

interface StripeProduct {
    id: string;
    name: string;
    metadata?: {
        features?: string;
    };
}

interface WebhookEndpoint {
    url: string;
}

// Configuration
const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";
const CURRENCY = 'usd';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Product Plans
const plans: Plan[] = [
    {
        name: IS_PRODUCTION ? 'Basic' : 'Basic-Test',
        price: 1000, // price in cents
        description: 'Perfect for small teams and individuals',
        features: [
            'Up to 10 users',
            'Up to 1000 records',
            'Up to 1000 API calls'
        ]
    },
    {
        name: IS_PRODUCTION ? 'Pro' : 'Pro-Test',
        price: 2000,
        description: 'Great for growing teams',
        features: [
            'Up to 100 users',
            'Up to 10000 records',
            'Up to 10000 API calls'
        ]
    },
    {
        name: IS_PRODUCTION ? 'Enterprise' : 'Enterprise-Test',
        price: 5000,
        description: 'For large organizations',
        features: [
            'Unlimited users',
            'Unlimited records',
            'Unlimited API calls'
        ]
    }
];

// Helper Functions
async function createProduct(plan: Plan): Promise<StripeProduct> {
    // Check if product exists
    const existingProducts = await stripe.products.list({ active: true });
    let product = existingProducts.data.find((p: StripeProduct) => p.name === plan.name);

    if (!product) {
        // Create new product if it doesn't exist
        product = await stripe.products.create({
            name: plan.name,
            description: plan.description,
            metadata: {
                features: JSON.stringify(plan.features)
            }
        });
        console.log(`Created product: ${plan.name}`);
    } else {
        // Update existing product's features
        product = await stripe.products.update(product.id, {
            description: plan.description,
            metadata: {
                features: JSON.stringify(plan.features)
            }
        });
        console.log(`Updated product: ${plan.name}`);
    }

    return product;
}

async function createPrice(product: StripeProduct, plan: Plan): Promise<void> {
    // Check if price exists
    const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true
    });

    if (existingPrices.data.length === 0) {
        // Create new price if none exists
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.price,
            currency: CURRENCY,
            recurring: { interval: 'month' }
        });

        // Set as default price
        await stripe.products.update(product.id, {
            default_price: price.id
        });
        console.log(`Created price for ${plan.name}: ${price.id}`);
    }
}

async function setupWebhook(): Promise<void> {
    // Skip webhook setup in development
    if (!IS_PRODUCTION) {
        console.log('Skipping webhook setup in development');
        console.log('Use Stripe CLI for local testing: https://stripe.com/docs/stripe-cli');
        return;
    }

    const webhooks = await stripe.webhookEndpoints.list();
    const webhookUrl = `${PUBLIC_URL}/webhook/stripe`;
    
    if (!webhooks.data.some((webhook: WebhookEndpoint) => webhook.url === webhookUrl)) {
        await stripe.webhookEndpoints.create({
            enabled_events: [
                'customer.subscription.created',
                'customer.subscription.deleted',
                'customer.subscription.updated'
            ],
            url: webhookUrl,
        });
        console.log('Created webhook endpoint');
    }
}

// Main Setup Function
async function setupStripe(): Promise<void> {
    try {
        console.log(`Setting up Stripe in ${IS_PRODUCTION ? 'production' : 'development'} mode...`);

        // Setup products and prices
        for (const plan of plans) {
            const product = await createProduct(plan);
            await createPrice(product, plan);
        }

        // Setup webhook
        await setupWebhook();

        console.log('Stripe setup completed successfully');
    } catch (error) {
        console.error('Error setting up Stripe:', error);
        throw error;
    }
}

// Run Setup
setupStripe().catch(console.error);