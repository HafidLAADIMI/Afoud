// utils/locationManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for location data
export const LOCATION_STORAGE_KEY = 'user_selected_location';

// Default location
export const DEFAULT_LOCATION = {
    address: 'Beni-Mellal, Morocco',
    latitude: '32.3373',
    longitude: '-6.3498'
};

// Save location data
export const saveLocation = async (locationData: {
    address: string;
    latitude: string | number;
    longitude: string | number;
    notes?: string;
    source?: string; // Add source to track where the location was set from
}) => {
    try {
        // Check if we have a source and it's checkout
        const isFromCheckout = locationData.source === 'checkout';

        // If this location update is from checkout, save it separately
        if (isFromCheckout) {
            const formattedData = {
                address: locationData.address,
                latitude: String(locationData.latitude),
                longitude: String(locationData.longitude),
                notes: locationData.notes || ''
            };

            await AsyncStorage.setItem('checkout_location', JSON.stringify(formattedData));
            console.log('Checkout location saved:', formattedData);
            return true;
        }

        // Otherwise, save as regular location
        const formattedData = {
            address: locationData.address,
            latitude: String(locationData.latitude),
            longitude: String(locationData.longitude),
            notes: locationData.notes || ''
        };

        await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(formattedData));
        console.log('Location saved successfully:', formattedData);
        return true;
    } catch (error) {
        console.error('Error saving location:', error);
        return false;
    }
};

// Get location data
export const getLocation = async (source?: string) => {
    try {
        // If we're getting location for checkout, check for checkout-specific location first
        if (source === 'checkout') {
            const checkoutLocation = await AsyncStorage.getItem('checkout_location');
            if (checkoutLocation) {
                return JSON.parse(checkoutLocation);
            }
        }

        // Otherwise, get general location
        const savedLocationJson = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);

        if (savedLocationJson) {
            return JSON.parse(savedLocationJson);
        } else {
            // Save and return default location if none exists
            await saveLocation(DEFAULT_LOCATION);
            return DEFAULT_LOCATION;
        }
    } catch (error) {
        console.error('Error getting location:', error);
        return DEFAULT_LOCATION;
    }
};

// Clear checkout location
export const clearCheckoutLocation = async () => {
    try {
        await AsyncStorage.removeItem('checkout_location');
        return true;
    } catch (error) {
        console.error('Error clearing checkout location:', error);
        return false;
    }
};