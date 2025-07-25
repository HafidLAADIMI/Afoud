// @/screens/PaymentScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import * as FirebaseUtils from '@/utils/firebase'; // Ensure path is correct

// --- CRITICAL: STRIPE SERVER URL ---
// THIS MUST BE YOUR ACCESSIBLE BACKEND SERVER URL
// Examples:
// Android Emulator (server on localhost): 'http://10.0.2.2:YOUR_PORT'
// iOS Simulator (server on localhost): 'http://localhost:YOUR_PORT'
// Physical Device (same Wi-Fi): 'http://YOUR_COMPUTER_LOCAL_IP:YOUR_PORT'
// Deployed Server / Ngrok: 'https://your-public-url.com'
const STRIPE_SERVER_URL = process.env.EXPO_PUBLIC_STRIPE_REDIRECT_URL || 'http://192.168.1.8:4242'; // REPLACE THIS

const RadioButton = ({ selected, onPress, style }) => (
    <TouchableOpacity
        onPress={onPress}
        style={style}
        className="w-6 h-6 rounded-full border-2 border-gray-500 flex items-center justify-center"
        activeOpacity={0.7}
    >
        {selected && <View className="w-3 h-3 rounded-full bg-orange-500 transition-all" />}
    </TouchableOpacity>
);

