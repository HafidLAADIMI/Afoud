import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRestaurants } from '@/utils/firebase'; // Assuming this function exists
import { Restaurant } from '@/types';
import RestaurantCard from '@/components/RestaurantCard';

export default function DineInScreen() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        fetchDineInRestaurants();
    }, []);

    const fetchDineInRestaurants = async () => {
        try {
            setIsLoading(true);
            // Assuming getRestaurants can accept a parameter for dine-in filtering
            // You might need to modify this based on your actual implementation
            const fetchedRestaurants = await getRestaurants(30);

            // Filter for restaurants that offer dine-in (you may need to adjust this logic)
            const dineInRestaurants = fetchedRestaurants.filter(r => r.dineInAvailable);

            setRestaurants(dineInRestaurants);
            setFilteredRestaurants(dineInRestaurants);
        } catch (error) {
            console.error('Error fetching dine-in restaurants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        applyFilters(query, selectedFilter);
    };

    const handleFilterPress = (filter: string) => {
        setSelectedFilter(filter);
        applyFilters(searchQuery, filter);
    };

    const applyFilters = (query: string, filter: string) => {
        let filtered = restaurants;

        // Apply search query filter
        if (query) {
            filtered = filtered.filter(restaurant =>
                restaurant.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Apply category filter
        if (filter !== 'all') {
            filtered = filtered.filter(restaurant => {
                // Modify this based on your restaurant data structure
                return restaurant.category === filter ||
                    (restaurant.tags && restaurant.tags.includes(filter));
            });
        }

        setFilteredRestaurants(filtered);
    };

    const handleRestaurantPress = (restaurant: Restaurant) => {
        router.push(`/restaurant/${restaurant.id}`);
    };

    const handleReservation = (restaurant: Restaurant) => {
        // Navigate to a reservation screen or show a reservation modal
        router.push({
            pathname: '/reservation',
            params: { restaurantId: restaurant.id }
        });
    };

    // Filter categories (example - adjust based on your actual data)
    const filterCategories = ['all', 'premium', 'casual', 'fine-dining', 'brunch'];

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 p-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Dine-In Experience</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4">Loading dine-in restaurants...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900 p-4">
            {/* Header */}
            <View className="flex-row items-center mb-4">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold flex-1">Dine-In Experience</Text>
                <Text className="text-orange-500 text-base">{filteredRestaurants.length} Available</Text>
            </View>

            {/* Search Bar */}
            <View className="bg-gray-800 rounded-full flex-row items-center mb-4 px-4">
                <Feather name="search" size={20} color="#6B7280" />
                <TextInput
                    placeholder="Search dine-in restaurants"
                    placeholderTextColor="#6B7280"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    className="flex-1 text-white ml-2 py-3"
                />
            </View>

            {/* Filter Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
            >
                {filterCategories.map((filter, index) => (
                    <TouchableOpacity
                        key={index}
                        className={`px-4 py-2 mr-2 rounded-full ${
                            selectedFilter === filter ? 'bg-orange-500' : 'bg-gray-800'
                        }`}
                        onPress={() => handleFilterPress(filter)}
                    >
                        <Text
                            className={`${
                                selectedFilter === filter ? 'text-white' : 'text-gray-400'
                            } capitalize`}
                        >
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Banner */}
            <View className="bg-gray-800 p-4 rounded-xl mb-4">
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-orange-500 font-bold text-lg">Premium Experience</Text>
                        <Text className="text-white mt-1">Get exclusive offers on table reservations</Text>
                    </View>
                    <TouchableOpacity className="bg-orange-500 px-4 py-2 rounded-lg">
                        <Text className="text-white font-bold">Explore</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Restaurants List */}
            {filteredRestaurants.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400 text-center">
                        No dine-in restaurants found
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRestaurants}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-gray-800 mb-4 rounded-xl overflow-hidden"
                            onPress={() => handleRestaurantPress(item)}
                        >
                            <Image
                                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                className="w-full h-40"
                                resizeMode="cover"
                            />
                            <View className="p-3">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-white font-bold text-lg">{item.name}</Text>
                                    <View className="flex-row items-center">
                                        <Feather name="star" size={14} color="#F97316" />
                                        <Text className="text-white ml-1">{item.rating}</Text>
                                    </View>
                                </View>

                                <Text className="text-gray-400 mt-1">{item.cuisine} • {item.priceLevel}</Text>

                                <View className="flex-row justify-between items-center mt-3">
                                    <View className="flex-row items-center">
                                        <Feather name="clock" size={14} color="#10B981" />
                                        <Text className="text-green-500 ml-1 text-xs">Table available</Text>
                                    </View>
                                    <TouchableOpacity
                                        className="bg-orange-500 px-4 py-2 rounded-lg"
                                        onPress={() => handleReservation(item)}
                                    >
                                        <Text className="text-white font-medium">Reserve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
}