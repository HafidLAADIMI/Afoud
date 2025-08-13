// @/screens/CheckoutScreen.js - Clean Working Version

import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, TextInput, ScrollView,
    Alert, ActivityIndicator, Platform, Image, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import * as FirebaseUtils from '@/utils/firebase';

// Hardcoded delivery regions
const ALLOWED_REGIONS = {
    "Hay Oulfa": { latitude: 33.5423, longitude: -7.6532, radius: 2000 },
    "Hay Hassani": { latitude: 33.5156, longitude: -7.6789, radius: 2000 },
    "Lissasfa": { latitude: 33.5234, longitude: -7.6123, radius: 2000 },
    "Almaz": { latitude: 33.5378, longitude: -7.6234, radius: 2000 },
    "Hay Laymoun": { latitude: 33.5512, longitude: -7.6445, radius: 2000 },
    "Ciel": { latitude: 33.5289, longitude: -7.6456, radius: 2000 },
    "Nassim": { latitude: 33.5334, longitude: -7.6298, radius: 2000 },
    "Sidi Maarouf": { latitude: 33.5167, longitude: -7.6234, radius: 2000 },
    "CFC": { latitude: 33.5445, longitude: -7.6567, radius: 2000 }
};

// --- Helper Components ---
const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-6 h-6 rounded-lg items-center justify-center border-2 ${
            checked ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'
        }`}
        activeOpacity={0.8}
        style={{
            shadowColor: checked ? '#a86e02' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: checked ? 0.2 : 0.1,
            shadowRadius: 4,
            elevation: 2,
        }}
    >
        {checked && <Feather name="check" size={16} color="#a86e02" />}
    </TouchableOpacity>
);

const RadioButton = ({ selected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            selected ? 'border-yellow-600' : 'border-gray-300'
        }`}
        activeOpacity={0.8}
    >
        {selected && <View className="w-3 h-3 rounded-full" style={{ backgroundColor: '#a86e02' }} />}
    </TouchableOpacity>
);

const TipButton = ({ amount, selected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`flex-1 py-3 px-2 rounded-xl border-2 mx-1 ${
            selected ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 bg-white'
        }`}
        activeOpacity={0.8}
        style={{
            shadowColor: selected ? '#a86e02' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: selected ? 0.15 : 0.05,
            shadowRadius: 4,
            elevation: 2,
        }}
    >
        <Text className={`text-center font-semibold ${
            selected ? 'text-yellow-700' : 'text-gray-700'
        }`}>
            {amount} MAD
        </Text>
    </TouchableOpacity>
);

const PhoneNumberInput = ({ value, onChangeText }) => (
    <View>
        <Text className="text-sm font-semibold text-gray-700 mb-2">
            Numéro de Téléphone *
        </Text>
        <TextInput
            className="bg-white text-gray-900 p-4 rounded-xl border-2 border-gray-200 focus:border-yellow-600 text-base"
            placeholder="Votre numéro (ex: 0612345678)"
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
            }}
        />
    </View>
);

