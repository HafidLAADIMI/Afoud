import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getCategories } from '@/utils/firebase';

export default function CategoriesScreen() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching categories...');
            const fetchedCategories = await getCategories();

            console.log(`Fetched ${fetchedCategories.length} categories:`,
                fetchedCategories.map(c => `${c.id}: ${c.name}`).join(', '));

            setCategories(fetchedCategories);
            setFilteredCategories(fetchedCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCategories(filtered);
    };

    const handleCategoryPress = (category) => {
        console.log(`Navigating to category: ${category.id} - ${category.name}`);

        // Use the proper navigation format with named parameters
        router.push({
            pathname: '/category/[categoryId]',
            params: {
                categoryId: category.id,
                categoryName: category.name
            }
        });
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleCategoryPress(item)}
            className="flex-row items-center bg-gray-800 rounded-xl p-4 mb-4"
        >
            <Image
                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                className="w-16 h-16 rounded-full mr-4"
                resizeMode="cover"
            />
            <View className="flex-1">
                <Text className="text-white text-lg font-bold">{item.name}</Text>
                {item.description && (
                    <Text className="text-gray-400" numberOfLines={1}>{item.description}</Text>
                )}
                {item.itemCount > 0 && (
                    <Text className="text-orange-500 mt-1">{item.itemCount} items</Text>
                )}
            </View>
            <Feather name="chevron-right" size={24} color="#F97316" />
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 p-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Categories</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4">Loading categories...</Text>
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
                <Text className="text-white text-xl font-bold flex-1">Categories</Text>
                <Text className="text-orange-500 text-base">{filteredCategories.length} Categories</Text>
            </View>

            {/* Search Bar */}
            <View className="bg-gray-800 rounded-full flex-row items-center mb-4 px-4">
                <Feather name="search" size={20} color="#6B7280" />
                <TextInput
                    placeholder="Search categories"
                    placeholderTextColor="#6B7280"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    className="flex-1 text-white ml-2 py-3"
                />
            </View>

            {/* Categories List */}
            {filteredCategories.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400 text-center mb-4">
                        No categories found
                    </Text>
                    <TouchableOpacity
                        onPress={fetchCategories}
                        className="bg-orange-500 px-6 py-3 rounded-full"
                    >
                        <Text className="text-white font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCategoryItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
}