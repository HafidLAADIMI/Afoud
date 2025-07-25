import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Components
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';

// Firebase functions
import {
    getFavoriteItems,
    removeFromFavorites
} from '@/utils/firebase';

export default function FavoritesScreen() {
    const router = useRouter();

    // State variables
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Product detail modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    // Load favorites
    const loadFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const favItems = await getFavoriteItems();
            setFavorites(favItems);

            console.log(`Loaded ${favItems.length} favorites`);
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError('Impossible de charger vos favoris. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Load data on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    // Handle refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        loadFavorites();
    };

    // Handle product press
    const handleProductPress = (product) => {
        setSelectedProduct(product);
        setDetailVisible(true);
    };

    // Handle favorite press
    const handleFavoritePress = async (product, isFavoriting) => {
        try {
            if (!isFavoriting) {
                // Removing from favorites
                await removeFromFavorites(product.id);

                // Update local state
                setFavorites(prev => prev.filter(item => item.id !== product.id));

                // Show success message
                Alert.alert(
                    "Retiré des favoris",
                    `${product.name} a été retiré de vos favoris.`,
                    [{ text: "OK" }]
                );
            }
            // We don't need to handle adding to favorites here since all items are already favorites
        } catch (error) {
            console.error('Error handling favorite:', error);
            Alert.alert(
                "Erreur",
                "Une erreur s'est produite lors de la mise à jour des favoris.",
                [{ text: "OK" }]
            );
        }
    };

    // Handle order now
    const handleOrderNow = (itemPriceWithAddons, quantity, selectedProductDetails) => {
        setDetailVisible(false);

        // Create persistedProductData with all necessary details for checkout
        const persistedProductData = {
            productId: selectedProductDetails.productId,
            productName: selectedProductDetails.productName,
            basePrice: selectedProductDetails.basePrice,
            quantity: quantity,
            itemPriceWithAddons: itemPriceWithAddons,
            selectedAddons: selectedProductDetails.selectedAddons,
            selectedVariations: selectedProductDetails.selectedVariations,
            imageUri: selectedProductDetails.imageUri,
            restaurantId: selectedProductDetails.restaurantId || selectedProduct?.restaurantId || '',
            cuisineId: selectedProductDetails.cuisineId || selectedProduct?.cuisineId || '',
        };

        // Navigate to checkout
        router.push({
            pathname: '/checkout',
            params: {
                persistedProductData: JSON.stringify(persistedProductData),
            },
        });
    };

    // Render empty list message
    const renderEmptyList = () => {
        if (isLoading) return null;

        return (
            <View className="flex-1 justify-center items-center py-10">
                <Feather name="heart" size={48} color="#4B5563" />
                <Text className="text-gray-400 mt-4 text-center px-6">
                    Vous n'avez aucun produit en favoris.
                </Text>
                <TouchableOpacity
                    className="mt-4 bg-orange-500 px-6 py-3 rounded-full"
                    onPress={() => router.push('/SearchScreen')}
                >
                    <Text className="text-white font-bold">Découvrir des produits</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Clear all favorites
    const clearAllFavorites = async () => {
        Alert.alert(
            "Supprimer tous les favoris",
            "Êtes-vous sûr de vouloir supprimer tous vos favoris ?",
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            // Remove each favorite individually
                            for (const item of favorites) {
                                await removeFromFavorites(item.id);
                            }
                            // Clear local state
                            setFavorites([]);
                            Alert.alert("Succès", "Tous vos favoris ont été supprimés.");
                        } catch (error) {
                            console.error('Error clearing favorites:', error);
                            Alert.alert("Erreur", "Une erreur s'est produite lors de la suppression des favoris.");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* Header */}
            <Header isSearchScreen={false} />

            {/* Main Content */}
            <View className="flex-1 px-4 pt-2">
                {/* Title and Clear Button */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-xl font-bold">
                        Mes Favoris
                    </Text>

                    {favorites.length > 0 && (
                        <TouchableOpacity
                            onPress={clearAllFavorites}
                            className="bg-gray-800 px-3 py-1 rounded-full"
                        >
                            <Text className="text-red-500">Tout supprimer</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results Count */}
                {!isLoading && favorites.length > 0 && (
                    <Text className="text-gray-400 mb-4">
                        {favorites.length} {favorites.length > 1 ? 'produits en favoris' : 'produit en favoris'}
                    </Text>
                )}

                {/* Loading Indicator */}
                {isLoading && !isRefreshing && (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#F97316" />
                        <Text className="text-gray-400 mt-4">Chargement de vos favoris...</Text>
                    </View>
                )}

                {/* Error Message */}
                {error && (
                    <View className="flex-1 justify-center items-center">
                        <Feather name="alert-circle" size={48} color="#EF4444" />
                        <Text className="text-white mt-4 text-center">{error}</Text>
                        <TouchableOpacity
                            className="mt-4 bg-orange-500 px-6 py-3 rounded-full"
                            onPress={loadFavorites}
                        >
                            <Text className="text-white font-bold">Réessayer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Favorites Grid */}
                {!isLoading && !error && (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        renderItem={({ item }) => (
                            <View style={{ width: '48%', marginBottom: 16 }}>
                                <ProductCard
                                    product={item}
                                    onPress={() => handleProductPress(item)}
                                    onFavoritePress={handleFavoritePress}
                                    isFavorite={true} // All items are favorites in this screen
                                />
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor="#F97316"
                                colors={['#F97316']}
                            />
                        }
                        ListEmptyComponent={renderEmptyList}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 20
                        }}
                    />
                )}
            </View>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <ProductDetailModal
                    isVisible={detailVisible}
                    onClose={() => setDetailVisible(false)}
                    onOrder={handleOrderNow}
                    product={selectedProduct}
                />
            )}
        </SafeAreaView>
    );
}