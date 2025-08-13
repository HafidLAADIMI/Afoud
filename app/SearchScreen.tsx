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
                <View className="w-20 h-20 rounded-full bg-yellow-50 items-center justify-center mb-4">
                    <Feather name="search" size={40} color="#a86e02" />
                </View>
                <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
                    {searchQuery.trim() !== '' ? 'Aucun résultat' : 'Découvrez nos produits'}
                </Text>
                <Text className="text-gray-600 text-center px-6 leading-6">
                    {searchQuery.trim() !== ''
                        ? `Aucun résultat trouvé pour "${searchQuery}"`
                        : 'Explorez notre sélection de délicieux plats'}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* Header with back button */}
            <View className="px-5 py-4 bg-white border-b border-gray-200">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-4"
                        activeOpacity={0.8}
                    >
                        <Feather name="arrow-left" size={20} color="#6B7280" />
                    </TouchableOpacity>

                    <Text className="text-gray-900 text-xl font-bold">Recherche</Text>
                </View>
            </View>

            {/* Header with Search Bar */}
            <Header
                search={searchQuery}
                setSearch={setSearchQuery}
                isSearchScreen={true}
            />

            {/* Main Content */}
            <View className="flex-1 px-5 pt-4">
                {/* Results Count */}
                {!isLoading && products.length > 0 && (
                    <View className="mb-4 bg-white rounded-xl p-4 border border-gray-200" style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 3,
                    }}>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-yellow-50 items-center justify-center mr-3">
                                <Feather name="package" size={16} color="#a86e02" />
                            </View>
                            <Text className="text-gray-900 font-semibold">
                                {products.length} {products.length > 1 ? 'produits trouvés' : 'produit trouvé'}
                            </Text>
                        </View>
                        {searchQuery.trim() !== '' && (
                            <Text className="text-gray-600 text-sm mt-1 ml-11">
                                pour "{searchQuery}"
                            </Text>
                        )}
                    </View>
                )}

                {/* Loading Indicator */}
                {isLoading && !isRefreshing && (
                    <View className="flex-1 justify-center items-center">
                        <View className="bg-white rounded-2xl p-8 border border-gray-200" style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 8,
                        }}>
                            <ActivityIndicator size="large" color="#a86e02" />
                            <Text className="text-gray-700 mt-4 font-medium text-center">
                                Chargement des produits...
                            </Text>
                        </View>
                    </View>
                )}

                {/* Error Message */}
                {error && (
                    <View className="flex-1 justify-center items-center px-6">
                        <View className="bg-white rounded-2xl p-8 items-center border border-red-200" style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 8,
                        }}>
                            <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
                                <Feather name="alert-circle" size={40} color="#DC2626" />
                            </View>
                            <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
                                Erreur de chargement
                            </Text>
                            <Text className="text-gray-600 mb-6 text-center leading-6">
                                {error}
                            </Text>
                            <TouchableOpacity
                                className="py-3 px-6 rounded-xl"
                                style={{ backgroundColor: '#a86e02' }}
                                onPress={loadInitialData}
                                activeOpacity={0.9}
                            >
                                <Text className="text-white font-bold">Réessayer</Text>
                            </TouchableOpacity>
                        </View>
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
                                tintColor="#a86e02"
                                colors={['#a86e02']}
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