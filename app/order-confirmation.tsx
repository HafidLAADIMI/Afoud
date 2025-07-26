// @/screens/OrderConfirmationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons'; // Added FontAwesome5
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Import Firebase functions
import { getOrderById } from '@/utils/firebase'; // Assuming getOrderById is the correct function name

const OrderConfirmationScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams(); // No need for explicit type if just orderId
    const orderId = params.orderId as string; // Cast to string

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setError("ID de commande manquant.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                // Assuming getOrderById is the correct function from your firebase utils
                const orderData = await getOrderById(orderId);
                if (orderData) {
                    setOrder(orderData);
                    console.log("OrderConfirmationScreen: Fetched order details:", orderData);
                } else {
                    setError(`Commande non trouvée (ID: ${orderId}).`);
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError(`Erreur de chargement: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    const handleGoToOrders = () => router.replace('/(protected)/(tabs)/orders'); // Adjusted path
    const handleTrackOrder = () => { if (orderId) router.push(`/(protected)/(tabs)/orders`); }; // Ensure this route exists
    const handleContinueShopping = () => router.replace('/'); // Adjusted path

    if (loading) { /* ... Loading UI ... */
        return (
            <SafeAreaView style={styles.safeAreaLoading}>
                <ActivityIndicator size="large" color="#F97316" />
                <Text style={styles.loadingText}>Chargement de la confirmation...</Text>
            </SafeAreaView>
        );
    }

    if (error) { /* ... Error UI ... */
        return (
            <SafeAreaView style={styles.safeAreaError}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.replace('/(protected)/(tabs)/home')} style={styles.headerButton}>
                        <Feather name="home" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Erreur de Commande</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={60} color="#E53E3E" />
                    <Text style={styles.errorTitle}>Oops! Problème de Commande</Text>
                    <Text style={styles.errorTextDetail}>{error}</Text>
                    <TouchableOpacity onPress={handleContinueShopping} style={styles.errorButton}>
                        <Text style={styles.errorButtonText}>Retour à l'Accueil</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!order) { // Should be caught by error state if fetch fails, but as a fallback
        return (
            <SafeAreaView style={styles.safeAreaError}>
                <Text style={styles.errorTextDetail}>Détails de la commande non disponibles.</Text>
            </SafeAreaView>
        );
    }

    // Determine correct total field from order object
    const displayTotal = order.grandTotal != null ? order.grandTotal : (order.total != null ? order.total : 0);

    const paymentMethodText = order.paymentMethod === 'card' || order.paymentMethod === 'online_payment'
        ? 'Carte Bancaire'
        : (order.paymentMethod === 'cash_on_delivery' || order.paymentMethod === 'cash'
            ? 'Paiement à la Livraison'
            : 'Non spécifié');

    // NEW: Determine payment status
    const isPaymentCompleted =
        order.paymentDetails?.status === 'paid' ||
        order.paymentDetails?.status === 'paid_online' ||
        (order.paymentMethod === 'card' &&
            (order.status === 'confirmed' || order.paymentDetails?.status));

    const paymentStatusText = isPaymentCompleted
        ? 'Payé'
        : order.paymentMethod === 'cash_on_delivery' || order.paymentMethod === 'cash'
            ? 'À payer à la livraison'
            : 'En attente de paiement';

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={styles.gradientColors} style={StyleSheet.absoluteFillObject} />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.successIconContainer}>
                    <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.iconBackground}>
                        <Feather name="check" size={60} color="white" />
                    </LinearGradient>
                </View>
                <Text style={styles.successTitle}>Commande Passée avec Succès!</Text>
                {orderId && (
                    <Text style={styles.orderIdText}>Commande #{orderId.substring(0, 8)}...</Text>
                )}

                {/* Order Details Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Récapitulatif de la Commande</Text>

                    {/* Items Summary - Basic for confirmation, full details were on checkout */}
                    {order.items && order.items.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Articles Commandés ({order.items.length})</Text>
                            {order.items.slice(0,2).map((item, index) => ( // Show first 2 items as teaser
                                <View key={item.productId || index} style={styles.itemRow}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name} (x{item.quantity})</Text>
                                    <Text style={styles.itemPrice}>{(item.itemSubtotal || (item.priceAtPurchase * item.quantity))?.toFixed(2)} MAD</Text>
                                </View>
                            ))}
                            {order.items.length > 2 && <Text style={styles.moreItemsText}>...et {order.items.length - 2} autre(s)</Text>}
                        </View>
                    )}

                    {/* Delivery Address */}
                    {order.deliveryOption === 'homeDelivery' && order.shippingAddress && (
                        <View style={styles.section}>
                            <View style={styles.detailRow}>
                                <Feather name="map-pin" size={20} color="#F97316" style={styles.detailIcon} />
                                <View>
                                    <Text style={styles.detailLabel}>Livré à</Text>
                                    <Text style={styles.detailValue}>{order.shippingAddress.address || 'Adresse non spécifiée'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Phone Number */}
                    {order.phoneNumber && (
                        <View style={styles.section}>
                            <View style={styles.detailRow}>
                                <Feather name="phone" size={20} color="#F97316" style={styles.detailIcon} />
                                <View>
                                    <Text style={styles.detailLabel}>Numéro de Contact</Text>
                                    <Text style={styles.detailValue}>{order.phoneNumber}</Text>
                                </View>
                            </View>
                        </View>
                    )}


                    {/* Payment Method & Total */}
                    <View style={styles.section}>
                        <View style={styles.detailRow}>
                            <Feather name={paymentMethodText === 'Carte Bancaire' ? 'credit-card' : 'dollar-sign'} size={20} color="#F97316" style={styles.detailIcon} />
                            <View>
                                <Text style={styles.detailLabel}>Méthode de Paiement</Text>
                                <Text style={styles.detailValue}>{paymentMethodText}</Text>
                            </View>
                        </View>
                        <View style={[styles.detailRow, {marginTop: 12}]}>
                            <FontAwesome5 name="money-bill-wave" size={20} color="#F97316" style={styles.detailIcon} />
                            <View>
                                <Text style={styles.detailLabel}>Montant Total</Text>
                                <Text style={styles.totalAmountValue}>
                                    {displayTotal.toFixed(2)} MAD
                                </Text>
                                {/* NEW: Display payment status */}
                                <Text style={{
                                    color: isPaymentCompleted ? '#22c55e' : '#f59e0b',
                                    fontSize: 14,
                                    marginTop: 2,
                                    fontWeight: '500'
                                }}>
                                    {paymentStatusText}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Feather name="info" size={22} color="#60A5FA" />
                    <Text style={styles.infoText}>
                        Un e-mail de confirmation a été envoyé. Suivez votre commande dans "Mes Commandes".
                    </Text>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleGoToOrders}>
                        <Feather name="list" size={18} color="white" style={{marginRight: 8}} />
                        <Text style={styles.actionButtonText}>Mes Commandes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.tertiaryButton]} onPress={handleContinueShopping}>
                        <Feather name="shopping-bag" size={18} color="#F97316" style={{marginRight: 8}} />
                        <Text style={styles.tertiaryButtonText}>Continuer les Achats</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#111827' },
    safeAreaLoading: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'white', marginTop: 10, fontSize: 16 },
    safeAreaError: { flex: 1, backgroundColor: '#111827' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151', backgroundColor: 'rgba(31,41,55,0.8)' },
    headerButton: { padding: 5, marginRight: 10 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: '600' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 16, marginBottom: 8, textAlign: 'center' },
    errorTextDetail: { fontSize: 16, color: '#A0AEC0', textAlign: 'center', marginBottom: 24 },
    errorButton: { backgroundColor: '#F97316', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25 },
    errorButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    gradientColors: ['#1F2937', '#111827'],
    scrollContainer: { flexGrow: 1, paddingVertical: 20, paddingHorizontal: 16 },
    successIconContainer: { alignItems: 'center', marginVertical: 20 },
    iconBackground: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowRadius: 20, shadowOpacity: 0.5, elevation: 10 },
    successTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
    orderIdText: { color: '#A0AEC0', fontSize: 16, textAlign: 'center', marginBottom: 24 },
    card: { backgroundColor: 'rgba(45, 55, 72, 0.6)', /* bg-gray-800 with opacity */ borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(74, 85, 104, 0.4)' },
    cardTitle: { color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(74, 85, 104, 0.3)', paddingBottom: 12 },
    section: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(74, 85, 104, 0.2)', },
    sectionHeader: { color: '#CBD5E0', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    itemName: { color: '#E2E8F0', fontSize: 15, flex: 1, marginRight: 8 },
    itemPrice: { color: 'white', fontSize: 15, fontWeight: '500' },
    moreItemsText: { color: '#A0AEC0', fontSize: 13, fontStyle: 'italic', textAlign: 'right', marginTop: 4 },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 /* Spacing handled by section */ },
    detailIcon: { marginRight: 12, marginTop: 2 },
    detailLabel: { color: '#A0AEC0', fontSize: 14, marginBottom: 2 },
    detailValue: { color: 'white', fontSize: 16, fontWeight: '500', flexWrap: 'wrap' },
    totalAmountValue: { color: '#F97316', fontSize: 20, fontWeight: 'bold' },
    infoBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(55, 65, 81, 0.5)', /* bg-gray-700 with opacity */ padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(74, 85, 104, 0.3)' },
    infoText: { color: '#CBD5E0', fontSize: 14, marginLeft: 12, lineHeight: 20, flex: 1 },
    actionsContainer: { paddingBottom: 20, gap: 12 },
    actionButton: { flexDirection: 'row', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
    primaryButton: { backgroundColor: '#F97316' },
    secondaryButton: { backgroundColor: '#374151' /* gray-700 */ },
    tertiaryButton: { borderWidth: 2, borderColor: '#F97316' },
    actionButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    tertiaryButtonText: { color: '#F97316', fontSize: 16, fontWeight: 'bold' },
});

export default OrderConfirmationScreen;