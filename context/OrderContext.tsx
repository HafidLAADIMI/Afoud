import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const STORAGE_KEYS = {
    LOCATION: 'app_selected_location',
    PAYMENT: 'app_payment_method',
    ORDER: 'app_current_order',
};

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    // Location state
    const [selectedLocation, setSelectedLocation] = useState({
        latitude: 32.3373,  // Default coordinates for Beni Mellal
        longitude: -6.3498,
        address: '8MW5+8JW, Beni-Mellal, Morocco',
        notes: '',
    });

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState(null);

    // Order state
    const [currentOrder, setCurrentOrder] = useState({
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        orderId: null,
        status: 'draft',
    });

    // Terms and conditions acceptance
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Load saved data on initial render
    useEffect(() => {
        const loadSavedData = async () => {
            try {
                // Load location
                const locationData = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
                if (locationData) {
                    setSelectedLocation(JSON.parse(locationData));
                }

                // Load payment method
                const paymentData = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT);
                if (paymentData) {
                    setPaymentMethod(JSON.parse(paymentData));
                }

                // Load current order
                const orderData = await AsyncStorage.getItem(STORAGE_KEYS.ORDER);
                if (orderData) {
                    setCurrentOrder(JSON.parse(orderData));
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        };

        loadSavedData();
    }, []);

    // Save location when it changes
    useEffect(() => {
        const saveLocation = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(selectedLocation));
            } catch (error) {
                console.error('Error saving location:', error);
            }
        };

        saveLocation();
    }, [selectedLocation]);

    // Save payment method when it changes
    useEffect(() => {
        const savePaymentMethod = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT, JSON.stringify(paymentMethod));
            } catch (error) {
                console.error('Error saving payment method:', error);
            }
        };

        savePaymentMethod();
    }, [paymentMethod]);

    // Save order when it changes
    useEffect(() => {
        const saveOrder = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.ORDER, JSON.stringify(currentOrder));
            } catch (error) {
                console.error('Error saving order:', error);
            }
        };

        saveOrder();
    }, [currentOrder]);

    // Method to update location
    const updateLocation = (location) => {
        setSelectedLocation(location);
    };

    // Method to update payment method
    const updatePaymentMethod = (method) => {
        setPaymentMethod(method);
    };

    // Method to update order
    const updateOrder = (orderData) => {
        setCurrentOrder({
            ...currentOrder,
            ...orderData,
        });
    };

    // Method to clear order after completion
    const clearOrder = async () => {
        try {
            setCurrentOrder({
                items: [],
                subtotal: 0,
                deliveryFee: 0,
                total: 0,
                orderId: null,
                status: 'draft',
            });
            setPaymentMethod(null);
            await AsyncStorage.removeItem(STORAGE_KEYS.ORDER);
            await AsyncStorage.removeItem(STORAGE_KEYS.PAYMENT);
        } catch (error) {
            console.error('Error clearing order:', error);
        }
    };

    return (
        <OrderContext.Provider
            value={{
                selectedLocation,
                updateLocation,
                paymentMethod,
                updatePaymentMethod,
                currentOrder,
                updateOrder,
                clearOrder,
                agreedToTerms,
                setAgreedToTerms,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

// Hook for using the order context
export const useOrder = () => useContext(OrderContext);