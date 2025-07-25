import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRestaurants } from '@/utils/firebase'; // Assuming this function exists
import { Restaurant } from '@/types';
import RestaurantCard from '@/components/RestaurantCard';

export default function NearbyScreen() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setIsLoading(true);
            // Assuming getRestaurants can accept a parameter for location-based filtering
            // You might need to modify this based on your actual implementation
            const fetchedRestaurants = await getRestaurants(20);
            setRestaurants(fetchedRestaurants);
            setFilteredRestaurants(fetchedRestaurants);
        } catch (error) {
            console.error('Error fetching nearby restaurants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filtered = restaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredRestaurants(filtered);
    };

    const handleRestaurantPress = (restaurant: Restaurant) => {
        router.push(`/restaurant/${restaurant.id}`);
    };

    const handleFavoritePress = (restaurant: Restaurant) => {
        console.log('Restaurant favorited:', restaurant.name);
        // Implement your favorite logic here
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 p-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Nearby Restaurants</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4">Finding restaurants near you...</Text>
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
                <Text className="text-white text-xl font-bold flex-1">Nearby Restaurants</Text>
                <Text className="text-orange-500 text-base">{filteredRestaurants.length} Found</Text>
            </View>

            {/* Search Bar */}
            <View className="bg-gray-800 rounded-full flex-row items-center mb-4 px-4">
                <Feather name="search" size={20} color="#6B7280" />
                <TextInput
                    placeholder="Search nearby restaurants"
                    placeholderTextColor="#6B7280"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    className="flex-1 text-white ml-2 py-3"
                />
            </View>

            {/* Location indicator */}
            <View className="bg-gray-800 rounded-xl p-3 mb-4 flex-row items-center">
                <View className="bg-orange-500/20 p-2 rounded-full">
                    <Feather name="map-pin" size={18} color="#F97316" />
                </View>
                <View className="ml-3">
                    <Text className="text-gray-400 text-xs">Your location</Text>
                    <Text className="text-white font-medium">Current Location</Text>
                </View>
                <TouchableOpacity className="ml-auto bg-gray-700 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs">Change</Text>
                </TouchableOpacity>
            </View>

            {/* Restaurants List */}
            {filteredRestaurants.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400 text-center">
                        No restaurants found nearby
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRestaurants}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="mb-4">
                            <RestaurantCard
                                restaurant={item}
                                onPress={() => handleRestaurantPress(item)}
                                onFavoritePress={() => handleFavoritePress(item)}
                                isHorizontal={true}
                            />
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
}