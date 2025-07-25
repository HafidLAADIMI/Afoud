export async function GET() {
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
        version: '1.0.0'
    });
}