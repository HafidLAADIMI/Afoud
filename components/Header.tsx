import {View, Text, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useLocation} from '@/context/LocationContext';

const Header = ({
                    search = '',
                    setSearch = () => {},
                    isSearchScreen = false
                }) => {
    const router = useRouter();
    const {locationData} = useLocation();

    // Format the address for display in header
    const getDisplayAddress = () => {
        if (!locationData || !locationData.address) {
            return "Sélectionner l'adresse";
        }

        // If it's a full address, try to simplify it for display in header
        if (locationData.address.includes(',')) {
            // Split address by comma and take first two parts
            const addressParts = locationData.address.split(',');
            if (addressParts.length > 1) {
                // Return city and region/state, or just first two parts
                return [addressParts[0], addressParts[1]].join(', ').trim();
            }
        }

        // Return full address if we can't simplify it
        return locationData.address;
    };

    // Handle search press
    const handleSearchPress = () => {
        if (!isSearchScreen) {
            router.push('/SearchScreen');
        }
    };

    // Handle locationData press - navigate to location selection screen
    const handleLocationPress = () => {
        router.push('/location');
    };

    return (
        <View className="bg-gray-900 pt-2 pb-3 px-4 shadow-md" style={styles.header}>
            {/* Top row with location and profile */}
            <View className="flex-row justify-between items-center mb-3">
                {/* Location button */}
                <TouchableOpacity
                    className="flex-row items-center"
                    onPress={handleLocationPress}
                >
                    <Feather name="map-pin" size={18} color="#F97316"/>
                    <Text className="text-white font-medium ml-1 mr-2" numberOfLines={1} ellipsizeMode="tail"
                          style={{maxWidth: 200}}>
                        {getDisplayAddress()}
                    </Text>
                    <Feather name="chevron-down" size={16} color="#F97316"/>
                </TouchableOpacity>

                {/* User profile and actions */}
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.push('/profileScreen')}>
                        <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center">
                            <Feather name="user" size={18} color="white"/>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search bar */}
            {isSearchScreen ? (
                // Interactive search input on search screen
                <View className="flex-row items-center bg-gray-800 px-3 py-2 rounded-xl">
                    <Feather name="search" size={20} color="#9CA3AF"/>
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Chercher des plats ..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-2 text-white"
                        autoFocus={true}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Feather name="x" size={20} color="#9CA3AF"/>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                // Non-interactive search bar that redirects to search screen
                <TouchableOpacity
                    onPress={handleSearchPress}
                    className="flex-row items-center bg-gray-800 px-3 py-2 rounded-xl"
                >
                    <Feather name="search" size={20} color="#9CA3AF"/>
                    <Text className="flex-1 ml-2 text-gray-400">Chercher des plats ...</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
});

export default Header;