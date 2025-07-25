// ExpoStripeProvider.tsx
import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function ExpoStripeProvider({ children }: { children: React.ReactNode }) {
    return (
        <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
            urlScheme="foodapp"                              // must match your app.json “scheme”
            merchantIdentifier="merchant.com.yourcompany.fooddelivery" // for Apple Pay
        >
            {children}
        </StripeProvider>
    );
}
