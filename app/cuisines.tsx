import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getCuisines } from '@/utils/firebase';
import { LinearGradient } from 'expo-linear-gradient';

export default function CuisinesScreen() {
    const [cuisines, setCuisines] = useState([]);
    const [filteredCuisines, setFilteredCuisines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCuisines();
    }, []);

    const fetchCuisines = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching cuisines...');
            const fetchedCuisines = await getCuisines();


            setCuisines(fetchedCuisines);
            setFilteredCuisines(fetchedCuisines);
        } catch (error) {
            console.error('Error fetching cuisines:', error);
            Alert.alert('Error', 'Failed to load cuisines. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = cuisines.filter(cuisine =>
            cuisine.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCuisines(filtered);
    };

    const handleCuisinePress = (cuisine) => {
        // Navigate to cuisine detail screen with the cuisine ID
        router.push({
            pathname: '/cuisine/[cuisineId]',
            params: { cuisineId: cuisine.id, cuisineName: cuisine.name }
        });
    };

    const retryFetch = () => {
        fetchCuisines();
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                        <Feather name="arrow-left" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={{ color: '#374151', fontSize: 20, fontWeight: 'bold' }}>Cuisines</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#a86e02" />
                    <Text style={{ color: '#6B7280', marginTop: 16 }}>Loading cuisines...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Cuisine Item Component - Separate component to isolate rendering
    const CuisineItem = ({ item, index }) => {
        // For a grid layout, determine if this is the first item in a row
        const isFirstInRow = index % 2 === 0;

        // Handle image source safely
        let imageSource;
        if (item.image) {
            if (typeof item.image === 'string') {
                imageSource = { uri: item.image };
            } else {
                imageSource = item.image;
            }
        } else {
            imageSource = require('@/assets/placeholder.png');
        }

        // Calculate restaurant count text safely
        const restaurantCountText = item.restaurantCount
            ? `${item.restaurantCount} ${item.restaurantCount === 1 ? 'Restaurant' : 'Restaurants'}`
            : '';

        return (
            <TouchableOpacity
                onPress={() => handleCuisinePress(item)}
                activeOpacity={0.8}
                style={[
                    {
                        width: '48%',
                        height: 192,
                        borderRadius: 12,
                        overflow: 'hidden',
                        marginBottom: 16,
                        marginRight: isFirstInRow ? '4%' : 0
                    },
                    styles.cardShadow
                ]}
            >
                <Image
                    source={imageSource}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    resizeMode="cover"
                />

                {/* Gradient overlay for better text visibility */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />

                {/* Content overlay */}
                <View style={{ flex: 1, justifyContent: 'flex-end', padding: 12 }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                        {item.name || ''}
                    </Text>

                    {/* Optional: Show number of restaurants */}
                    {item.restaurantCount ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Feather name="shopping-bag" size={12} color="#a86e02" />
                            <Text style={{ color: '#d1d5db', fontSize: 12, marginLeft: 4 }}>
                                {restaurantCountText}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Decorative element */}
                <View style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(168, 110, 2, 0.8)',
                    borderRadius: 999,
                    padding: 4
                }}>
                    <Feather name="chevron-right" size={16} color="white" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', padding: 16 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Feather name="arrow-left" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={{ color: '#374151', fontSize: 20, fontWeight: 'bold', flex: 1 }}>
                    Popular Cuisines
                </Text>
                <Text style={{ color: '#a86e02', fontSize: 16 }}>
                    {filteredCuisines.length} Cuisines
                </Text>
            </View>

            {/* Search Bar */}
            <View style={{
                backgroundColor: '#f9fafb',
                borderRadius: 9999,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 24,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: '#e5e7eb'
            }}>
                <Feather name="search" size={20} color="#6B7280" />
                <TextInput
                    placeholder="Search cuisines"
                    placeholderTextColor="#6B7280"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    style={{ flex: 1, color: '#374151', marginLeft: 8, paddingVertical: 12 }}
                />
            </View>

            {/* Cuisines Grid */}
            {filteredCuisines.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 16 }}>
                        No cuisines found
                    </Text>
                    <TouchableOpacity
                        onPress={retryFetch}
                        style={{ backgroundColor: '#a86e02', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredCuisines}
                    keyExtractor={(item) => item.id || String(Math.random())}
                    renderItem={({ item, index }) => <CuisineItem item={item} index={index} />}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
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