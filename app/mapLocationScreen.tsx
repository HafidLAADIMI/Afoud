// 1. TEMPORARY TEST: Remove all restrictions from your Google Maps API keys
// Go to Google Cloud Console > APIs & Services > Credentials
// Edit both API keys and temporarily set:
// - Application restrictions: None
// - API restrictions: Don't restrict key
// Test if maps work, then gradually add restrictions back

// 2. Check required APIs are enabled:
// ✅ Maps SDK for Android
// ✅ Maps SDK for iOS
// ✅ Geocoding API (for your reverse geocoding)
// ✅ Places API (if using search)

// 3. Update your MapLocationScreen with better error handling:

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    TextInput,
    Keyboard,
    ActivityIndicator,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocation } from "@/context/LocationContext";

const INITIAL_REGION_FALLBACK = {
    latitude: 33.5731, // Casablanca coordinates (your app location)
    longitude: -7.5898,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

export default function MapLocationScreen() {
    const params = useLocalSearchParams();
    const mapRef = useRef(null);

    const [initialRegion, setInitialRegion] = useState(null);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [selectedAddressString, setSelectedAddressString] = useState('Déplacement de la carte...');
    const [searchQuery, setSearchQuery] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [mapError, setMapError] = useState(false);

    const { setLocation } = useLocation();
    const [checkoutParamsToPassBack, setCheckoutParamsToPassBack] = useState({});

    // Add map error handler
    const handleMapError = (error) => {
        console.error('Map Error:', error);
        setMapError(true);
        setErrorMsg('Erreur de chargement de la carte. Vérifiez votre connexion internet.');
    };

    useEffect(() => {
        const { source, latitude, longitude, address, locationSelected, ...rest } = params;
        setCheckoutParamsToPassBack(rest);

        let lat = parseFloat(params.latitude);
        let lng = parseFloat(params.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            (async () => {
                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        setErrorMsg('Permission d\'accès à la localisation refusée.');
                        setInitialRegion(INITIAL_REGION_FALLBACK);
                        setCurrentRegion(INITIAL_REGION_FALLBACK);
                        setSelectedCoordinates({
                            latitude: INITIAL_REGION_FALLBACK.latitude,
                            longitude: INITIAL_REGION_FALLBACK.longitude
                        });
                        if (params.address) setSelectedAddressString(params.address);
                        else reverseGeocode(INITIAL_REGION_FALLBACK.latitude, INITIAL_REGION_FALLBACK.longitude);
                        return;
                    }

                    let location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                        timeout: 10000 // 10 second timeout
                    });
                    const currentCoords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    };
                    setInitialRegion({...currentCoords, latitudeDelta: 0.01, longitudeDelta: 0.01});
                    setCurrentRegion({...currentCoords, latitudeDelta: 0.01, longitudeDelta: 0.01});
                    setSelectedCoordinates(currentCoords);
                    reverseGeocode(currentCoords.latitude, currentCoords.longitude);
                } catch (e) {
                    console.error("Error getting current position", e);
                    // Fallback to Casablanca
                    setInitialRegion(INITIAL_REGION_FALLBACK);
                    setCurrentRegion(INITIAL_REGION_FALLBACK);
                    setSelectedCoordinates({
                        latitude: INITIAL_REGION_FALLBACK.latitude,
                        longitude: INITIAL_REGION_FALLBACK.longitude
                    });
                    if (params.address) setSelectedAddressString(params.address);
                    else reverseGeocode(INITIAL_REGION_FALLBACK.latitude, INITIAL_REGION_FALLBACK.longitude);
                }
            })();
        } else {
            const validInitialRegion = {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setInitialRegion(validInitialRegion);
            setCurrentRegion(validInitialRegion);
            setSelectedCoordinates({latitude: lat, longitude: lng});
            setSelectedAddressString(params.address || 'Adresse en cours de chargement...');
            if (!params.address) {
                reverseGeocode(lat, lng);
            }
        }
    }, [params.latitude, params.longitude, params.address]);

    const reverseGeocode = useCallback(async (latitude, longitude) => {
        if (latitude == null || longitude == null) return;
        setIsGeocoding(true);
        try {
            let geocodedAddresses = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });
            if (geocodedAddresses && geocodedAddresses.length > 0) {
                const bestResult = geocodedAddresses[0];
                const formattedAddress = [
                    bestResult.streetNumber,
                    bestResult.street,
                    bestResult.city,
                    bestResult.postalCode,
                    bestResult.country
                ].filter(Boolean).join(', ');
                setSelectedAddressString(formattedAddress || 'Adresse non trouvée');
            } else {
                setSelectedAddressString('Adresse non trouvée');
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            setSelectedAddressString('Erreur de géocodage');
        } finally {
            setIsGeocoding(false);
        }
    }, []);

    const onMapRegionChangeComplete = (region) => {
        setCurrentRegion(region);
        setSelectedCoordinates({ latitude: region.latitude, longitude: region.longitude });
        reverseGeocode(region.latitude, region.longitude);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        Keyboard.dismiss();
        setIsGeocoding(true);
        try {
            let geocodedResults = await Location.geocodeAsync(searchQuery);

            if (geocodedResults && geocodedResults.length > 0) {
                const firstResult = geocodedResults[0];
                const newRegion = {
                    latitude: firstResult.latitude,
                    longitude: firstResult.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                if (mapRef.current) {
                    mapRef.current.animateToRegion(newRegion, 1000);
                }
            } else {
                Alert.alert("Recherche Infructueuse", "Aucun lieu trouvé pour votre recherche.");
            }
        } catch (error) {
            console.error("Geocoding search error:", error);
            Alert.alert("Erreur de Recherche", "Impossible d'effectuer la recherche.");
        } finally {
            setIsGeocoding(false);
        }
    };

    const handlePickLocation = async() => {
        if (!selectedCoordinates || !selectedAddressString || selectedAddressString.includes('...')) {
            Alert.alert("Sélection Incomplète", "Veuillez attendre que l'adresse soit chargée ou sélectionnez un emplacement valide.");
            return;
        }

        await setLocation({
            address: selectedAddressString,
            latitude: selectedCoordinates.latitude,
            longitude: selectedCoordinates.longitude,
        });

        const targetPath = params.source === 'checkout' ? '/checkout' : '/(protected)/(tabs)';
        router.push({
            pathname: targetPath,
            params: {
                ...checkoutParamsToPassBack,
                latitude: selectedCoordinates.latitude.toString(),
                longitude: selectedCoordinates.longitude.toString(),
                address: selectedAddressString,
                locationSelected: 'true',
            },
        });
    };

    // Show error screen if map fails to load
    if (mapError) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Feather name="map-off" size={64} color="#F97316" />
                    <Text style={styles.errorTitle}>Carte indisponible</Text>
                    <Text style={styles.errorMessage}>{errorMsg}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setMapError(false);
                            setErrorMsg(null);
                        }}
                    >
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!initialRegion) {
        return (
            <SafeAreaView style={styles.safeAreaLoading}>
                <ActivityIndicator size="large" color="#F97316" />
                <Text style={styles.loadingText}>Chargement de la carte...</Text>
                {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* Header with Search */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher une adresse..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                    {isGeocoding && searchQuery ?
                        <ActivityIndicator size="small" color="#F97316" /> :
                        <Feather name="search" size={20} color="white" />
                    }
                </TouchableOpacity>
            </View>

            {/* Map View */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={initialRegion}
                    onRegionChangeComplete={onMapRegionChangeComplete}
                    onMapReady={() => {
                        console.log('Map is ready!');
                        setMapReady(true);
                    }}
                    onError={handleMapError}
                    showsUserLocation={true}
                    showsMyLocationButton={false} // Use custom button for consistency
                    loadingEnabled={!mapReady}
                    minZoomLevel={5}
                    maxZoomLevel={19}
                    mapType="standard"
                    // Remove customMapStyle temporarily to test if it's causing issues
                    // customMapStyle={mapStyle}
                />

                {/* Center Marker */}
                {mapReady && (
                    <View style={styles.centerMarkerContainer}>
                        <Feather name="map-pin" size={40} color="#F97316" style={styles.mapPinIcon} />
                    </View>
                )}
            </View>

            {/* Selected Location Display */}
            <View style={styles.addressDisplayContainer}>
                <Feather name="map-pin" size={20} color="#F97316" style={{marginRight: 8}}/>
                {isGeocoding && selectedAddressString.includes('...') ? (
                    <ActivityIndicator size="small" color="#F97316" />
                ) : (
                    <Text style={styles.addressText} numberOfLines={2}>{selectedAddressString}</Text>
                )}
            </View>

            {/* Action Button */}
            <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                    style={[styles.pickButton, (!mapReady || isGeocoding) && styles.pickButtonDisabled]}
                    onPress={handlePickLocation}
                    disabled={!mapReady || isGeocoding}
                >
                    <Text style={styles.pickButtonText}>Choisir cet Emplacement</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#111827' },
    safeAreaLoading: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'white', marginTop: 10 },
    errorText: { color: 'red', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    errorMessage: {
        color: '#9CA3AF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    retryButton: {
        backgroundColor: '#F97316',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginBottom: 15,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: '#374151',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#1F2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#374151',
        borderRadius: 20,
        paddingHorizontal: 15,
        color: 'white',
        fontSize: 15,
        marginLeft: 8,
    },
    searchButton: { padding: 8, marginLeft: 5 },
    mapContainer: { flex: 1, backgroundColor: '#000000' },
    centerMarkerContainer: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -20,
        marginTop: -40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapPinIcon: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    addressDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    addressText: {
        color: 'white',
        fontSize: 14,
        flex: 1,
    },
    actionButtonContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 25 : 15,
        backgroundColor: '#111827',
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    pickButton: {
        backgroundColor: '#F97316',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    pickButtonDisabled: { backgroundColor: '#A0A0A0' },
    pickButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});