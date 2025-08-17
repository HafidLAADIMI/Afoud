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
        email: "slimaneAfood1987@gmail.com"
    };

    const handleCall = () => {
        Linking.openURL(`tel:${contactInfo.phone}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${contactInfo.email}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="#F9FAFB" barStyle="dark-content" />

            {/* Header */}
            <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-200">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-4"
                >
                    <Feather name="arrow-left" size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-gray-900 text-xl font-bold">Aide & Support</Text>
            </View>

            <ScrollView className="flex-1">
                <View className="px-5 py-8 items-center">
                    <View className="w-20 h-20 rounded-full bg-yellow-50 items-center justify-center mb-6">
                        <Feather name="help-circle" size={40} color="#a86e02" />
                    </View>
                    <Text className="text-gray-900 text-2xl font-bold text-center mb-3">
                        Comment Pouvons-Nous Vous Aider ?
                    </Text>
                    <Text className="text-gray-600 text-lg text-center leading-6">
                        Veuillez nous faire part de votre problème !
                    </Text>
                </View>

                {/* Contact Card */}
                <View className="mx-5 bg-white rounded-2xl overflow-hidden border border-gray-200" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 8,
                }}>
                    {/* Address Section */}
                    <View className="p-6 items-center border-b border-gray-100 bg-blue-50">
                        <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
                            <MaterialIcons name="location-on" size={28} color="#2563EB" />
                        </View>
                        <Text className="text-gray-900 text-xl font-bold mb-2">Notre Adresse</Text>
                        <Text className="text-gray-600 text-center leading-6">
                            {contactInfo.address}
                        </Text>
                    </View>

                    {/* Contact Options */}
                    <View className="flex-row">
                        {/* Call Option */}
                        <TouchableOpacity
                            className="flex-1 p-6 items-center border-r border-gray-100"
                            onPress={handleCall}
                            activeOpacity={0.8}
                        >
                            <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
                                <FontAwesome name="phone" size={24} color="#059669" />
                            </View>
                            <Text className="text-gray-900 text-lg font-bold mb-2">Appeler</Text>
                            <Text className="text-gray-600 text-center text-sm">
                                {contactInfo.phone}
                            </Text>
                        </TouchableOpacity>

                        {/* Email Option */}
                        <TouchableOpacity
                            className="flex-1 p-6 items-center"
                            onPress={handleEmail}
                            activeOpacity={0.8}
                        >
                            <View className="w-16 h-16 rounded-full bg-yellow-50 items-center justify-center mb-4">
                                <MaterialIcons name="email" size={24} color="#a86e02" />
                            </View>
                            <Text className="text-gray-900 text-lg font-bold mb-2">Nous Écrire</Text>
                            <Text className="text-gray-600 text-center text-sm">
                                {contactInfo.email}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Help Section */}
                <View className="mx-5 mt-6 bg-white rounded-2xl border border-gray-200 p-5">
                    <Text className="text-gray-900 text-lg font-bold mb-4">Questions Fréquentes</Text>
                    
                    <View className="space-y-4">
                        <View className="flex-row items-start">
                            <View className="w-6 h-6 rounded-full bg-yellow-50 items-center justify-center mr-3 mt-1">
                                <Feather name="clock" size={14} color="#a86e02" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-semibold text-base mb-1">
                                    Délai de livraison
                                </Text>
                                <Text className="text-gray-600 text-sm leading-5">
                                    Nos livraisons prennent généralement 30-45 minutes selon votre zone
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-start">
                            <View className="w-6 h-6 rounded-full bg-yellow-50 items-center justify-center mr-3 mt-1">
                                <Feather name="credit-card" size={14} color="#a86e02" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-semibold text-base mb-1">
                                    Modes de paiement
                                </Text>
                                <Text className="text-gray-600 text-sm leading-5">
                                    Nous acceptons le paiement à la livraison et les cartes bancaires
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-start">
                            <View className="w-6 h-6 rounded-full bg-yellow-50 items-center justify-center mr-3 mt-1">
                                <Feather name="map-pin" size={14} color="#a86e02" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-semibold text-base mb-1">
                                    Zone de livraison
                                </Text>
                                <Text className="text-gray-600 text-sm leading-5">
                                    Nous livrons dans tout Casablanca et ses environs
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Emergency Contact */}
                <View className="mx-5 mt-6 mb-8 bg-red-50 rounded-2xl border border-red-200 p-5">
                    <View className="flex-row items-center mb-3">
                        <Feather name="alert-circle" size={20} color="#DC2626" />
                        <Text className="text-red-800 font-bold text-lg ml-2">
                            Problème Urgent ?
                        </Text>
                    </View>
                    <Text className="text-red-700 text-sm mb-4 leading-5">
                        Pour les problèmes urgents concernant votre commande en cours, appelez-nous directement.
                    </Text>
                    <TouchableOpacity
                        className="bg-red-600 py-3 rounded-xl items-center"
                        onPress={handleCall}
                        activeOpacity={0.9}
                    >
                        <Text className="text-white font-bold text-base">
                            Appel d'Urgence
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}