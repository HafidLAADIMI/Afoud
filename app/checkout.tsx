// @/screens/CheckoutScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, TextInput, ScrollView,
    Alert, ActivityIndicator, Platform, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import * as FirebaseUtils from '@/utils/firebase'; // Ensure path is correct

// --- Helper Components (Styled with NativeWind) ---
const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-6 h-6 rounded-md items-center justify-center border 
                    ${checked ? 'bg-orange-500 border-orange-600' : 'bg-gray-700 border-gray-600'}`}
        activeOpacity={0.7}
    >
        {checked && <Feather name="check" size={16} color="white" />}
    </TouchableOpacity>
);

const RadioButton = ({ selected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                   ${selected ? 'border-orange-500' : 'border-gray-500'}`}
        activeOpacity={0.7}
    >
        {selected && <View className="w-3 h-3 rounded-full bg-orange-500" />}
    </TouchableOpacity>
);

const TipButton = ({ amount, selected, onPress, label }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`flex-1 py-3 px-2 rounded-lg border shadow-sm active:opacity-80
                    ${selected ? 'bg-orange-500 border-orange-600' : 'bg-gray-700 border-gray-600'}`}
        activeOpacity={0.7}
    >
        <Text className={`text-center font-medium ${selected ? 'text-white' : 'text-gray-200'}`}>
            {label || `${amount} MAD`}
        </Text>
    </TouchableOpacity>
);

const PhoneNumberInput = ({ value, onChangeText }) => (
    <View>
        <Text className="text-sm font-medium text-gray-300 mb-1 mt-8">Numéro de Téléphone *</Text>
        <TextInput
            className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-orange-500 text-base"
            placeholder="Votre numéro (ex: 0612345678)"
            placeholderTextColor="#777" // Lighter placeholder
            value={value}
            onChangeText={onChangeText}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
        />
    </View>
);
// --- End Helper Components ---