export default function PaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const hasNavigatedRef = useRef(false);

    // State for payment details
    const [currentTotalAmount, setCurrentTotalAmount] = useState(0);
    const [currentSerializedOrderData, setCurrentSerializedOrderData] = useState(null);
    const [currentParsedOrderData, setCurrentParsedOrderData] = useState(null);
    const [currentCheckoutStateParams, setCurrentCheckoutStateParams] = useState({});

    // Payment UI State
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stripeInitializing, setStripeInitializing] = useState(false);
    const [paymentSheetInitialized, setPaymentSheetInitialized] = useState(false);

    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const paymentOptions = [
        { id: 'card', name: 'Carte Bancaire', icon: 'credit-card', iconType: Feather },
        { id: 'cash', name: 'Paiement à la Livraison', icon: 'money-bill-wave', iconType: FontAwesome5 },
    ];

    // Effect 1: Parse initial params ONCE or when relevant parts change.
    useEffect(() => {
        console.log("PaymentScreen Params Received:", params);
        const newTotal = parseFloat(params.totalAmount) || 0;
        const newSerializedData = params.serializedOrderData || null;

        if (newTotal !== currentTotalAmount) {
            setCurrentTotalAmount(newTotal);
        }

        if (newSerializedData !== currentSerializedOrderData) {
            setCurrentSerializedOrderData(newSerializedData);
            if (newSerializedData) {
                try {
                    const orderData = JSON.parse(newSerializedData);
                    setCurrentParsedOrderData(orderData);
                    console.log("Parsed order data for display:", orderData);
                } catch (e) {
                    console.error("Error parsing serializedOrderData in PaymentScreen:", e);
                    setCurrentParsedOrderData(null);
                }
            } else {
                setCurrentParsedOrderData(null);
            }
        }

        // Store other params for back navigation, only update if they change.
        const { totalAmount: _t, serializedOrderData: _sod, ...rest } = params;
        if (JSON.stringify(rest) !== JSON.stringify(currentCheckoutStateParams)) {
            setCurrentCheckoutStateParams(rest);
        }

    }, [
        params.totalAmount,
        params.serializedOrderData,
        // Add other specific params from `rest` if they are critical dependencies for checkoutStateParams
        // For simplicity, we can stringify the relevant subset of params for checkoutStateParams dependency
        // This helps if the `params` object itself is re-created but its content for `rest` is the same.
        JSON.stringify( (({ totalAmount: _t, serializedOrderData: _sod, ...rest }) => rest)(params) )
    ]);


    // Effect 2: Initialize Stripe Payment Sheet when 'card' is selected
    // Using user's original Stripe logic structure
    const initializePayment = useCallback(async () => {
        if (selectedMethod !== 'card' || currentTotalAmount <= 0 || paymentSheetInitialized || stripeInitializing) {
            return;
        }
        setStripeInitializing(true); setLoading(true);
        console.log(`Initializing Stripe for ${currentTotalAmount} MAD at ${STRIPE_SERVER_URL}`);
        try {
            const amountInCents = Math.round(currentTotalAmount * 100);
            if (amountInCents <= 0) throw new Error("Invalid amount for Stripe.");

            const response = await fetch(`${STRIPE_SERVER_URL}/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amountInCents, currency: 'eur' }), // Ensure currency is passed
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Stripe Server error:', response.status, errorText);
                // More user-friendly error
                let displayError = `Erreur serveur (${response.status}). Vérifiez l'URL et la connectivité du serveur de paiement.`;
                if (response.status === 404) displayError = "Serveur de paiement non trouvé. Vérifiez l'URL.";
                else if (response.status === 500) displayError = "Erreur interne du serveur de paiement.";
                else if (errorText.length < 150) displayError += ` Détails: ${errorText}`;

                throw new Error(displayError);
            }
            const data = await response.json();
            if (!data.paymentIntent || !data.ephemeralKey || !data.customer) {
                throw new Error("Réponse incorrecte du serveur de paiement. Données Stripe manquantes.");
            }

            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: "VotreApp Livraison", // Replace with your app name
                customerId: data.customer,
                customerEphemeralKeySecret: data.ephemeralKey,
                paymentIntentClientSecret: data.paymentIntent,
                allowsDelayedPaymentMethods: true,
                returnURL: 'yourappname://stripe-redirect', // IMPORTANT: Replace with your app's scheme
                // defaultBillingDetails: { name: currentParsedOrderData?.userEmail } // Optional prefill
            });

            if (initError) {
                console.error('Stripe initPaymentSheet error:', initError);
                Alert.alert('Erreur Stripe', `Echec de l'initialisation: ${initError.message}`);
                setPaymentSheetInitialized(false); setSelectedMethod(null); // Deselect card on init failure
                throw initError; // Propagate error
            }
            setPaymentSheetInitialized(true);
            console.log('Stripe PaymentSheet initialized successfully.');
        } catch (error) {
            console.error('Stripe Initialization failed:', error);
            // Alert is shown by specific error messages above or a generic one here
            if (!error.message.startsWith("Erreur serveur") && !error.message.startsWith("Echec de l'initialisation")) {
                Alert.alert("Erreur d'initialisation Stripe", error.message || "Une erreur inconnue est survenue.");
            }
            setPaymentSheetInitialized(false);
        } finally {
            setStripeInitializing(false); setLoading(false);
        }
    }, [selectedMethod, currentTotalAmount, paymentSheetInitialized, stripeInitializing, initPaymentSheet]); // Dependencies from user's original code

    useEffect(() => {
        if (selectedMethod === 'card') { // Only attempt init if card is selected
            initializePayment();
        }
    }, [selectedMethod, initializePayment]); // Rerun if selectedMethod or the memoized initializePayment changes


    const safeNavigate = useCallback((pathname, navParams) => {
        if (hasNavigatedRef.current) { console.log('Duplicate navigation attempt blocked to:', pathname); return; }
        hasNavigatedRef.current = true;
        router.replace({ pathname, params: navParams });
    }, [router]);

    // Using user's original createOrderAfterPayment structure, now called finalizeOrderAndNavigate
    const finalizeOrderAndNavigate = async (paymentMethodType, paymentDetails = {}) => {
        if (!currentParsedOrderData) {
            Alert.alert("Erreur Critique", "Données de commande manquantes pour finaliser.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Log the data we're starting with
            console.log('Starting order data:', JSON.stringify(currentParsedOrderData, null, 2));
            console.log('Payment method selected:', paymentMethodType);

            // Get the total amount
            const totalAmount = parseFloat(currentTotalAmount);
            console.log('Total amount for order:', totalAmount);

            // Process the items to ensure they have all the data needed
            const processedItems = Array.isArray(currentParsedOrderData.items)
                ? currentParsedOrderData.items.map(item => {
                    // Ensure variations and addons are preserved
                    const variations = Array.isArray(item.selectedVariations)
                        ? item.selectedVariations
                        : Array.isArray(item.variations)
                            ? item.variations
                            : [];

                    const addons = Array.isArray(item.selectedAddons)
                        ? item.selectedAddons
                        : Array.isArray(item.addons)
                            ? item.addons
                            : [];

                    return {
                        ...item,
                        // Ensure we have these fields for the Firebase function
                        variations: variations,
                        addons: addons,
                        selectedVariations: variations, // Provide both formats to be safe
                        selectedAddons: addons,
                        // Ensure price fields are present
                        price: parseFloat(String(item.priceAtPurchase || item.price || 0)),
                        priceAtPurchase: parseFloat(String(item.priceAtPurchase || item.price || 0)),
                    };
                })
                : [];

            // Create the final order data
            const finalOrderData = {
                ...currentParsedOrderData,
                items: processedItems,
                // Use the payment method type passed in
                paymentMethod: paymentMethodType,
                // CRITICAL: Set payment status explicitly for card payments
                paymentStatus: paymentMethodType === 'card' ? 'paid' : 'unpaid',
                // Include any additional payment details
                paymentDetails: {
                    ...paymentDetails,
                    status: paymentMethodType === 'card' ? 'paid' : 'pending_cod',
                    transactionId: paymentMethodType === 'card' ? `tr_${Date.now()}` : undefined,
                    paymentDate: paymentMethodType === 'card' ? new Date().toISOString() : undefined,
                    amount: totalAmount
                },
                // Set the order status based on payment method
                status: 'pending',
                // Make sure total amount is present
                totalAmount: totalAmount,
                grandTotal: totalAmount
            };

            // Log what we're about to send to Firebase
            console.log('Final order data being sent to Firebase:', JSON.stringify(finalOrderData, null, 2));

            // Create the order
            const orderId = await FirebaseUtils.createOrder(finalOrderData);

            // Clear cart if paid
            if (paymentMethodType === 'card') {
                await FirebaseUtils.clearCart();
            }

            // Show success message and navigate
            Alert.alert(
                paymentMethodType === 'card' ? 'Paiement Réussi' : 'Commande Confirmée',
                `Votre commande #${orderId.substring(0,6)}... a été enregistrée.`,
                [{ text: 'OK', onPress: () => safeNavigate('/order-confirmation', { orderId }) }]
            );
        } catch (error) {
            console.error('Error finalizing order:', error);
            Alert.alert('Erreur Commande', `Finalisation: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Using user's original handlePayment structure
    const handlePayment = async () => {
        if (!selectedMethod) { Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement'); return; }
        setLoading(true); // Ensure loading is true at the start of the action

        if (selectedMethod === 'card') {
            try {
                if (!paymentSheetInitialized || stripeInitializing) { // Check stripeInitializing as well
                    Alert.alert('Patientez', 'Initialisation du paiement par carte en cours. Veuillez réessayer dans un instant.');
                    setLoading(false);
                    if(!paymentSheetInitialized && !stripeInitializing && currentTotalAmount > 0) initializePayment(); // Retry init
                    return;
                }
                console.log('Presenting payment sheet');
                const { error } = await presentPaymentSheet();

                if (error) {
                    console.error('Payment error:', error);
                    if (error.code !== 'Canceled') { // Don't alert if user just cancels
                        Alert.alert('Paiement Échoué', error.message);
                    }
                } else {
                    // Payment successful - NOW create the order
                    await finalizeOrderAndNavigate('card', { source: 'stripe', statusMessage: 'Stripe payment successful' });
                }
            } catch (error) { // Catch any other unexpected errors
                console.error('Payment processing error:', error);
                Alert.alert('Erreur', `Un problème est survenu lors du traitement de votre paiement: ${error.message}`);
            } finally {
                setLoading(false);
            }
        } else if (selectedMethod === 'cash') {
            // For cash payment, create the order with cash payment method
            await finalizeOrderAndNavigate('cash_on_delivery', { statusMessage: 'Cash on delivery selected' });
        }
    };

    const handleBackNavigation = () => {
        safeNavigate('/checkout', { ...currentCheckoutStateParams, paymentMethod: selectedMethod || currentCheckoutStateParams.paymentMethod || 'cash_on_delivery' });
    };

    useEffect(() => { return () => { hasNavigatedRef.current = false; }; }, []);


    if (currentTotalAmount <= 0 && !currentParsedOrderData && !params.totalAmount) { // More robust initial loading check
        return (
            <SafeAreaView style={styles.safeAreaLoading}>
                <ActivityIndicator size="large" color="#F97316" />
                <Text style={styles.loadingText}>Chargement des détails...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={styles.gradientColors} style={StyleSheet.absoluteFillObject} />
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackNavigation} style={styles.backButton}>
                    <Feather name="arrow-left" size={26} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Finaliser le Paiement</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.contentPadding}>
                    <Text style={styles.sectionTitle}>Choisissez votre mode de paiement</Text>

                    {paymentOptions.map((method) => {
                        const IconComponent = method.iconType;
                        const isSelected = selectedMethod === method.id;
                        return (
                            <TouchableOpacity
                                key={method.id}
                                style={[styles.paymentOptionButton, isSelected && styles.paymentOptionSelected]}
                                onPress={() => setSelectedMethod(method.id)}
                                activeOpacity={0.8} >
                                <RadioButton selected={isSelected} style={{borderColor: isSelected ? '#F97316' : '#6B7280'}} />
                                <IconComponent name={method.icon} size={24} color={isSelected ? "#F97316" : "#A0AEC0"} style={styles.paymentOptionIcon} />
                                <Text style={[styles.paymentOptionText, isSelected && styles.paymentOptionTextSelected]}>{method.name}</Text>
                                {method.id === 'card' && stripeInitializing && isSelected && (
                                    <ActivityIndicator size="small" color="#F97316" style={{marginLeft: 'auto'}}/>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {selectedMethod === 'card' && !stripeInitializing && paymentSheetInitialized && (
                        <View style={[styles.feedbackBox, styles.feedbackSuccess]}>
                            <Text style={styles.feedbackTextSuccess}>Prêt pour le paiement par carte.</Text>
                        </View>
                    )}
                    {selectedMethod === 'card' && !stripeInitializing && !paymentSheetInitialized && currentTotalAmount > 0 && (
                        <View style={[styles.feedbackBox, styles.feedbackError]}>
                            <Text style={styles.feedbackTextError}>Échec de l'initialisation du paiement. Vérifiez votre connexion/URL serveur et réessayez.</Text>
                        </View>
                    )}

                    {/* Order Summary - Simplified on PaymentScreen, main details are on CheckoutScreen */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Récapitulatif Total</Text>
                        <View style={styles.totalRowGrand}>
                            <Text style={styles.grandTotalLabel}>Montant Total à Payer:</Text>
                            <Text style={styles.grandTotalValue}>{currentTotalAmount.toFixed(2)} MAD</Text>
                        </View>
                        {currentParsedOrderData && currentParsedOrderData.items && currentParsedOrderData.items.length > 0 && (
                            <Text style={styles.itemCountText}>
                                ({currentParsedOrderData.items.length} article{currentParsedOrderData.items.length > 1 ? 's' : ''})
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.confirmButton, (!selectedMethod || loading || (selectedMethod === 'card' && stripeInitializing)) && styles.confirmButtonDisabled]}
                    disabled={!selectedMethod || loading || (selectedMethod === 'card' && stripeInitializing)}
                    onPress={handlePayment} >
                    {loading ? (
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <ActivityIndicator size="small" color="white" style={{marginRight: 10}} />
                            <Text style={styles.confirmButtonText}>Traitement...</Text>
                        </View>
                    ) : (
                        <Text style={styles.confirmButtonText}>
                            {selectedMethod === 'card' ? `Payer ${currentTotalAmount.toFixed(2)} MAD` : 'Confirmer et Payer à la Livraison'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// --- Styles (Using the StyleSheet from payment_screen_v3_details_fix for consistency) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#111827' },
    safeAreaLoading: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'white', marginTop: 10, fontSize: 16 },
    gradientColors: ['#1F2937', '#111827'],
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151', backgroundColor: 'rgba(31,41,55,0.8)' },
    backButton: { padding: 5, marginRight: 10 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: '600' },
    scrollContentContainer: { paddingBottom: 120, flexGrow: 1 },
    contentPadding: { padding: 20, }, // Removed spaceY, manage with component margins
    sectionTitle: { fontSize: 22, fontWeight: '600', color: 'white', marginBottom: 20 },
    paymentOptionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3, marginBottom: 12, backgroundColor: '#2D3748', borderColor: '#4A5568' },
    paymentOptionSelected: { borderColor: '#F97316', backgroundColor: 'rgba(249, 115, 22, 0.1)' },
    paymentOptionIcon: { marginHorizontal: 16 },
    paymentOptionText: { fontSize: 16, fontWeight: '500', flex: 1, color: '#E2E8F0' },
    paymentOptionTextSelected: { color: '#F97316' },
    feedbackBox: { padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1 },
    feedbackSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#059669' },
    feedbackTextSuccess: { color: '#A7F3D0', textAlign: 'center', fontSize: 14 },
    feedbackError: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#DC2626' },
    feedbackTextError: { color: '#FCA5A5', textAlign: 'center', fontSize: 14 },
    summaryCard: { backgroundColor: 'rgba(45, 55, 72, 0.7)', padding: 20, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: '#4A5568' },
    summaryTitle: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#4A5568', paddingBottom: 10 },
    itemCountText: { color: '#A0AEC0', fontSize: 13, textAlign: 'right', marginTop: 4 },
    // Styles for itemRow, itemName, itemPrice, separators, totalRow, totalLabel, totalValue are removed as detailed summary is now on CheckoutScreen
    totalRowGrand: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    grandTotalLabel: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    grandTotalValue: { color: '#F97316', fontSize: 22, fontWeight: 'bold' },
    bottomBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 20, backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: '#374151' },
    confirmButton: { backgroundColor: '#F97316', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
    confirmButtonDisabled: { backgroundColor: '#4A5568', opacity: 0.7 },
    confirmButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

