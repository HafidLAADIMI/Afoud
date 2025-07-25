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
import debounce from 'lodash/debounce';

// Components
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';

// Firebase functions
import {
    searchProducts,
    getAllProducts,
    getFavoriteItems,
    addToFavorites,
    removeFromFavorites
} from '@/utils/firebase';

export default function SearchScreen() {
    const router = useRouter();

    // State variables
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Product detail modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    // Load initial data and handle search input changes
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            try {
                setIsLoading(true);
                setError(null);

                let results;
                if (query.trim() === '') {
                    // Load all products if no search query
                    results = await getAllProducts(20);
                } else {
                    // Search for products matching the query
                    results = await searchProducts(query);
                }

                setProducts(results || []);
            } catch (err) {
                console.error('Error searching products:', err);
                setError('Impossible de charger les produits. Veuillez réessayer.');
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        }, 500),
        []
    );

    // Load favorites
    const loadFavorites = useCallback(async () => {
        try {
            const favItems = await getFavoriteItems();
            setFavorites(favItems);

            // Create a Set of favorite item IDs for quick lookup
            const favIds = new Set(favItems.map(item => item.id));
            setFavoriteIds(favIds);

            console.log(`Loaded ${favItems.length} favorites`);
        } catch (err) {
            console.error('Error loading favorites:', err);
        }
    }, []);

    // Effect to load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load all initial data
    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            // Load products and favorites in parallel
            await Promise.all([
                loadInitialProducts(),
                loadFavorites()
            ]);
        } catch (err) {
            console.error('Error loading initial data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to handle search query changes
    useEffect(() => {
        debouncedSearch(searchQuery);
        return () => debouncedSearch.cancel();
    }, [searchQuery, debouncedSearch]);

    // Load initial products
    const loadInitialProducts = async () => {
        try {
            setError(null);
            const results = await getAllProducts(20);
            setProducts(results || []);
            return results;
        } catch (err) {
            console.error('Error loading initial products:', err);
            setError('Impossible de charger les produits. Veuillez réessayer.');
            return [];
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        Promise.all([
            loadFavorites(),
            searchQuery.trim() === '' ? loadInitialProducts() : debouncedSearch(searchQuery)
        ]).finally(() => {
            setIsRefreshing(false);
        });
    };

    // Handle product press
    const handleProductPress = (product) => {
        setSelectedProduct(product);
        setDetailVisible(true);
    };

    // Handle favorite press
    const handleFavoritePress = async (product, isFavoriting) => {
        try {
            if (isFavoriting) {
                // Adding to favorites
                await addToFavorites(product);
                setFavoriteIds(prev => new Set([...prev, product.id]));

                // Show success message
                Alert.alert(
                    "Ajouté aux favoris",
                    `${product.name} a été ajouté à vos favoris.`,
                    [{ text: "OK" }]
                );
            } else {
                // Removing from favorites
                await removeFromFavorites(product.id);
                setFavoriteIds(prev => {
                    const updated = new Set([...prev]);
                    updated.delete(product.id);
                    return updated;
                });

                // Show success message
                Alert.alert(
                    "Retiré des favoris",
                    `${product.name} a été retiré de vos favoris.`,
                    [{ text: "OK" }]
                );
            }

            // Refresh favorites list
            loadFavorites();
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
                <Feather name="search" size={48} color="#4B5563" />
                <Text className="text-gray-400 mt-4 text-center px-6">
                    {searchQuery.trim() !== ''
                        ? `Aucun résultat trouvé pour "${searchQuery}"`
                        : 'Aucun produit disponible actuellement'}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* Back button */}
            <View className="px-4 pt-2 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-gray-800 rounded-full p-2 mr-3"
                >
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>

                <Text className="text-white text-xl font-semibold">Recherche</Text>
            </View>

            {/* Header with Search Bar */}
            <Header
                search={searchQuery}
                setSearch={setSearchQuery}
                isSearchScreen={true}
            />

            {/* Main Content */}
            <View className="flex-1 px-4 pt-2">
                {/* Results Count */}
                {!isLoading && (
                    <Text className="text-gray-400 mb-4">
                        {products.length} {products.length > 1 ? 'produits trouvés' : 'produit trouvé'}
                    </Text>
                )}

                {/* Loading Indicator */}
                {isLoading && !isRefreshing && (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#F97316" />
                        <Text className="text-gray-400 mt-4">Chargement des produits...</Text>
                    </View>
                )}

                {/* Error Message */}
                {error && (
                    <View className="flex-1 justify-center items-center">
                        <Feather name="alert-circle" size={48} color="#EF4444" />
                        <Text className="text-white mt-4 text-center">{error}</Text>
                        <TouchableOpacity
                            className="mt-4 bg-orange-500 px-6 py-3 rounded-full"
                            onPress={loadInitialData}
                        >
                            <Text className="text-white font-bold">Réessayer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Products Grid */}
                {!isLoading && !error && (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        renderItem={({ item }) => (
                            <View style={{ width: '48%', marginBottom: 16 }}>
                                <ProductCard
                                    product={item}
                                    onPress={() => handleProductPress(item)}
                                    onFavoritePress={handleFavoritePress}
                                    isFavorite={favoriteIds.has(item.id)}
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