export default function CheckoutScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    // Restore state from params if navigating back from map or payment
    const [currentUser, setCurrentUser] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(params.phoneNumber as string || '');

    const [deliveryOption, setDeliveryOption] = useState(params.deliveryOption as string || 'homeDelivery');
    const [tipAmount, setTipAmount] = useState(params.tipAmount ? parseFloat(params.tipAmount as string) : null);
    const [customTip, setCustomTip] = useState(params.customTip as string || '');
    const [additionalNote, setAdditionalNote] = useState(params.additionalNote as string || '');
    const [agreedToTerms, setAgreedToTerms] = useState(false); // Typically not persisted across navigation
    const [paymentMethod, setPaymentMethod] = useState(params.paymentMethod as string || 'cash_on_delivery');

    const [selectedAddress, setSelectedAddress] = useState(null); // Initialized in useEffect
    const [userAddresses, setUserAddresses] = useState([]);

    const [cartItems, setCartItems] = useState([]);
    const [subTotalAmount, setSubTotalAmount] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [showOrderSummaryDetails, setShowOrderSummaryDetails] = useState(true);

    // Effect 1: Load initial user data, and saved addresses.
    useEffect(() => {
        const loadInitialUserData = async () => {
            try {
                const user = await FirebaseUtils.getCurrentUser();
                if (!user || !user.uid) {
                    Alert.alert("Authentification requise", "Veuillez vous connecter.");
                    router.replace('/login'); return;
                }
                setCurrentUser(user); setUserEmail(user.email || '');

                // Only fetch from profile if not already set by params (e.g., coming back from payment screen)
                if (!phoneNumber) {
                    const profile = await FirebaseUtils.getUserProfile(user.uid);
                    if (profile && profile.phoneNumber) setPhoneNumber(profile.phoneNumber);
                }
                const fetchedAddresses = await FirebaseUtils.getUserAddresses();
                setUserAddresses(fetchedAddresses);
            } catch (error) { console.error('Error fetching initial user data:', error); }
        };
        loadInitialUserData();
    }, [router]); // Removed phoneNumber from deps to avoid re-fetching if it's passed via params

    // Effect 2: Handle product data (from params or Firebase cart) & set initial selectedAddress
    // This effect is crucial for initializing the cartItems and selectedAddress correctly.
    useEffect(() => {
        const initializeCartAndAddress = async () => {
            setIsLoading(true);
            let itemsToSet = [];
            let subTotalToSet = 0;
            let addressToSelect = null; // Candidate for selectedAddress

            console.log("CheckoutScreen Effect 2 - Params:", params);

            // --- Product/Cart Loading ---
            // 1. Prioritize `persistedProductData` (detailed object from ProductDetailModal via CuisineDetailScreen)
            if (params.persistedProductData) {
                try {
                    const productDetailsFromModal = JSON.parse(params.persistedProductData as string);

                    const quantity = Number(productDetailsFromModal.quantity) || 1;
                    const itemPriceWithAddons = Number(productDetailsFromModal.itemPriceWithAddons) || 0;
                    const itemSubtotalCalc = itemPriceWithAddons * quantity;

                    // Ensure we properly capture the addons and variations
                    const selectedAddons = productDetailsFromModal.selectedAddons || [];
                    const selectedVariations = productDetailsFromModal.selectedVariations || [];

                    itemsToSet = [{
                        productId: productDetailsFromModal.productId,
                        name: productDetailsFromModal.productName,
                        quantity: quantity,
                        priceAtPurchase: Number(productDetailsFromModal.basePrice) || 0,
                        selectedAddons: selectedAddons,
                        selectedVariations: selectedVariations,
                        itemSubtotal: isNaN(itemSubtotalCalc) ? 0 : itemSubtotalCalc,
                        image: productDetailsFromModal.imageUri ? { uri: productDetailsFromModal.imageUri } : null,
                        restaurantId: productDetailsFromModal.restaurantId,
                        cuisineId: productDetailsFromModal.cuisineId,
                    }];

                    subTotalToSet = isNaN(itemSubtotalCalc) ? 0 : itemSubtotalCalc;
                } catch (e) {
                    console.error('Error parsing persistedProductData for single item:', e);
                }
            }

            // 2. Fallback to legacy single product params if persistedProductData isn't there or fails
            else if (itemsToSet.length === 0 && params.id && params.productName && params.quantity) {
                console.log("Checkout using legacy single product params.");
                const quantity = parseInt(params.quantity as string, 10) || 1;
                // IMPORTANT: Assume params.addons and params.variations are JSON strings of arrays: [{id, name, price}, ...]
                const addonsParam = params.addons ? JSON.parse(params.addons as string) : [];
                const variationsParam = params.variations ? JSON.parse(params.variations as string) : [];
                const productPrice = parseFloat(params.productPrice as string || params.price as string) || 0;

                let itemPriceWithOptions = productPrice;
                addonsParam.forEach(a => itemPriceWithOptions += (parseFloat(a.price) || 0));
                variationsParam.forEach(v => itemPriceWithOptions += (parseFloat(v.price) || 0));
                const itemSubtotalCalc = itemPriceWithOptions * quantity;

                itemsToSet = [{
                    productId: params.id as string, name: params.productName as string, quantity, priceAtPurchase: productPrice,
                    selectedAddons: addonsParam, selectedVariations: variationsParam, itemSubtotal: itemSubtotalCalc,
                    image: params.image ? { uri: params.image as string } : null,
                }];
                subTotalToSet = itemSubtotalCalc;
            }

            // 3. If still no items, load full cart from Firebase
            if (itemsToSet.length === 0) {
                console.log("Checkout loading full cart from Firebase.");
                try {
                    const firebaseItems = await FirebaseUtils.getCartItems(); // Ensure this returns detailed items
                    itemsToSet = firebaseItems; // getCartItems should map to the detailed structure
                    subTotalToSet = await FirebaseUtils.getCartTotal(); // This should sum itemSubtotals
                    if (firebaseItems.length === 0) console.log("Cart is empty after Firebase load.");
                } catch (cartError) { console.error('Error loading cart from Firebase:', cartError); }
            }
            setCartItems(itemsToSet);
            setSubTotalAmount(subTotalToSet);

            // --- Address Selection Logic ---
            // Prioritize address coming back from map or payment screen
            if (params.selectedAddress) { // From PaymentScreen back navigation
                try { addressToSelect = JSON.parse(params.selectedAddress as string); }
                catch (e) { console.error("Error parsing selectedAddress from params", e); }
            } else if (params.locationSelected === 'true' && params.latitude && params.longitude && params.address) { // From MapScreen
                addressToSelect = {
                    id: `map-${Date.now()}`, label: params.address as string, address: params.address as string,
                    latitude: parseFloat(params.latitude as string), longitude: parseFloat(params.longitude as string),
                    instructions: params.notes as string || '', isDefault: false, fromMap: true,
                };
            } else if (userAddresses && userAddresses.length > 0 && !selectedAddress) { // Default from user's saved addresses (only if nothing else is selected)
                addressToSelect = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
            }

            if(addressToSelect) setSelectedAddress(addressToSelect);
            // If address came from map, ensure delivery option is home delivery
            if (addressToSelect && addressToSelect.fromMap && deliveryOption !== 'homeDelivery') {
                setDeliveryOption('homeDelivery');
            }
            setIsLoading(false);
        };

        if (currentUser !== null && userAddresses !== null) { // Ensure base user data is loaded
            initializeCartAndAddress();
        }
        // Critical: Ensure all `params` that influence this logic are in the dependency array.
        // Stringify complex objects from params if the object identity changes on each render from router.
    }, [
        currentUser, userAddresses,
        params.persistedProductData, params.id, params.productName, params.quantity, params.addons, params.variations, params.productPrice, params.price, params.image,
        params.locationSelected, params.latitude, params.longitude, params.address, params.notes,
        params.selectedAddress // This param comes from PaymentScreen or MapScreen (if you pass it back stringified)
    ]);


    // Effect 3: Calculate Grand Total
    useEffect(() => {
        const tipNum = parseFloat(String(tipAmount)) || 0;
        const fee = deliveryOption === 'homeDelivery' ? 0 : 0;
        setGrandTotal(subTotalAmount + tipNum + fee);
    }, [subTotalAmount, tipAmount, deliveryOption]);

    const handleSelectTip = (amount) => { /* ... same ... */
        if (tipAmount === amount) { setTipAmount(null); setCustomTip(''); }
        else { setTipAmount(amount); setCustomTip(amount.toString()); }
    };
    const handleCustomTipChange = (text) => { /* ... same ... */
        setCustomTip(text);
        const numValue = parseFloat(text);
        if (!isNaN(numValue) && numValue >= 0) setTipAmount(numValue);
        else setTipAmount(null);
    };

    const navigateToLocationSelection = () => {
        // Consolidate all product related params to pass TO the map screen
        let productParamsToPass = {};
        if (params.persistedProductData) { // If initial load was from persistedProductData
            productParamsToPass.persistedProductData = params.persistedProductData;
        } else if (params.id) { // If initial load was from legacy single product params
            productParamsToPass = {
                id: params.id, productName: params.productName, quantity: params.quantity,
                productPrice: params.productPrice, price: params.price, addons: params.addons,
                variations: params.variations, image: params.image
            };
        }
        // If cart was loaded from Firebase, no specific product param needs to be passed unless you want to re-center map on first item

        router.push({
            pathname: '/mapLocationScreen', // Your map screen route name
            params: {
                source: 'checkout',
                // Pass current selected location to pre-fill map if available
                ...(selectedAddress && (selectedAddress.latitude) && { // Check for latitude as an indicator of a valid location object
                    latitude: selectedAddress.latitude?.toString(),
                    longitude: selectedAddress.longitude?.toString(),
                    address: selectedAddress.address,
                    notes: selectedAddress.instructions
                }),
                ...productParamsToPass, // Pass product data if it was the source for this checkout session
                // Pass other current form states so they can be restored if user comes back
                phoneNumber, deliveryOption, tipAmount: tipAmount?.toString() || '', customTip, additionalNote, paymentMethod,
                // No need to pass selectedAddress stringified here, map will return new one.
                // But if map screen needs to know what was *previously* selected (even if not from map), you could pass it.
            }
        });
    };

    const handlePlaceOrder = async () => {
        // Validations... (same as before)
        if (placingOrder) return;
        if (!currentUser || !userEmail) { Alert.alert("Erreur Utilisateur", "Données utilisateur non chargées."); return; }
        if (!phoneNumber.trim() || !/^\+?[0-9\s-]{7,20}$/.test(phoneNumber.trim())) { Alert.alert("Numéro Invalide", "Veuillez entrer un numéro de téléphone valide."); return; }
        if (deliveryOption === 'homeDelivery' && (!selectedAddress || !selectedAddress.address || selectedAddress.latitude == null || selectedAddress.longitude == null)) { Alert.alert("Adresse Incomplète", "Adresse de livraison complète requise (avec coords)."); return; }
        if (cartItems.length === 0) { Alert.alert("Panier Vide", "Votre panier est vide."); return; }
        if (!agreedToTerms) { Alert.alert("Conditions", "Veuillez accepter les conditions générales."); return; }
        if (!paymentMethod) { Alert.alert("Paiement", "Veuillez sélectionner un mode de paiement."); return; }

        setPlacingOrder(true);

        // Ensure cartItems are structured correctly for the order
        const orderItemsPayload = cartItems.map(item => ({
            productId: item.productId || item.id,
            name: item.name,
            quantity: Number(item.quantity) || 1,
            priceAtPurchase: Number(item.priceAtPurchase || item.price) || 0,
            selectedAddons: item.selectedAddons || [], // Should be array of {id, name, price}
            selectedVariations: item.selectedVariations || [], // Should be array of {id, name, price}
            itemSubtotal: Number(item.itemSubtotal) || 0, // This should be (priceAtPurchase + addonsTotal + variationsTotal) * quantity
            image: item.image?.uri || (typeof item.image === 'string' ? item.image : null),
            restaurantId: item.restaurantId,
            cuisineId: item.cuisineId,
        }));

        // Calculate the correct grand total from all components
        const tipAmountValue = parseFloat(String(tipAmount)) || 0;
        const deliveryFeeValue = deliveryOption === 'homeDelivery' ? 0 : 0;
        const calculatedGrandTotal = subTotalAmount + tipAmountValue + deliveryFeeValue;

        const orderDetailsForFirebase = {
            userEmail: userEmail,
            phoneNumber: phoneNumber.trim(),
            items: orderItemsPayload,
            subTotalAmount: subTotalAmount,
            tipAmount: tipAmountValue,
            deliveryFee: deliveryFeeValue,
            grandTotal: calculatedGrandTotal, // Use the calculated value
            deliveryOption: deliveryOption,
            shippingAddress: deliveryOption === 'homeDelivery' && selectedAddress ? {
                address: selectedAddress.address,
                latitude: selectedAddress.latitude,
                longitude: selectedAddress.longitude,
                instructions: selectedAddress.instructions || additionalNote,
                label: selectedAddress.label || '',
            } : null,
            orderNotes: additionalNote,
            paymentMethod: paymentMethod,
        };

        if (paymentMethod === 'online_payment') {
            console.log("Navigating to Payment Screen with order details...");
            router.push({
                pathname: '/payment', // Your payment screen route
                params: {
                    totalAmount: calculatedGrandTotal.toFixed(2), // Use the calculated value
                    serializedOrderData: JSON.stringify(orderDetailsForFirebase),
                    // Pass current checkout state for potential back navigation
                    persistedProductData: params.persistedProductData,
                    id: params.id,
                    productName: params.productName,
                    quantity: params.quantity,
                    productPrice: params.productPrice,
                    addons: params.addons,
                    variations: params.variations,
                    image: params.image,
                    selectedAddress: JSON.stringify(selectedAddress),
                    phoneNumber,
                    deliveryOption,
                    tipAmount: tipAmount?.toString() || '',
                    customTip,
                    additionalNote,
                }
            });
            setPlacingOrder(false);
            return;
        }

        // --- For Cash on Delivery ---
        try {
            const finalCodOrderData = {
                ...orderDetailsForFirebase,
                paymentMethod: 'cash_on_delivery',
                paymentDetails: { status: 'pending_cod', message: 'Paiement à la livraison' },
                status: 'pending',
            };
            console.log("--- Placing COD Order (CheckoutScreen) ---", JSON.stringify(finalCodOrderData, null, 2));
            const newOrderId = await FirebaseUtils.createOrder(finalCodOrderData);
            await FirebaseUtils.clearCart();
            Alert.alert("Commande Réussie!", `Votre commande #${newOrderId.substring(0, 6)}... a été enregistrée.`);
            router.replace({ pathname: '/order-confirmation', params: { orderId: newOrderId } });
        } catch (error) {
            console.error("Error placing COD order:", error);
            Alert.alert("Erreur de Commande", `Impossible de passer la commande: ${error.message}.`);
        } finally {
            setPlacingOrder(false);
        }
    };

   // --- Enhanced Render Logic (Improved UX/UI) ---
