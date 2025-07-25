// utils/payment.ts
import {Alert} from 'react-native';
import {useStripe} from '@stripe/stripe-react-native';

// Set your server URL - Replace with your actual IP address
const SERVER_URL = process.env.EXPO_PUBLIC_STRIPE_REDIRECT_URL; // Replace this with your actual IP

export const usePaymentFlow = () => {
    const {initPaymentSheet, presentPaymentSheet} = useStripe();

    const initializePayment = async (amount: number) => {
        try {
            console.log(`Initializing payment for ${amount}`);
            console.log(`Sending request to: ${SERVER_URL}/create-payment-intent`);

            // Convert amount to cents for Stripe
            const amountInCents = Math.round(amount * 100);

            // Fetch payment intent from your server
            const response = await fetch(`${SERVER_URL}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({amount: amountInCents}),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Payment server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Payment intent created successfully');

            if (!data.paymentIntent) {
                throw new Error('No payment intent received from server');
            }

            // Initialize the Payment Sheet
            const {error} = await initPaymentSheet({
                merchantDisplayName: 'Your Food Delivery App',
                customerId: data.customer,
                customerEphemeralKeySecret: data.ephemeralKey,
                paymentIntentClientSecret: data.paymentIntent,
                // Enable Apple Pay / Google Pay
                allowsDelayedPaymentMethods: true,
                returnURL: 'yourapp://payment-result',
            });

            if (error) {
                console.error('Payment sheet init error:', error);
                throw new Error(error.message);
            }

            console.log('Payment sheet initialized successfully');
            return true;
        } catch (error: any) {
            console.error('Payment initialization error:', error);
            Alert.alert('Error', error.message || 'Payment could not be initialized');
            return false;
        }
    };

    const processPayment = async () => {
        try {
            console.log('Presenting payment sheet');
            // Open the payment sheet
            const {error} = await presentPaymentSheet();

            if (error) {
                console.error('Payment error:', error);
                Alert.alert('Payment failed', error.message);
                return false;
            }

            console.log('Payment completed successfully');
            return true;
        } catch (error: any) {
            console.error('Payment presentation error:', error);
            Alert.alert('Error', error.message || 'Payment could not be completed');
            return false;
        }
    };

    return {
        initializePayment,
        processPayment,
    };
};