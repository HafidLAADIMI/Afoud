import { View, TouchableOpacity, Animated } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';

const BottomNav = () => {
    const [activeTab, setActiveTab] = useState('home');
    const cartButtonScale = useRef(new Animated.Value(1)).current;

    const handleCartPress = () => {
        Animated.sequence([
            Animated.timing(cartButtonScale, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(cartButtonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();
    };

    return (
        <View className="bg-black border-t border-neutral-800 pt-2 pb-6">
            {/* Cart Button */}
            <Animated.View
                style={{
                    transform: [{ scale: cartButtonScale }],
                    position: 'absolute',
                    top: -20,
                    alignSelf: 'center',
                    zIndex: 10,
                }}
            >
                <TouchableOpacity
                    onPress={handleCartPress}
                    className="w-14 h-14 rounded-full bg-black border-2 border-blue-500 justify-center items-center"
                >
                    <FontAwesome name="shopping-cart" size={26} color="white" />
                </TouchableOpacity>
            </Animated.View>

            {/* Bottom Navigation Icons */}
            <View className="flex-row justify-between items-center px-8">
                <TouchableOpacity
                    onPress={() => setActiveTab('home')}
                    className="items-center"
                >
                    <Feather name="home" size={24} color={activeTab === 'home' ? 'orange' : 'white'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('favorites')}
                    className="items-center"
                >
                    <Feather name="heart" size={24} color={activeTab === 'favorites' ? 'orange' : 'white'} />
                </TouchableOpacity>

                <View className="w-14" /> {/* Placeholder for center button */}

                <TouchableOpacity
                    onPress={() => setActiveTab('orders')}
                    className="items-center"
                >
                    <Feather name="shopping-bag" size={24} color={activeTab === 'orders' ? 'orange' : 'white'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('profile')}
                    className="items-center"
                >
                    <Feather name="menu" size={24} color={activeTab === 'profile' ? 'orange' : 'white'} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BottomNav;