const RegionSelector = ({ selectedRegion, onSelectRegion }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">
                Zone de Livraison *
            </Text>
            <TouchableOpacity
                className="bg-white p-4 rounded-xl border-2 border-gray-200 flex-row justify-between items-center"
                onPress={() => setShowModal(true)}
                activeOpacity={0.8}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                }}
            >
                <Text className={`text-base ${selectedRegion ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedRegion || 'Sélectionnez votre zone'}
                </Text>
                <Feather name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center px-4">
                    <View className="bg-white rounded-2xl max-h-96">
                        <View className="p-5 border-b border-gray-200">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-xl font-bold text-gray-900">
                                    Choisir une Zone
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowModal(false)}
                                    className="bg-gray-100 p-2 rounded-full"
                                >
                                    <Feather name="x" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <ScrollView className="max-h-80">
                            {Object.keys(ALLOWED_REGIONS).map((region) => (
                                <TouchableOpacity
                                    key={region}
                                    className={`p-4 border-b border-gray-100 flex-row justify-between items-center ${
                                        selectedRegion === region ? 'bg-yellow-50' : 'bg-white'
                                    }`}
                                    onPress={() => {
                                        onSelectRegion(region);
                                        setShowModal(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center">
                                        <View className="bg-yellow-50 p-2 rounded-full mr-3">
                                            <Feather name="map-pin" size={18} color="#a86e02" />
                                        </View>
                                        <Text className={`text-base font-medium ${
                                            selectedRegion === region ? 'text-yellow-700' : 'text-gray-900'
                                        }`}>
                                            {region}
                                        </Text>
                                    </View>
                                    {selectedRegion === region && (
                                        <Feather name="check" size={20} color="#a86e02" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default function CheckoutScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    // State variables
    const [currentUser, setCurrentUser] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(params.phoneNumber as string || '');
    const [selectedRegion, setSelectedRegion] = useState(params.selectedRegion as string || '');
    const [deliveryAddress, setDeliveryAddress] = useState(params.deliveryAddress as string || '');
    const [deliveryOption, setDeliveryOption] = useState(params.deliveryOption as string || 'homeDelivery');
    const [tipAmount, setTipAmount] = useState(params.tipAmount ? parseFloat(params.tipAmount as string) : null);
    const [customTip, setCustomTip] = useState(params.customTip as string || '');
    const [additionalNote, setAdditionalNote] = useState(params.additionalNote as string || '');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(params.paymentMethod as string || 'cash_on_delivery');
    const [cartItems, setCartItems] = useState([]);
    const [subTotalAmount, setSubTotalAmount] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [showOrderSummaryDetails, setShowOrderSummaryDetails] = useState(false);

    // Load initial user data
    useEffect(() => {
        const loadInitialUserData = async () => {
            try {
                const user = await FirebaseUtils.getCurrentUser();
                if (!user || !user.uid) {
                    Alert.alert("Authentification requise", "Veuillez vous connecter.");
                    router.replace('/login'); 
                    return;
                }
                setCurrentUser(user); 
                setUserEmail(user.email || '');

                if (!phoneNumber) {
                    const profile = await FirebaseUtils.getUserProfile(user.uid);
                    if (profile && profile.phoneNumber) setPhoneNumber(profile.phoneNumber);
                }
            } catch (error) { 
                console.error('Error fetching initial user data:', error); 
            }
        };
        loadInitialUserData();
    }, [router]);

    // Handle product data
    useEffect(() => {
        const initializeCart = async () => {
            setIsLoading(true);
            let itemsToSet = [];
            let subTotalToSet = 0;

            // Try to load from params first, then Firebase
            if (params.persistedProductData) {
                try {
                    const productData = JSON.parse(params.persistedProductData as string);
                    const quantity = Number(productData.quantity) || 1;
                    const itemPrice = Number(productData.itemPriceWithAddons) || 0;
                    const itemSubtotal = itemPrice * quantity;

                    itemsToSet = [{
                        productId: productData.productId,
                        name: productData.productName,
                        quantity: quantity,
                        priceAtPurchase: Number(productData.basePrice) || 0,
                        selectedAddons: productData.selectedAddons || [],
                        selectedVariations: productData.selectedVariations || [],
                        itemSubtotal: itemSubtotal,
                        image: productData.imageUri ? { uri: productData.imageUri } : null,
                        restaurantId: productData.restaurantId,
                        cuisineId: productData.cuisineId,
                    }];
                    subTotalToSet = itemSubtotal;
                } catch (e) {
                    console.error('Error parsing product data:', e);
                }
            }

            // Load from Firebase if no params
            if (itemsToSet.length === 0) {
                try {
                    const firebaseItems = await FirebaseUtils.getCartItems();
                    itemsToSet = firebaseItems;
                    subTotalToSet = await FirebaseUtils.getCartTotal();
                } catch (error) { 
                    console.error('Error loading cart:', error); 
                }
            }
            
            setCartItems(itemsToSet);
            setSubTotalAmount(subTotalToSet);
            setIsLoading(false);
        };

        if (currentUser !== null) {
            initializeCart();
        }
    }, [currentUser, params.persistedProductData]);

    // Calculate Grand Total
    useEffect(() => {
        const tipNum = parseFloat(String(tipAmount)) || 0;
        setGrandTotal(subTotalAmount + tipNum);
    }, [subTotalAmount, tipAmount]);

    // Handler functions
    const handleSelectTip = (amount) => {
        if (tipAmount === amount) { 
            setTipAmount(null); 
            setCustomTip(''); 
        } else { 
            setTipAmount(amount); 
            setCustomTip(amount.toString()); 
        }
    };

    const handleCustomTipChange = (text) => {
        setCustomTip(text);
        const numValue = parseFloat(text);
        if (!isNaN(numValue) && numValue >= 0) setTipAmount(numValue);
        else setTipAmount(null);
    };

    const handlePlaceOrder = async () => {
        if (placingOrder) return;
        
        // Validations
        if (!currentUser || !userEmail) { 
            Alert.alert("Erreur", "Données utilisateur non chargées."); 
            return; 
        }
        if (!phoneNumber.trim()) { 
            Alert.alert("Téléphone requis", "Veuillez entrer votre numéro de téléphone."); 
            return; 
        }
        if (!selectedRegion) { 
            Alert.alert("Zone requise", "Veuillez sélectionner une zone de livraison."); 
            return; 
        }
        if (!deliveryAddress.trim()) { 
            Alert.alert("Adresse requise", "Veuillez entrer votre adresse."); 
            return; 
        }
        if (cartItems.length === 0) { 
            Alert.alert("Panier vide", "Votre panier est vide."); 
            return; 
        }
        if (!agreedToTerms) { 
            Alert.alert("Conditions", "Veuillez accepter les conditions générales."); 
            return; 
        }

        setPlacingOrder(true);

        try {
            // Prepare order data
            const orderItems = cartItems.map(item => ({
                productId: item.productId || item.id,
                name: item.name,
                quantity: Number(item.quantity) || 1,
                priceAtPurchase: Number(item.priceAtPurchase || item.price) || 0,
                selectedAddons: item.selectedAddons || [],
                selectedVariations: item.selectedVariations || [],
                itemSubtotal: Number(item.itemSubtotal) || 0,
                image: item.image?.uri || null,
                restaurantId: item.restaurantId,
                cuisineId: item.cuisineId,
            }));

            const tipValue = parseFloat(String(tipAmount)) || 0;
            const total = subTotalAmount + tipValue;
            const regionData = ALLOWED_REGIONS[selectedRegion] || null;

            const orderData = {
                userEmail: userEmail,
                phoneNumber: phoneNumber.trim(),
                items: orderItems,
                subTotalAmount: subTotalAmount,
                tipAmount: tipValue,
                deliveryFee: 0,
                grandTotal: total,
                deliveryOption: deliveryOption,
                shippingAddress: {
                    region: selectedRegion,
                    address: deliveryAddress.trim(),
                    latitude: regionData?.latitude || null,
                    longitude: regionData?.longitude || null,
                    instructions: additionalNote,
                },
                orderNotes: additionalNote,
                paymentMethod: 'cash_on_delivery',
                paymentDetails: { status: 'pending_cod', message: 'Paiement à la livraison' },
                status: 'pending',
            };

            const newOrderId = await FirebaseUtils.createOrder(orderData);
            await FirebaseUtils.clearCart();
            
            Alert.alert("Commande réussie!", `Votre commande #${newOrderId.substring(0, 6)}... a été enregistrée.`);
            router.replace({ pathname: '/order-confirmation', params: { orderId: newOrderId } });
        } catch (error) {
            console.error("Error placing order:", error);
            Alert.alert("Erreur", "Impossible de passer la commande.");
        } finally {
            setPlacingOrder(false);
        }
    };

    // Loading state
    if (isLoading) { 
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center">
                    <View className="bg-white rounded-2xl p-8 mx-6 border border-gray-200">
                        <ActivityIndicator size="large" color="#a86e02" />
                        <Text className="text-gray-700 mt-4 text-lg font-medium text-center">
                            Chargement...
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Empty cart state
    if (cartItems.length === 0) { 
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-200">
                    <TouchableOpacity 
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
                        className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-4"
                    >
                        <Feather name="arrow-left" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <Text className="text-gray-900 text-xl font-bold">Panier</Text>
                </View>

                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 items-center border border-gray-200">
                        <View className="w-20 h-20 rounded-full bg-yellow-50 items-center justify-center mb-6">
                            <Feather name="shopping-bag" size={40} color="#a86e02" />
                        </View>
                        <Text className="text-gray-900 text-2xl font-bold mb-3 text-center">
                            Panier vide
                        </Text>
                        <Text className="text-gray-600 text-center mb-8 text-base leading-6">
                            Découvrez nos délicieux plats et créez votre première commande
                        </Text>
                        <TouchableOpacity 
                            onPress={() => router.replace('/(tabs)')} 
                            className="w-full py-4 rounded-xl"
                            style={{ backgroundColor: '#a86e02' }}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                Explorer les Menus
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }
   return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-200">
                <TouchableOpacity 
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
                    className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-4"
                >
                    <Feather name="arrow-left" size={20} color="#6B7280" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-gray-900 text-xl font-bold">Finaliser la Commande</Text>
                    <Text className="text-gray-600 text-sm mt-0.5">
                        {cartItems.length} article{cartItems.length > 1 ? 's' : ''} • {subTotalAmount.toFixed(2)} MAD
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="p-5 space-y-6">
                    {/* Contact Info */}
                    <View className="bg-white p-5 rounded-2xl border border-gray-200">
                        <View className="flex-row items-center mb-5">
                            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                                <Feather name="user" size={18} color="#3B82F6" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900">Vos Coordonnées</Text>
                        </View>
                        
                        <View className="space-y-4">
                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
                                <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <Text className="text-gray-700 text-base">{userEmail}</Text>
                                </View>
                            </View>
                            <PhoneNumberInput value={phoneNumber} onChangeText={setPhoneNumber} />
                        </View>
                    </View>

                    {/* Delivery Address */}
                    <View className="bg-white p-5 rounded-2xl border border-gray-200">
                        <View className="flex-row items-center mb-5">
                            <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                                <Feather name="map-pin" size={18} color="#10B981" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900">Adresse de Livraison</Text>
                        </View>
                        
                        <View className="space-y-4">
                            <RegionSelector 
                                selectedRegion={selectedRegion} 
                                onSelectRegion={setSelectedRegion}
                            />
                            
                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Adresse Complète *
                                </Text>
                                <TextInput
                                    className="bg-white text-gray-900 p-4 rounded-xl border-2 border-gray-200 text-base"
                                    placeholder="Numéro, rue, appartement..."
                                    placeholderTextColor="#9CA3AF"
                                    value={deliveryAddress}
                                    onChangeText={setDeliveryAddress}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Instructions (Optionnel)
                                </Text>
                                <TextInput
                                    className="bg-white text-gray-900 p-4 rounded-xl border-2 border-gray-200 text-base"
                                    placeholder="Instructions pour le livreur"
                                    placeholderTextColor="#9CA3AF"
                                    value={additionalNote}
                                    onChangeText={setAdditionalNote}
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Tip Section */}
                    {/* <View className="bg-white p-5 rounded-2xl border border-gray-200">
                        <View className="flex-row items-center mb-5">
                            <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mr-3">
                                <Feather name="heart" size={18} color="#8B5CF6" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900">Pourboire (Optionnel)</Text>
                        </View>
                        
                        <View className="flex-row mb-4">
                            <TipButton amount={5} selected={tipAmount === 5} onPress={() => handleSelectTip(5)} />
                            <TipButton amount={10} selected={tipAmount === 10} onPress={() => handleSelectTip(10)} />
                            <TipButton amount={15} selected={tipAmount === 15} onPress={() => handleSelectTip(15)} />
                            <TipButton amount={20} selected={tipAmount === 20} onPress={() => handleSelectTip(20)} />
                        </View>
                        
                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">
                                Montant Personnalisé
                            </Text>
                            <TextInput
                                className="bg-white text-gray-900 p-4 rounded-xl border-2 border-gray-200 text-base"
                                placeholder="Entrez un montant en MAD"
                                placeholderTextColor="#9CA3AF"
                                value={customTip}
                                onChangeText={handleCustomTipChange}
                                keyboardType="numeric"
                            />
                        </View>
                    </View> */}

                    {/* Payment Method */}
                    <View className="bg-white p-5 rounded-2xl border border-gray-200">
                        <View className="flex-row items-center mb-5">
                            <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center mr-3">
                                <Feather name="credit-card" size={18} color="#10B981" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900">Mode de Paiement</Text>
                        </View>
                        
                        <View className="flex-row items-center p-4 rounded-xl border-2 border-yellow-600 bg-yellow-50">
                            <RadioButton selected={true} />
                            <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mx-4">
                                <FontAwesome5 name="money-bill-wave" size={16} color="#a86e02" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-base text-yellow-700">
                                    Paiement à la livraison
                                </Text>
                                <Text className="text-gray-500 text-sm mt-0.5">
                                    Espèces uniquement
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Order Summary */}
                    <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <TouchableOpacity 
                            onPress={() => setShowOrderSummaryDetails(!showOrderSummaryDetails)} 
                            className="flex-row justify-between items-center p-5"
                        >
                            <View className="flex-1">
                                <Text className="text-xl font-bold text-gray-900">
                                    Résumé de commande
                                </Text>
                                <Text className="text-yellow-700 text-sm font-semibold mt-1">
                                    {cartItems.length} article{cartItems.length > 1 ? 's' : ''} • {subTotalAmount.toFixed(2)} MAD
                                </Text>
                            </View>
                            <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center">
                                <Feather 
                                    name={showOrderSummaryDetails ? "chevron-up" : "chevron-down"} 
                                    size={18} 
                                    color="#a86e02" 
                                />
                            </View>
                        </TouchableOpacity>

                        {showOrderSummaryDetails && (
                            <View className="px-5 pb-5 border-t border-gray-100">
                                <View className="space-y-4 mt-4">
                                    {cartItems.map((item, index) => (
                                        <View 
                                            key={item.productId || item.id || `item-${index}`} 
                                            className="flex-row items-start py-3 border-b border-gray-100"
                                        >
                                            <View className="w-16 h-16 rounded-xl mr-4 overflow-hidden bg-gray-100">
                                                {item.image?.uri ? (
                                                    <Image source={item.image} className="w-full h-full" />
                                                ) : (
                                                    <View className="w-full h-full items-center justify-center">
                                                        <Feather name="image" size={20} color="#9CA3AF"/>
                                                    </View>
                                                )}
                                            </View>
                                            
                                            <View className="flex-1 mr-3">
                                                <Text className="text-gray-900 font-semibold text-base">
                                                    {item.name}
                                                </Text>
                                                <Text className="text-gray-600 text-sm mt-1">
                                                    Qté: {item.quantity} • {Number(item.priceAtPurchase).toFixed(2)} MAD/u
                                                </Text>
                                                
                                                {/* Show variations if any */}
                                                {(item.selectedVariations && item.selectedVariations.length > 0) && (
                                                    <View className="mt-2 p-2 bg-blue-50 rounded-lg">
                                                        <Text className="text-blue-700 text-xs font-semibold mb-1">Variations:</Text>
                                                        {item.selectedVariations.map(v => (
                                                            <Text key={v.id} className="text-blue-600 text-xs">
                                                                • {v.name} (+{Number(v.price).toFixed(2)} MAD)
                                                            </Text>
                                                        ))}
                                                    </View>
                                                )}
                                                
                                                {/* Show addons if any */}
                                                {(item.selectedAddons && item.selectedAddons.length > 0) && (
                                                    <View className="mt-2 p-2 bg-green-50 rounded-lg">
                                                        <Text className="text-green-700 text-xs font-semibold mb-1">Suppléments:</Text>
                                                        {item.selectedAddons.map(addon => (
                                                            <Text key={addon.id} className="text-green-600 text-xs">
                                                                • {addon.name} (+{Number(addon.price).toFixed(2)} MAD)
                                                            </Text>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                            
                                            <Text className="text-gray-900 font-bold text-lg">
                                                {Number(item.itemSubtotal).toFixed(2)} MAD
                                            </Text>
                                        </View>
                                    ))}
                                    
                                    <View className="pt-4 mt-2 border-t border-gray-200">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-gray-600 font-medium">Sous-total:</Text>
                                            <Text className="text-gray-900 text-lg font-semibold">
                                                {subTotalAmount.toFixed(2)} MAD
                                            </Text>
                                        </View>
                                        {tipAmount && tipAmount > 0 && (
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text className="text-gray-600 font-medium">Pourboire:</Text>
                                                <Text className="text-gray-900 text-lg font-semibold">
                                                    {tipAmount.toFixed(2)} MAD
                                                </Text>
                                            </View>
                                        )}
                                        <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
                                            <Text className="text-gray-900 font-bold text-lg">Total:</Text>
                                            <Text className="font-bold text-2xl" style={{ color: '#a86e02' }}>
                                                {grandTotal.toFixed(2)} MAD
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Terms and Conditions */}
                    <View className="flex-row items-start px-2 py-4">
                        <Checkbox checked={agreedToTerms} onPress={() => setAgreedToTerms(!agreedToTerms)} />
                        <Text className="text-gray-600 ml-3 flex-1 text-sm leading-5">
                            J'ai lu et j'accepte les{' '}
                            <Text className="font-semibold" style={{ color: '#a86e02' }}>
                                Conditions Générales
                            </Text>.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View className="px-5 pt-4 pb-8 bg-white border-t border-gray-200">
                <TouchableOpacity
                    onPress={handlePlaceOrder}
                    disabled={placingOrder}
                    className="py-4 rounded-2xl items-center justify-center"
                    style={{
                        backgroundColor: placingOrder ? '#D1D5DB' : '#a86e02',
                        shadowColor: '#a86e02',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                    activeOpacity={0.9}
                >
                    {placingOrder ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text className="text-white text-lg font-bold">
                            Passer la Commande ({grandTotal.toFixed(2)} MAD)
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
    
}