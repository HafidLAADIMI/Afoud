import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for location data
const LOCATION_STORAGE_KEY = 'user_selected_location';

// Location data type
export type LocationData = {
    address: string;
    latitude: number;
    longitude: number;
};

// Context type
type LocationContextType = {
    locationData: LocationData | null;
    setLocation: (data: LocationData) => Promise<void>;
    clearLocation: () => Promise<void>;
};

// Default location (can be customized)
const DEFAULT_LOCATION: LocationData = {
    address: 'Set Location',
    latitude: 37.7749,
    longitude: -122.4194, // Default coordinates (example: San Francisco)
};

// Create the context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Create the provider component
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State for location data
    const [locationData, setLocationData] = useState<LocationData | null>(null);

    // Load location data from storage on mount
    useEffect(() => {
        const loadSavedLocation = async () => {
            try {
                const savedLocationJson = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
                if (savedLocationJson) {
                    const savedLocation = JSON.parse(savedLocationJson);
                    setLocationData(savedLocation);
                }
            } catch (error) {
                console.error('Error loading location data:', error);
            }
        };

        loadSavedLocation();
    }, []);

    // Save location to storage and update state
    const setLocation = async (data: LocationData) => {
        try {
            await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(data));
            setLocationData(data);
        } catch (error) {
            console.error('Error saving location data:', error);
        }
    };

    // Clear location data
    const clearLocation = async () => {
        try {
            await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
            setLocationData(null);
        } catch (error) {
            console.error('Error clearing location data:', error);
        }
    };

    // Context value
    const value = {
        locationData,
        setLocation,
        clearLocation,
    };

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

// Create a hook to use the location context
export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

export default LocationContext;