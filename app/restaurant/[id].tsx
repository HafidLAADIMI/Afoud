import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useGlobalSearchParams } from 'expo-router';
import { getRestaurantById, getRestaurantMenu } from '@/utils/firebase'; // Assuming these functions exist
import { Restaurant, Product } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import ProductDetailModal from '@/components/ProductDetailModal';

export default function RestaurantDetailScreen() {
    const { id } = useGlobalSearchParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isFavorite, setIsFavorite] = useState(false);

    // Product detail modal state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    useEffect(() => {
        if (id) {
            fetchRestaurantDetails(id.toString());
        }
    }, [id]);

    const fetchRestaurantDetails = async (restaurantId: string) => {
        try {
            setIsLoading(true);

            // Fetch restaurant details and menu items
            const restaurantData = await getRestaurantById(restaurantId);
            setRestaurant(restaurantData);

            // Fetch menu items for this restaurant
            const menuData = await getRestaurantMenu(restaurantId);
            setMenuItems(menuData);

            // Set initial category if menu items exist
            if (menuData.length > 0) {
                const categories = getMenuCategories(menuData);
                if (categories.length > 0) {
                    setSelectedCategory(categories[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMenuCategories = (menu: Product[]): string[] => {
        // Get unique categories from menu items
        const categories = menu
            .map(item => item.category)
            .filter((value, index, self) =>
                value && self.indexOf(value) === index
            ) as string[];

        return ['all', ...categories];
    };

    const getFilteredMenuItems = (): Product[] => {
        if (selectedCategory === 'all') {
            return menuItems;
        }
        return menuItems.filter(item => item.category === selectedCategory);
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setDetailVisible(true);
    };

    const handleOrderNow = (
        total: number,
        quantity: number,
        addons: Record<string, boolean>
    ) => {
        setDetailVisible(false);

        // Navigate to checkout with restaurant info
        router.push({
            pathname: '/checkout',
            params: {
                totalAmount: total.toString(),
                quantity: quantity.toString(),
                addons: JSON.stringify(addons),
                id: selectedProduct?.id ?? '',
                restaurantId: restaurant?.id ?? '',
                restaurantName: restaurant?.name ?? ''
            },
        });
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // Here you would typically update the favorite status in your database
    };

    const handleMakeReservation = () => {
        if (restaurant) {
            router.push({
                pathname: '/reservation',
                params: { restaurantId: restaurant.id }
            });
        }
    };

    const handleCallRestaurant = () => {
        if (restaurant?.phone) {
            Linking.openURL(`tel:${restaurant.phone}`);
        }
    };

    const handleGetDirections = () => {
        if (restaurant?.address) {
            const destination = encodeURIComponent(restaurant.address);
            const url = Platform.select({
                ios: `maps:q=${destination}`,
                android: `geo:0,0?q=${destination}`
            });

            if (url) {
                Linking.openURL(url);
            }
        }
    };

    if (isLoading || !restaurant) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 p-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Restaurant Details</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4">Loading restaurant details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Prepare menu categories
    const menuCategories = getMenuCategories(menuItems);
    const filteredMenu = getFilteredMenuItems();

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header Image */}
            <View className="relative h-64 w-full">
                <Image
                    source={
                        typeof restaurant.image === 'string'
                            ? { uri: restaurant.image }
                            : restaurant.image
                    }
                    className="w-full h-full"
                    resizeMode="cover"
                />

                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'transparent']}
                    className="absolute top-0 left-0 right-0 h-24"
                />

                {/* Header Buttons */}
                <View className="absolute top-4 left-4 right-4 flex-row justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-black/50 p-2 rounded-full"
                    >
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleFavorite}
                        className="bg-black/50 p-2 rounded-full"
                    >
                        <Feather
                            name={isFavorite ? "heart" : "heart"}
                            size={24}
                            color={isFavorite ? "#F97316" : "white"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Restaurant Info Card */}
                <View className="bg-gray-800 rounded-t-3xl -mt-8 pt-6 px-4">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="text-white text-2xl font-bold">{restaurant.name}</Text>
                            <Text className="text-gray-400 mt-1">
                                {restaurant.cuisine} • {restaurant.priceLevel}
                            </Text>
                        </View>

                        <View className="bg-gray-700 p-2 rounded-lg flex-row items-center">
                            <Feather name="star" size={16} color="#F97316" />
                            <Text className="text-white ml-1 font-bold">{restaurant.rating}</Text>
                            <Text className="text-gray-400 ml-1">({restaurant.reviewCount || 0})</Text>
                        </View>
                    </View>

                    {/* Address & Hours */}
                    <View className="mt-4">
                        <View className="flex-row items-center mb-2">
                            <Feather name="map-pin" size={16} color="#F97316" />
                            <Text className="text-white ml-2">{restaurant.address}</Text>
                        </View>

                        <View className="flex-row items-center">
                            <Feather name="clock" size={16} color="#F97316" />
                            <Text className="text-white ml-2">
                                {restaurant.openingHours || "Open today: 9:00 AM - 10:00 PM"}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-between mt-6 pb-6 border-b border-gray-700">
                        <TouchableOpacity
                            onPress={handleMakeReservation}
                            className="bg-orange-500 flex-1 mr-2 py-3 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold">Reserve Table</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCallRestaurant}
                            className="bg-gray-700 px-4 py-3 rounded-xl items-center"
                        >
                            <Feather name="phone" size={20} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleGetDirections}
                            className="bg-gray-700 px-4 py-3 rounded-xl items-center ml-2"
                        >
                            <Feather name="navigation" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* About Section */}
                    <View className="py-6 border-b border-gray-700">
                        <Text className="text-white text-xl font-bold mb-2">About</Text>
                        <Text className="text-gray-400">
                            {restaurant.description || "This restaurant offers a unique dining experience with fresh ingredients and creative dishes in a warm, inviting atmosphere."}
                        </Text>

                        {/* Features/Amenities */}
                        <View className="flex-row flex-wrap mt-4">
                            {['Dine-in', 'Takeout', 'Delivery', 'Outdoor Seating'].map((feature, index) => (
                                <View key={index} className="flex-row items-center mr-4 mb-2">
                                    <Feather name="check-circle" size={14} color="#10B981" />
                                    <Text className="text-gray-400 ml-1">{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Menu Section */}
                    <View className="py-6">
                        <Text className="text-white text-xl font-bold mb-4">Menu</Text>

                        {/* Menu Categories */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4"
                        >
                            {menuCategories.map((category, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className={`px-4 py-2 mr-2 rounded-full ${
                                        selectedCategory === category ? 'bg-orange-500' : 'bg-gray-700'
                                    }`}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text
                                        className={`${
                                            selectedCategory === category ? 'text-white' : 'text-gray-400'
                                        } capitalize`}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Menu Items */}
                        {filteredMenu.length === 0 ? (
                            <View className="py-6 items-center">
                                <Text className="text-gray-400">No items found in this category</Text>
                            </View>
                        ) : (
                            filteredMenu.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className="flex-row bg-gray-700 rounded-xl p-3 mb-3"
                                    onPress={() => handleProductPress(item)}
                                >
                                    {/* Item Image */}
                                    <Image
                                        source={
                                            typeof item.image === 'string'
                                                ? { uri: item.image }
                                                : item.image
                                        }
                                        className="w-20 h-20 rounded-lg"
                                        resizeMode="cover"
                                    />

                                    {/* Item Details */}
                                    <View className="flex-1 ml-3 justify-between">
                                        <View>
                                            <Text className="text-white font-bold">{item.name}</Text>
                                            <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>
                                                {item.description}
                                            </Text>
                                        </View>

                                        <View className="flex-row justify-between items-center mt-2">
                                            <Text className="text-orange-500 font-bold">${item.price.toFixed(2)}</Text>
                                            <TouchableOpacity
                                                className="bg-gray-600 p-1 rounded-full"
                                                onPress={() => handleProductPress(item)}
                                            >
                                                <Feather name="plus" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {/* Reviews Section (could be expanded) */}
                    <View className="py-6 border-t border-gray-700">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white text-xl font-bold">Reviews</Text>
                            <TouchableOpacity>
                                <Text className="text-orange-500">View All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Placeholder for reviews content */}
                        <View className="p-4 bg-gray-700 rounded-xl">
                            <Text className="text-white text-center">
                                Reviews coming soon!
                            </Text>
                        </View>
                    </View>
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

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    }
});