if (isLoading) { 
    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <LinearGradient 
                colors={['#0f172a', '#1e293b']} 
                className="flex-1 justify-center items-center"
            >
                <View className="bg-gray-800/30 backdrop-blur-xl rounded-3xl p-8 mx-6 border border-gray-700/50">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-6 text-lg font-medium text-center">
                        Chargement du checkout...
                    </Text>
                    <View className="w-32 h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
                        <View className="w-1/2 h-full bg-orange-500 rounded-full" />
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

if (!isLoading && cartItems.length === 0) { 
    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <LinearGradient colors={['#0f172a', '#1e293b']} className="flex-1">
                {/* Enhanced Header */}
                <View className="flex-row items-center px-4 py-6 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
                    <TouchableOpacity 
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
                        className="w-10 h-10 rounded-full bg-gray-800/60 items-center justify-center mr-4"
                    >
                        <Feather name="arrow-left" size={22} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Panier</Text>
                </View>

                {/* Empty State */}
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 items-center border border-gray-700/30">
                        <View className="w-24 h-24 rounded-full bg-orange-500/10 items-center justify-center mb-6">
                            <Feather name="shopping-bag" size={48} color="#F97316" />
                        </View>
                        <Text className="text-white text-2xl font-bold mb-3 text-center">
                            Panier vide
                        </Text>
                        <Text className="text-gray-400 text-center mb-8 text-base leading-6">
                            Découvrez nos délicieux plats{'\n'}et créez votre première commande
                        </Text>
                        <TouchableOpacity 
                            onPress={() => router.replace('/(tabs)')} 
                            className="bg-orange-500 w-full py-4 rounded-xl shadow-lg active:bg-orange-600"
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                Explorer les Menus
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

return (
    <SafeAreaView className="flex-1 bg-gray-950 gap-3 ">
        <LinearGradient colors={['#0f172a', '#1e293b']} className="absolute inset-0" />
        
        {/* Enhanced Header */}
        <View className="flex-row items-center px-4 py-6 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
            <TouchableOpacity 
                onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
                className="w-10 h-10 rounded-full bg-gray-800/60 items-center justify-center mr-4"
            >
                <Feather name="arrow-left" size={22} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
                <Text className="text-white text-xl font-bold">Finaliser la Commande</Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                    {cartItems.length} article{cartItems.length > 1 ? 's' : ''} • {subTotalAmount.toFixed(2)} MAD
                </Text>
            </View>
        </View>

        <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerClassName="pb-36"
            className="flex-1"
        >
            <View className="p-4 space-y-6">
                

                {/* Contact Info Section - Enhanced */}
                <View className="bg-gray-800/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/30">
                    <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                            <Feather name="user" size={16} color="#3B82F6" />
                        </View>
                        <Text className="text-lg font-bold text-white">Vos Coordonnées</Text>
                    </View>
                    
                    <View className="space-y-4">
                        <View>
                            <Text className="text-gray-300 font-medium mb-2">Email</Text>
                            <View className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                                <TextInput 
                                    className="text-gray-300 text-base" 
                                    value={userEmail} 
                                    editable={false} 
                                />
                            </View>
                        </View>
                        <PhoneNumberInput value={phoneNumber} onChangeText={setPhoneNumber} />
                    </View>
                </View>

                {/* Delivery Options Section - Enhanced */}
                <View className="bg-gray-800/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/30">
                    {/* <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                            <Feather name="truck" size={16} color="#F97316" />
                        </View>
                        <Text className="text-lg font-bold text-white">Mode de Livraison</Text>
                    </View> */}
                    
                    <View className="space-y-3">
                        
                        
                        {/* <TouchableOpacity
                            className={`flex-row items-center p-4 rounded-xl border-2 ${
                                deliveryOption === 'takeAway' 
                                    ? 'border-orange-500 bg-orange-500/10' 
                                    : 'border-gray-600/50 bg-gray-700/30'
                            }`}
                            onPress={() => setDeliveryOption('takeAway')} 
                            activeOpacity={0.7}
                        >
                            <RadioButton selected={deliveryOption === 'takeAway'} />
                            <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center mx-3">
                                <MaterialIcons 
                                    name="storefront" 
                                    size={20} 
                                    color={deliveryOption === 'takeAway' ? "#F97316" : "#9CA3AF"} 
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold text-base ${
                                    deliveryOption === 'takeAway' ? 'text-orange-400' : 'text-gray-200'
                                }`}>
                                    À emporter
                                </Text>
                                <Text className="text-gray-400 text-sm mt-0.5">
                                    Prêt en 15-20 min
                                </Text>
                            </View>
                        </TouchableOpacity> */}
                    </View>
                </View>

                {/* Delivery Address Section - Enhanced */}
                {deliveryOption === 'homeDelivery' && (
                    <View className="bg-gray-800/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/30">
                        <View className="flex-row items-center mb-4 ">
                            <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center mr-3">
                                <Feather name="map-pin" size={16} color="#10B981" />
                            </View>
                            <Text className="text-lg font-bold text-white">Adresse de Livraison</Text>
                        </View>
                        
                        {selectedAddress && selectedAddress.address ? (
                            <View className="mb-4 p-4 bg-gray-700/40 rounded-xl border border-gray-600/30">
                                <View className="flex-row items-start">
                                    <View className="w-6 h-6 rounded-full bg-green-500/20 items-center justify-center mr-3 mt-0.5">
                                        <Feather name="check" size={14} color="#10B981" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-green-400 font-bold text-base">
                                            {selectedAddress.label || 'Adresse Sélectionnée'}
                                        </Text>
                                        <Text className="text-gray-200 mt-1 text-sm leading-5">
                                            {selectedAddress.address}
                                        </Text>
                                        {selectedAddress.instructions && (
                                            <Text className="text-gray-400 text-xs mt-2 italic">
                                                📝 {selectedAddress.instructions}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View className="mb-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                                <View className="flex-row items-center">
                                    <Feather name="alert-circle" size={18} color="#EF4444" />
                                    <Text className="text-red-400 text-sm ml-2">
                                        Veuillez sélectionner une adresse de livraison
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        <TouchableOpacity 
                            className="bg-orange-500 py-4 px-4 rounded-xl items-center justify-center flex-row shadow-lg active:bg-orange-600" 
                            onPress={navigateToLocationSelection}
                        >
                            <Feather name="map-pin" size={18} color="white" />
                            <Text className="text-white font-bold text-base ml-2">
                                {selectedAddress && selectedAddress.address ? 'Modifier l\'adresse' : 'Choisir sur la carte'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Additional Notes Section - Enhanced */}
                {/* <View className="bg-gray-800/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/30">
                    <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                            <Feather name="edit-3" size={16} color="#8B5CF6" />
                        </View>
                        <Text className="text-lg font-bold text-white">Notes pour la commande</Text>
                    </View>
                    
                    <TextInput
                        className="bg-gray-700/40 text-white p-4 rounded-xl h-24 border border-gray-600/50 focus:border-orange-500 text-base"
                        multiline 
                        placeholder="Allergies, instructions de livraison..."
                        placeholderTextColor="#9CA3AF" 
                        value={additionalNote} 
                        onChangeText={setAdditionalNote}
                        textAlignVertical="top"
                    />
                </View> */}

                {/* Payment Method Section - Enhanced */}
                <View className="bg-gray-800/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/30">
                    <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                            <Feather name="credit-card" size={16} color="#10B981" />
                        </View>
                        <Text className="text-lg font-bold text-white">Mode de Paiement</Text>
                    </View>
                    
                    <TouchableOpacity
                        className={`flex-row items-center p-4 rounded-xl border-2 ${
                            paymentMethod === 'cash_on_delivery' 
                                ? 'border-orange-500 bg-orange-500/10' 
                                : 'border-gray-600/50 bg-gray-700/30'
                        }`}
                        onPress={() => setPaymentMethod('cash_on_delivery')} 
                        activeOpacity={0.7}
                    >
                        <RadioButton selected={paymentMethod === 'cash_on_delivery'} />
                        <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center mx-3">
                            <FontAwesome5 
                                name="money-bill-wave" 
                                size={16} 
                                color={paymentMethod === 'cash_on_delivery' ? "#F97316" : "#9CA3AF"} 
                            />
                        </View>
                        <View className="flex-1">
                            <Text className={`font-bold text-base ${
                                paymentMethod === 'cash_on_delivery' ? 'text-orange-400' : 'text-gray-200'
                            }`}>
                                Paiement à la livraison
                            </Text>
                            <Text className="text-gray-400 text-sm mt-0.5">
                                Espèces uniquement
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Final Total Section - Enhanced
                <View className="bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/30 shadow-xl">
                    <Text className="text-white text-lg font-bold mb-4">Récapitulatif</Text>
                    
                    <View className="space-y-3">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-300 text-base">Sous-total articles:</Text>
                            <Text className="text-white text-base font-semibold">
                                {subTotalAmount.toFixed(2)} MAD
                            </Text>
                        </View>
                        
                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-300 text-base">Pourboire:</Text>
                            <Text className="text-white text-base font-semibold">
                                {(parseFloat(String(tipAmount)) || 0).toFixed(2)} MAD
                            </Text>
                        </View>
                        
                        {deliveryOption === 'homeDelivery' && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-300 text-base">Frais de livraison:</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-green-400 text-xs font-medium mr-2">GRATUIT</Text>
                                    <Text className="text-white text-base font-semibold">
                                        0.00 MAD
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        <View className="border-t border-gray-600/50 my-2" />
                        
                        <View className="flex-row justify-between items-center py-2 bg-orange-500/10 rounded-xl px-3">
                            <Text className="text-white text-xl font-bold">Total à Payer:</Text>
                            <Text className="text-orange-400 text-2xl font-bold">
                                {grandTotal.toFixed(2)} MAD
                            </Text>
                        </View>
                    </View>
                </View> */}

                {/* Terms and Conditions - Enhanced */}
                <View className="flex-row items-start px-1 py-2">
                    <Checkbox checked={agreedToTerms} onPress={() => setAgreedToTerms(!agreedToTerms)} />
                    <Text className="text-gray-400 ml-3 flex-1 text-sm leading-5">
                        J'ai lu et j'accepte les{' '}
                        <Text className="text-orange-400 underline font-medium">
                            Conditions Générales
                        </Text>.
                    </Text>
                </View>
                {/* Order Summary - Enhanced */}
                <View className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/30 overflow-hidden">
                    <TouchableOpacity 
                        onPress={() => setShowOrderSummaryDetails(!showOrderSummaryDetails)} 
                        className="flex-row justify-between items-center p-5"
                    >
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-white">
                                Résumé de commande
                            </Text>
                            <Text className="text-orange-400 text-sm font-medium mt-1">
                                {cartItems.length} article{cartItems.length > 1 ? 's' : ''} • {subTotalAmount.toFixed(2)} MAD
                            </Text>
                        </View>
                        <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center">
                            <Feather 
                                name={showOrderSummaryDetails ? "chevron-up" : "chevron-down"} 
                                size={18} 
                                color="#F97316" 
                            />
                        </View>
                    </TouchableOpacity>

                    {showOrderSummaryDetails && (
                        <View className="px-5 pb-5 border-t border-gray-700/30">
                            <View className="space-y-4 mt-4">
                                {cartItems.map((item, index) => (
                                    <View 
                                        key={item.productId || item.id || `item-${index}`} 
                                        className="flex-row items-start py-3 border-b border-gray-700/20 last:border-b-0"
                                    >
                                        <View className="w-16 h-16 rounded-xl mr-4 overflow-hidden bg-gray-700">
                                            {item.image && item.image.uri ? (
                                                <Image source={item.image} className="w-full h-full" />
                                            ) : (
                                                <View className="w-full h-full items-center justify-center">
                                                    <Feather name="image" size={20} color="#9CA3AF"/>
                                                </View>
                                            )}
                                        </View>
                                        
                                        <View className="flex-1 mr-3">
                                            <Text className="text-white font-semibold text-base" numberOfLines={2}>
                                                {item.name}
                                            </Text>
                                            <View className="flex-row items-center mt-1 space-x-3">
                                                <Text className="text-gray-400 text-sm">
                                                    Qté: {item.quantity}
                                                </Text>
                                                <Text className="text-gray-400 text-sm">
                                                    {Number(item.priceAtPurchase).toFixed(2)} MAD/u
                                                </Text>
                                            </View>

                                            {(item.selectedVariations && item.selectedVariations.length > 0) && (
                                                <View className="mt-2 p-2 bg-blue-500/10 rounded-lg">
                                                    <Text className="text-blue-300 text-xs font-medium mb-1">Variations:</Text>
                                                    {item.selectedVariations.map(v => (
                                                        <Text key={v.id} className="text-blue-400 text-xs">
                                                            • {v.name} (+{Number(v.price).toFixed(2)} MAD)
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                            
                                            {(item.selectedAddons && item.selectedAddons.length > 0) && (
                                                <View className="mt-2 p-2 bg-green-500/10 rounded-lg">
                                                    <Text className="text-green-300 text-xs font-medium mb-1">Suppléments:</Text>
                                                    {item.selectedAddons.map(addon => (
                                                        <Text key={addon.id} className="text-green-400 text-xs">
                                                            • {addon.name} (+{Number(addon.price).toFixed(2)} MAD)
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                        
                                        <Text className="text-white font-bold text-lg">
                                            {Number(item.itemSubtotal).toFixed(2)} MAD
                                        </Text>
                                    </View>
                                ))}
                                
                                <View className="pt-4 mt-2 border-t border-gray-700/30">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-300 font-medium">Sous-total:</Text>
                                        <Text className="text-white text-xl font-bold">
                                            {subTotalAmount.toFixed(2)} MAD
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>

        {/* Enhanced Bottom Button */}
        <View className={`px-4 pt-4 pb-${Platform.OS === 'ios' ? '8' : '4'} bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50`}>
            <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={placingOrder || isLoading || cartItems.length === 0}
                className={`py-4 rounded-2xl items-center justify-center shadow-xl ${
                    (placingOrder || isLoading || cartItems.length === 0) 
                        ? 'bg-gray-600 opacity-70' 
                        : 'bg-orange-500 active:bg-orange-600'
                }`}
            >
                {placingOrder ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-lg font-bold">
                        {paymentMethod === 'online_payment' 
                            ? `Continuer vers Paiement (${grandTotal.toFixed(2)} MAD)` 
                            : `Passer la Commande (${grandTotal.toFixed(2)} MAD)`
                        }
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    </SafeAreaView>
);
}
