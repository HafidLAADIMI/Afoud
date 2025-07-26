import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HelpSupportScreen() {
    // Contact information
    const contactInfo = {
        address: "G8X8+5Q Casablanca 20000 Casablanca Maroc",
        phone: "+212660600602",
        email: "slimaneafoud1987@gmail.com"
    };

    const handleCall = () => {
        Linking.openURL(`tel:${contactInfo.phone}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${contactInfo.email}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-orange-500">
            <StatusBar backgroundColor="#F97316" barStyle="light-content" />

            {/* Header */}
            <View className="flex-row items-center px-4 py-3">
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-black text-xl font-bold ml-4">Aide & Support</Text>
            </View>

            <ScrollView className="flex-1">
                <View className="px-4 py-8 items-center">
                    <Text className="text-black text-2xl font-bold">Comment Pouvons-Nous Vous Aider ?</Text>
                    <Text className="text-black text-lg mt-2">Veuillez nous faire part de votre problème !</Text>
                </View>

                {/* Contact Card */}
                <View className="mx-4 bg-neutral-900 rounded-xl overflow-hidden elevation-5 shadow-lg">
                    {/* Address Section */}
                    <View className="p-6 items-center border-b border-neutral-800">
                        <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mb-2">
                            <MaterialIcons name="location-on" size={24} color="white" />
                        </View>
                        <Text className="text-white text-lg font-bold">Adresse</Text>
                        <Text className="text-neutral-400 text-center mt-1">{contactInfo.address}</Text>
                    </View>

                    {/* Contact Options */}
                    <View className="flex-row">
                        {/* Call Option */}
                        <TouchableOpacity
                            className="flex-1 p-6 items-center border-r border-neutral-800"
                            onPress={handleCall}
                        >
                            <View className="w-12 h-12 rounded-full bg-green-500 items-center justify-center mb-2">
                                <FontAwesome name="phone" size={24} color="white" />
                            </View>
                            <Text className="text-white text-lg font-bold">Appeler</Text>
                            <Text className="text-neutral-400 mt-1">{contactInfo.phone}</Text>
                        </TouchableOpacity>

                        {/* Email Option */}
                        <TouchableOpacity
                            className="flex-1 p-6 items-center"
                            onPress={handleEmail}
                        >
                            <View className="w-12 h-12 rounded-full bg-yellow-500 items-center justify-center mb-2">
                                <MaterialIcons name="email" size={24} color="white" />
                            </View>
                            <Text className="text-white text-lg font-bold">Nous Écrire</Text>
                            <Text className="text-neutral-400 mt-1">{contactInfo.email}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FAQ or additional support options could be added here */}
            </ScrollView>
        </SafeAreaView>
    );
}