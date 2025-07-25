// Additional logs and error handling for your server API route

// app/api/create-payment-intent/route.ts
import { stripe } from "@/utils/stripe-server";
import { CURRENCY } from "@/utils/config";

export async function POST(req: Request) {
    console.log('Received payment intent request');

    try {
        // Safely parse body
        let body;
        try {
            body = await req.json();
            console.log('Received request body:', body);
        } catch (e) {
            console.error('Error parsing request body:', e);
            return Response.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Default to a fixed amount if none provided (for testing)
        const orderAmount = body.amount || 1000; // $10.00 default

        if (typeof orderAmount !== 'number' || isNaN(orderAmount)) {
            console.error('Invalid amount:', orderAmount);
            return Response.json({ error: 'Amount must be a number' }, { status: 400 });
        }

        console.log('Processing amount:', orderAmount);

        // Check if environment variables are set
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY is not set');
            return Response.json({ error: 'Stripe configuration missing' }, { status: 500 });
        }

        // Convert amount to cents/smallest currency unit
        const amountInSmallestUnit = formatAmountForStripe(orderAmount, CURRENCY);
        console.log('Amount in smallest unit:', amountInSmallestUnit);

        // Create a customer
        const customer = await stripe.customers.create();
        console.log('Created customer:', customer.id);

        // Create ephemeral key for customer
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2024-06-20' }
        );
        console.log('Created ephemeral key');

        // Create payment intent with the amount
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: CURRENCY,
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                order_id: `order_${Date.now()}`
            }
        });

        console.log('Created payment intent:', paymentIntent.id);

        const response = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        };

        console.log('Sending response:', JSON.stringify(response).substring(0, 100) + '...');

        // Set correct content type
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        console.error('Payment intent creation error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Error creating payment intent' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}

// Helper function to format amounts for Stripe
function formatAmountForStripe(amount: number, currency: string): number {
    // Skip formatting for zero-decimal currencies
    if (['JPY', 'KRW', 'VND', 'BIF', 'CLP', 'DJF', 'GNF', 'MGA', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF'].includes(currency)) {
        return Math.round(amount);
    }

    // For most currencies, convert to cents/smallest currency unit
    return Math.round(amount * 100);
}