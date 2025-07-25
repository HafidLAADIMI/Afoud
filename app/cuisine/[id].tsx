import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useGlobalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';

// Firebase helpers
import * as FirebaseUtils from '@/utils/firebase';

export default function CuisineDetailScreen() {
    // Get the parameters from the URL
    const params = useGlobalSearchParams();
    console.log('Raw params received:', params);

    // Extract and format cuisineId - handle different possible formats
    const rawCuisineId = params.cuisineId || params.id || null;
    const cuisineId = rawCuisineId ? decodeURIComponent(String(rawCuisineId)) : null;
    const cuisineName = params.cuisineName ? decodeURIComponent(String(params.cuisineName)) : null;

    console.log('Processed cuisineId:', cuisineId);
    console.log('Processed cuisineName:', cuisineName);

    // State variables
    const [cuisine, setCuisine] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [error, setError] = useState(null);

    // Product detail modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    useEffect(() => {
        if (cuisineId) {
            console.log(`CuisineDetailScreen: Loading cuisine with ID: ${cuisineId}`);
            fetchCuisineDetails(cuisineId);
        } else {
            console.error('No cuisineId provided in navigation params');
            setError('ID de cuisine manquant');
            setIsLoading(false);
        }
    }, [cuisineId]);

    const fetchCuisineDetails = async (id) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log(`Fetching details for cuisine ID: ${id}`);

            // First, get the cuisine data
            const cuisineData = await FirebaseUtils.getCuisineById(id);
            console.log('Cuisine data received:', cuisineData);

            if (!cuisineData) {
                console.error(`No cuisine found with ID: ${id}`);
                setError(`Cuisine introuvable (ID: ${id})`);
                setCuisine(null);
                setProducts([]);
                setIsLoading(false);
                return;
            }

            setCuisine(cuisineData);

            // Then, get the products for this cuisine
            const productsData = await FirebaseUtils.getProductsByCuisine(id);
            console.log(`Products data received: ${productsData?.length || 0} items`);

            if (!productsData || productsData.length === 0) {
                console.warn(`No products found for cuisine ID: ${id}`);
            }

            setProducts(productsData || []);

        } catch (error) {
            console.error('Error in fetchCuisineDetails:', error);
            setError(`Échec du chargement de la cuisine: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductPress = (product) => {
        setSelectedProduct(product);
        setDetailVisible(true);
    };
    console.log("selected product : ", selectedProduct)
    console.log("selected cuisine : " , cuisine)

    const handleOrderNow = (
        itemPriceWithAddons,  // Single item total price with options
        quantity,
        orderDetails  // Coming from ProductDetailModal
    ) => {
        setDetailVisible(false);

        console.log('CuisineDetailScreen - Order details:', JSON.stringify(orderDetails));

        // Create persistedProductData with all necessary details for checkout
        const persistedProductData = {
            productId: orderDetails.productId,
            productName: orderDetails.productName,
            basePrice: orderDetails.basePrice,
            quantity: quantity,
            itemPriceWithAddons: itemPriceWithAddons,
            selectedAddons: orderDetails.selectedAddons,
            selectedVariations: orderDetails.selectedVariations,
            imageUri: orderDetails.imageUri,
            restaurantId: orderDetails.restaurantId || selectedProduct?.restaurantId || '',
            cuisineId: orderDetails.cuisineId || cuisine?.id || '',
        };

        // Navigate to checkout with properly formatted product data
        router.push({
            pathname: '/checkout',
            params: {
                // Use persistedProductData as the main data container
                persistedProductData: JSON.stringify(persistedProductData),
            },
        });
    };

    // Get product categories for filtering
    const getProductCategories = () => {
        if (!products || products.length === 0) return ['all'];

        const categories = products
            .map(item => item.subCategory)
            .filter((value, index, self) =>
                value && self.indexOf(value) === index
            );

        return ['all', ...categories];
    };

    // Filter products by selected category
    const getFilteredProducts = () => {
        if (!products || products.length === 0) return [];
        if (selectedFilter === 'all') {
            return products;
        }
        return products.filter(item => item.subCategory === selectedFilter);
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 p-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">
                        {cuisineName || 'Détails de la cuisine'}
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4">Chargement des détails de la cuisine...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error || !cuisine) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 p-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Erreur</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white text-lg mb-4">
                        {error || 'Échec du chargement des détails de la cuisine'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (cuisineId) {
                                fetchCuisineDetails(cuisineId);
                            } else {
                                router.back();
                            }
                        }}
                        className="bg-orange-500 px-6 py-3 rounded-full"
                    >
                        <Text className="text-white font-bold">
                            {cuisineId ? 'Réessayer' : 'Retour'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Get categories for filter buttons
    const productCategories = getProductCategories();
    const filteredProducts = getFilteredProducts();

    // Safely handle image source
    const cuisineImageSource = cuisine?.image && typeof cuisine.image === 'string'
        ? { uri: cuisine.image }
        : require('@/assets/placeholder.png');

    console.log('Rendering cuisine details with:', {
        cuisineName: cuisine?.name,
        productCount: products?.length,
        filteredCount: filteredProducts?.length,
        categories: productCategories
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section with Cuisine Image */}
                <View className="relative h-60 w-full">
                    <Image
                        source={cuisineImageSource}
                        className="w-full h-full"
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />

                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute inset-0"
                    />

                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 left-4 bg-black/50 p-2 rounded-full"
                    >
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Cuisine Name */}
                    <View className="absolute bottom-0 left-0 right-0 p-4">
                        <Text className="text-white text-2xl font-bold">{cuisine?.name}</Text>
                        {cuisine?.description && (
                            <Text className="text-gray-300 mt-1">{cuisine.description}</Text>
                        )}
                    </View>
                </View>

                {/* Content Section */}
                <View className="p-4">
                    {/* About This Cuisine */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-2">
                            <View className="w-1 h-6 bg-orange-500 rounded-full mr-2" />
                            <Text className="text-white text-lg font-bold">
                                À propos de{" "}
                                <Text>{cuisine?.name}</Text>
                            </Text>
                        </View>
                        <Text className="text-gray-400">
                            {cuisine?.longDescription ||
                                `${cuisine?.name} est connue pour ses saveurs riches et ses plats variés. Notre restaurant vous propose l'authentique goût de la cuisine ${cuisine?.name} préparée avec des ingrédients frais et des recettes traditionnelles.`}
                        </Text>
                    </View>

                    {/* Filter Buttons */}
                    {productCategories.length > 1 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4"
                        >
                            {productCategories.map((category, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className={`px-4 py-2 mr-2 rounded-full ${
                                        selectedFilter === category ? 'bg-orange-500' : 'bg-gray-800'
                                    }`}
                                    onPress={() => setSelectedFilter(category)}
                                >
                                    <Text
                                        className={`${
                                            selectedFilter === category ? 'text-white' : 'text-gray-400'
                                        } capitalize`}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Products Grid */}
                    <Text className="text-white text-lg font-bold mb-4">Articles au menu</Text>

                    {filteredProducts.length === 0 ? (
                        <View className="py-12 items-center">
                            <Text className="text-gray-400">Aucun article trouvé dans cette catégorie</Text>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap justify-between">
                            {filteredProducts.map((product) => (
                                <View key={product.id} className="mb-4" style={{ width: '48%' }}>
                                    <ProductCard
                                        product={product}
                                        onPress={() => handleProductPress(product)}
                                        onFavoritePress={() => console.log('Favorite:', product.name)}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

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