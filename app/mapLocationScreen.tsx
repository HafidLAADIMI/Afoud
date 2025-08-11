import  { useEffect, useRef, useState, useCallback } from 'react';
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
    latitude: 33.5360, // Center of the allowed regions
    longitude: -7.6385,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};
// Define the allowed regions in Casablanca
const ALLOWED_REGIONS = {
    "Hay Oulfa": {
        latitude: 33.5423,
        longitude: -7.6532,
        radius: 2000 // 2km radius
    },
    "Hay Hassani": {
        latitude: 33.5156,
        longitude: -7.6789,
        radius: 2000
    },
    "Lissasfa": {
        latitude: 33.5234,
        longitude: -7.6123,
        radius: 2000
    },
    "Almaz": {
        latitude: 33.5378,
        longitude: -7.6234,
        radius: 2000
    },
    "Hay Laymoun": {
        latitude: 33.5512,
        longitude: -7.6445,
        radius: 2000
    },
    "Ciel": {
        latitude: 33.5289,
        longitude: -7.6456,
        radius: 2000
    },
    "Nassim": {
        latitude: 33.5334,
        longitude: -7.6298,
        radius: 2000
    },
    "Sidi Maarouf": {
        latitude: 33.5167,
        longitude: -7.6234,
        radius: 2000
    },
    "CFC": {
        latitude: 33.5445,
        longitude: -7.6567,
        radius: 2000
    }
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
    // Function to check if coordinates are within allowed regions
    const isLocationInAllowedRegion = (latitude, longitude) => {
        for (const [regionName, region] of Object.entries(ALLOWED_REGIONS)) {
            const distance = getDistanceFromLatLonInM(
                latitude, 
                longitude, 
                region.latitude, 
                region.longitude
            );
            if (distance <= region.radius) {
                return { allowed: true, region: regionName };
            }
        }
        return { allowed: false, region: null };
    };
    // Helper function to calculate distance between two coordinates
    const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Radius of the earth in meters
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in meters
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI/180);
    };

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
                        const locationCheck = isLocationInAllowedRegion(currentCoords.latitude, currentCoords.longitude);

                if (locationCheck.allowed) {
                    setInitialRegion({...currentCoords, latitudeDelta: 0.01, longitudeDelta: 0.01});
                    setCurrentRegion({...currentCoords, latitudeDelta: 0.01, longitudeDelta: 0.01});
                    setSelectedCoordinates(currentCoords);
                    reverseGeocode(currentCoords.latitude, currentCoords.longitude);
                } else {
                    // Use fallback to Casablanca if outside service area
                    setInitialRegion(INITIAL_REGION_FALLBACK);
                    setCurrentRegion(INITIAL_REGION_FALLBACK);
                    setSelectedCoordinates({
                        latitude: INITIAL_REGION_FALLBACK.latitude,
                        longitude: INITIAL_REGION_FALLBACK.longitude
                    });
                    reverseGeocode(INITIAL_REGION_FALLBACK.latitude, INITIAL_REGION_FALLBACK.longitude);
                }
                    // setInitialRegion({...currentCoords, latitudeDelta: 0.01, longitudeDelta: 0.01});
                    // setCurrentRegion({...currentCoords, latitudeDelta: 0.01, longitudeDelta: 0.01});
                    // setSelectedCoordinates(currentCoords);
                    // reverseGeocode(currentCoords.latitude, currentCoords.longitude);
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

  // Modified onMapRegionChangeComplete function
    const onMapRegionChangeComplete = (region) => {
        const locationCheck = isLocationInAllowedRegion(region.latitude, region.longitude);
        
        if (!locationCheck.allowed) {
            // Show warning that location is outside service area
            setSelectedAddressString('Cette zone n\'est pas desservie');
            setCurrentRegion(region);
            setSelectedCoordinates({ latitude: region.latitude, longitude: region.longitude });
            return;
        }
        
        setCurrentRegion(region);
        setSelectedCoordinates({ latitude: region.latitude, longitude: region.longitude });
        reverseGeocode(region.latitude, region.longitude);
    };


    // Modified search function to validate results
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        Keyboard.dismiss();
        setIsGeocoding(true);
        try {
            let geocodedResults = await Location.geocodeAsync(searchQuery + ", Casablanca, Morocco");

            if (geocodedResults && geocodedResults.length > 0) {
                const firstResult = geocodedResults[0];
                
                // Check if the search result is in allowed region
                const locationCheck = isLocationInAllowedRegion(firstResult.latitude, firstResult.longitude);
                
                if (!locationCheck.allowed) {
                    Alert.alert(
                        "Zone non desservie", 
                        "Cette adresse se trouve en dehors de nos zones de livraison. Nous livrons uniquement dans: Hay Oulfa, Hay Hassani, Lissasfa, Almaz, Hay Laymoun, Ciel, Nassim, Sidi Maarouf, et CFC."
                    );
                    setIsGeocoding(false);
                    return;
                }
                
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
                Alert.alert("Recherche Infructueuse", "Aucun lieu trouvé pour votre recherche dans nos zones de livraison.");
            }
        } catch (error) {
            console.error("Geocoding search error:", error);
            Alert.alert("Erreur de Recherche", "Impossible d'effectuer la recherche.");
        } finally {
            setIsGeocoding(false);
        }
    };

    // Modified handlePickLocation function
    const handlePickLocation = async() => {
        if (!selectedCoordinates || !selectedAddressString || selectedAddressString.includes('...')) {
            Alert.alert("Sélection Incomplète", "Veuillez attendre que l'adresse soit chargée ou sélectionnez un emplacement valide.");
            return;
        }

        // Check if location is in allowed region
        const locationCheck = isLocationInAllowedRegion(selectedCoordinates.latitude, selectedCoordinates.longitude);
        
        if (!locationCheck.allowed) {
            Alert.alert(
                "Zone non desservie", 
                "Nous ne livrons que dans les zones suivantes: Hay Oulfa, Hay Hassani, Lissasfa, Almaz, Hay Laymoun, Ciel, Nassim, Sidi Maarouf, et CFC. Veuillez choisir une adresse dans l'une de ces zones.",
                [{ text: "OK" }]
            );
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

        useEffect(() => {
        if (mapReady && initialRegion && mapRef.current) {
            setTimeout(() => {
                mapRef?.current?.animateToRegion(initialRegion, 1000);
            }, 500);
        }
    }, [mapReady, initialRegion]);
    useEffect(() => {
    if (mapReady && initialRegion && mapRef.current) {
        console.log('Checking if location is in allowed region...');
        const locationCheck = isLocationInAllowedRegion(initialRegion.latitude, initialRegion.longitude);
        console.log('Location check result:', locationCheck);
        
        if (!locationCheck.allowed) {
            console.log('Location outside service area, using fallback');
            // Force map to show Casablanca instead
            mapRef.current.animateToRegion(INITIAL_REGION_FALLBACK, 1000);
        }
    }
}, [mapReady, initialRegion]);
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
                        console.log('Initial region:', initialRegion);
                        console.log('Current region:', currentRegion);
                        setMapReady(true);
                    }}
                    // Add these for debugging
                    onMapLoaded={() => console.log('Map loaded successfully')}
                    loadingEnabled={true}
                    loadingIndicatorColor="#F97316"
                    loadingBackgroundColor="#111827"
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