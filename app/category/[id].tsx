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

// Import all Firebase functions to avoid import issues
import * as FirebaseUtils from '@/utils/firebase';

export default function CategoryDetailScreen() {
    // Get the parameters from the URL
    const params = useGlobalSearchParams();
    console.log('Raw params received:', params);

    // Extract and format categoryId - handle different possible formats
    const rawCategoryId = params.categoryId || params.id || null;
    const categoryId = rawCategoryId ? decodeURIComponent(String(rawCategoryId)) : null;
    const categoryName = params.categoryName ? decodeURIComponent(String(params.categoryName)) : null;

    console.log('Processed categoryId:', categoryId);
    console.log('Processed categoryName:', categoryName);

    // State variables
    const [category, setCategory] = useState(null);
    const [cuisine, setCuisine] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [error, setError] = useState(null);

    // Product detail modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    useEffect(() => {
        if (categoryId) {
            console.log(`CategoryDetailScreen: Loading category with ID: ${categoryId}`);
            fetchCategoryDetails(categoryId);
        } else {
            console.error('No categoryId provided in navigation params');
            setError('Missing category ID');
            setIsLoading(false);
        }
    }, [categoryId]);

    const fetchCategoryDetails = async (id) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log(`Fetching details for category ID: ${id}`);

            // Get category details
            const categoryData = await FirebaseUtils.getCategoryById(id);
            console.log('Category data received:', categoryData);

            if (!categoryData) {
                console.error(`No category found with ID: ${id}`);
                setError(`Category not found (ID: ${id})`);
                setCategory(null);
                setProducts([]);
                setIsLoading(false);
                return;
            }

            setCategory(categoryData);

            // Get the associated cuisine
            const cuisineData = await FirebaseUtils.getCuisineFromCategory(id);
            console.log('Cuisine data received:', cuisineData);
            setCuisine(cuisineData);

            // Get products for this category
            const productsData = await FirebaseUtils.getProductsByCategory(id);
            console.log(`Products data received: ${productsData?.length || 0} items`);

            if (!productsData || productsData.length === 0) {
                console.warn(`No products found for category ID: ${id}`);
            }

            setProducts(productsData || []);

        } catch (error) {
            console.error('Error in fetchCategoryDetails:', error);
            setError(`Failed to load category: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductPress = (product) => {
        setSelectedProduct(product);
        setDetailVisible(true);
    };

    const handleOrderNow = (
        total,
        quantity,
        addons
    ) => {
        setDetailVisible(false);

        // Navigate to checkout
        router.push({
            pathname: '/checkout',
            params: {
                totalAmount: total.toString(),
                quantity: quantity.toString(),
                addons: JSON.stringify(addons),
                id: selectedProduct?.id ?? '',
                productName: selectedProduct?.name ?? ''
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

    // Safely process image source - no JSX here
    const getImageSource = (source) => {
        return source;
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
                        {categoryName || 'Détails de la catégorie'}
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4">Chargement des détails de la catégorie...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error || !category) {
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
                        {error || 'Échec du chargement des détails de la catégorie'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (categoryId) {
                                fetchCategoryDetails(categoryId);
                            } else {
                                router.back();
                            }
                        }}
                        className="bg-orange-500 px-6 py-3 rounded-full"
                    >
                        <Text className="text-white font-bold">
                            {categoryId ? 'Réessayer' : 'Retour'}
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
    const categoryImageSource = category?.image && typeof category.image === 'string'
        ? { uri: category.image }
        : require('@/assets/placeholder.png');

    console.log('Rendering category details with:', {
        categoryName: category?.name,
        cuisineName: cuisine?.name,
        productCount: products?.length,
        filteredCount: filteredProducts?.length,
        categories: productCategories
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section with Category Image */}
                <View className="relative h-60 w-full">
                    <Image
                        source={categoryImageSource}
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

                    {/* Category Name */}
                    <View className="absolute bottom-0 left-0 right-0 p-4">
                        <Text className="text-white text-2xl font-bold">{category?.name}</Text>
                        {category?.description && (
                            <Text className="text-gray-300 mt-1">{category.description}</Text>
                        )}
                    </View>
                </View>

                {/* Content Section */}
                <View className="p-4">
                    {/* Category Info */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-2">
                            <View className="w-1 h-6 bg-orange-500 rounded-full mr-2" />
                            <Text className="text-white text-lg font-bold">
                                À propos de{" "}
                                <Text>{category?.name}</Text>
                            </Text>
                        </View>
                        {cuisine && (
                            <Text className="text-gray-400 mb-2">
                                {category?.name} appartient à notre collection de cuisine {cuisine.name}.
                            </Text>
                        )}
                        <Text className="text-gray-400">
                            {category?.description || `Explorez notre délicieuse sélection d'articles ${category?.name}.`}
                        </Text>
                    </View>

                    {/* Filter Buttons */}
                    {productCategories.length > 1 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4"
                        >
                            {productCategories.map((subCategory, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className={`px-4 py-2 mr-2 rounded-full ${
                                        selectedFilter === subCategory ? 'bg-orange-500' : 'bg-gray-800'
                                    }`}
                                    onPress={() => setSelectedFilter(subCategory)}
                                >
                                    <Text
                                        className={`${
                                            selectedFilter === subCategory ? 'text-white' : 'text-gray-400'
                                        } capitalize`}
                                    >
                                        {subCategory}
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