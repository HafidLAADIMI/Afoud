import { Platform } from 'react-native';


// Check if the current platform supports certain native features
export const supportsNativeFeatures = Platform.OS !== 'web';

// Safely import native modules
export const safeImport = (modulePath) => {
    if (supportsNativeFeatures) {
        try {
            return require(modulePath);
        } catch (error) {
            console.warn(`Failed to import ${modulePath}:`, error);
            return null;
        }
    }
    return null;
};

// Use this to conditionally import react-native-maps
export const getMapsModule = () => {
    if (!supportsNativeFeatures) {
        return {
            default: null,
            Marker: null,
            PROVIDER_GOOGLE: null
        };
    }

    try {
        const Maps = require('react-native-maps');
        return {
            default: Maps.default,
            Marker: Maps.Marker,
            PROVIDER_GOOGLE: Maps.PROVIDER_GOOGLE
        };
    } catch (error) {
        console.warn('Failed to load react-native-maps:', error);
        return {
            default: null,
            Marker: null,
            PROVIDER_GOOGLE: null
        };
    }
};

// Display platform-appropriate components
export const PlatformSpecific = ({ webComponent, nativeComponent }) => {
    return Platform.OS === 'web' ? webComponent : nativeComponent;
};