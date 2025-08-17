// screens/AboutScreen.tsx
import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Linking,
    StatusBar,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';

export default function AboutScreen() {
    // Informations statiques sur le restaurant
    const RESTAURANT_INFO = {
        name: 'Afood',
        tagline: 'Saveurs authentiques du monde à Casablanca',
        description: 'Afood est votre destination culinaire pour découvrir les saveurs authentiques du monde. Nos recettes traditionnelles et notre engagement envers la qualité nous distinguent depuis notre ouverture.',
        foundedYear: 2020,
        address: 'G8X8+5Q Casablanca 20000, Maroc',
        phone: '+212 660 600 602',
        email: 'slimaneAfood1987@gmail.com',
        website: 'www.Afood.ma',
        socialMedia: [
            { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com/Afoodrestaurant' },
            { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/Afoodrestaurant' },
            { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com/Afoodrestaurant' }
        ],
        features: [
            { name: 'Livraison Rapide', icon: 'truck' },
            { name: 'Ingrédients Frais', icon: 'leaf' },
            { name: 'Service de Qualité', icon: 'star' },
            { name: 'Commandes en Ligne', icon: 'shopping-cart' }
        ],
        cuisineTypes: ['Marocaine', 'Italienne', 'Asiatique', 'Française', 'Américaine', 'Indienne'],
        openingHours: [
            { day: 'Lundi', hours: '11h00 - 01h00' },
            { day: 'Mardi', hours: '11h30 - 01h00' },
            { day: 'Mercredi', hours: '11h30 - 01h00' },
            { day: 'Jeudi', hours: '11h30 - 01h00' },
            { day: 'Vendredi', hours: '11h30 - 01h00' },
            { day: 'Samedi', hours: '11h30 - 01h00' },
            { day: 'Dimanche', hours: '11h30 - 01h00' }
        ],
        appVersion: '1.0.0'
    };

    // Fonction pour ouvrir les liens externes
    const openLink = (url) => {
        Linking.openURL(url).catch((err) => console.error('Erreur lors de l\'ouverture du lien:', err));
    };

    // Fonction pour composer un numéro de téléphone
    const callPhone = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
            console.error('Erreur lors de l\'appel téléphonique:', err)
        );
    };

    // Fonction pour envoyer un email
    const sendEmail = (emailAddress) => {
        Linking.openURL(`mailto:${emailAddress}`).catch((err) =>
            console.error('Erreur lors de l\'envoi d\'email:', err)
        );
    };

    // Fonction pour ouvrir la localisation sur Google Maps
    const openLocation = (address) => {
        const encodedAddress = encodeURIComponent(address);
        const url = Platform.select({
            ios: `maps:0,0?q=${encodedAddress}`,
            android: `geo:0,0?q=${encodedAddress}`
        });
        Linking.openURL(url).catch((err) =>
            console.error('Erreur lors de l\'ouverture de la localisation:', err)
        );
    };

    const restaurantLogo = require('@/assets/logo.jpg');

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="#F9FAFB" barStyle="dark-content" />

            {/* En-tête avec dégradé */}
            <LinearGradient colors={['#a86e02', '#8b5a02']} className="w-full h-24 absolute z-10">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        headerTransparent: true,
                        headerTitle: "À Propos",
                        headerTintColor: '#FFFFFF',
                        headerBackVisible: true,
                        headerShadowVisible: false
                    }}
                />
            </LinearGradient>

            <ScrollView className="flex-1 mt-14" showsVerticalScrollIndicator={false}>
                {/* Logo et informations principales */}
                <View className="items-center justify-center py-14 bg-yellow-50 rounded-b-3xl mb-5 border border-yellow-100">
                    <Image
                        source={restaurantLogo}
                        className="w-24 h-24 mb-3 rounded-2xl"
                        resizeMode="contain"
                    />
                    <Text className="text-2xl font-bold text-gray-900 mb-1">{RESTAURANT_INFO.name}</Text>
                    <Text className="text-base text-gray-600 italic text-center px-4 leading-6">{RESTAURANT_INFO.tagline}</Text>
                </View>

                {/* Caractéristiques */}
                <View className="px-5 py-4 bg-white mx-5 rounded-xl mb-4" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text className="text-lg font-bold text-gray-900 mb-3">Nos Points Forts</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {RESTAURANT_INFO.features.map((feature, index) => (
                            <View key={index} className="flex-col items-center w-[48%] bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
                                <Feather name={feature.icon} size={24} color="#a86e02" />
                                <Text className="mt-2 text-sm text-gray-600 text-center font-medium">{feature.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Notre histoire */}
                <View className="px-5 py-4 bg-white mx-5 rounded-xl mb-4" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text className="text-lg font-bold text-gray-900 mb-3">Notre Histoire</Text>
                    <Text className="text-base font-semibold text-gray-800 mb-2">
                        Notre fondateur : un passionné de cuisine internationale
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Notre fondateur est un véritable explorateur culinaire, dont la passion pour les saveurs du monde l'a mené à découvrir les secrets des cuisines traditionnelles. C'est lors de ses voyages à travers l'Europe, l'Asie et les Amériques qu'il a développé une profonde appréciation pour la diversité gastronomique mondiale.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        De retour au Maroc, inspiré par ces rencontres culinaires exceptionnelles, il a décidé d'ouvrir Afood. Son rêve ? Créer un restaurant qui célèbre la richesse des traditions culinaires internationales, tout en respectant l'art de vivre marocain.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Aujourd'hui, Afood incarne cette vision multiculturelle, en proposant une cuisine fusion qui raconte l'histoire des saveurs du monde, adaptées aux goûts locaux avec passion et authenticité.
                    </Text>
                </View>

                {/* Notre mission */}
                <View className="px-5 py-4 bg-white mx-5 rounded-xl mb-4" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text className="text-lg font-bold text-gray-900 mb-3">Notre Mission</Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Chez Afood, notre mission est de faire découvrir les saveurs authentiques du monde à travers une cuisine de qualité, préparée avec amour et expertise. Nous croyons que la gastronomie est un langage universel qui unit les cultures et crée des moments de partage inoubliables.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Nous nous engageons à sélectionner les meilleurs ingrédients, à maintenir des standards d'excellence élevés, et à offrir une expérience culinaire exceptionnelle que ce soit en livraison, à emporter ou sur place. Notre objectif : que chaque repas chez Afood soit une invitation au voyage gustatif.
                    </Text>
                </View>

                {/* Types de cuisine */}
                <View className="px-5 py-4 bg-white mx-5 rounded-xl mb-4" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text className="text-lg font-bold text-gray-900 mb-3">Nos Cuisines</Text>
                    <View className="flex-row flex-wrap">
                        {RESTAURANT_INFO.cuisineTypes.map((cuisine, index) => (
                            <View key={index} className="bg-yellow-50 rounded-full px-3 py-1.5 mr-2 mb-2 border border-yellow-200">
                                <Text className="text-xs text-yellow-700 font-medium">{cuisine}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Horaires */}
                <View className="px-5 py-4 bg-white mx-5 rounded-xl mb-4" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text className="text-lg font-bold text-gray-900 mb-3">Horaires d'Ouverture</Text>
                    <View className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        {RESTAURANT_INFO.openingHours.map((schedule, index) => (
                            <View key={index} className="flex-row justify-between py-1.5">
                                <Text className="text-sm text-gray-600 font-medium">{schedule.day}</Text>
                                <Text className="text-sm font-semibold text-gray-900">{schedule.hours}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Coordonnées */}
                <View className="px-5 py-4 bg-white mx-5 rounded-xl mb-4" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text className="text-lg font-bold text-gray-900 mb-3">Nous Contacter</Text>

                    <TouchableOpacity
                        className="flex-row items-center py-3 bg-gray-50 rounded-lg mb-3 px-3"
                        onPress={() => openLocation(RESTAURANT_INFO.address)}
                        accessibilityLabel="Adresse du restaurant"
                        accessibilityRole="button"
                        activeOpacity={0.8}
                    >
                        <Feather name="map-pin" size={20} color="#a86e02" />
                        <Text className="ml-3 text-sm text-gray-600 flex-1">{RESTAURANT_INFO.address}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-3 bg-gray-50 rounded-lg mb-3 px-3"
                        onPress={() => callPhone(RESTAURANT_INFO.phone)}
                        accessibilityLabel="Numéro de téléphone"
                        accessibilityRole="button"
                        activeOpacity={0.8}
                    >
                        <Feather name="phone" size={20} color="#a86e02" />
                        <Text className="ml-3 text-sm text-gray-600">{RESTAURANT_INFO.phone}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-3 bg-gray-50 rounded-lg mb-3 px-3"
                        onPress={() => sendEmail(RESTAURANT_INFO.email)}
                        accessibilityLabel="Adresse email"
                        accessibilityRole="button"
                        activeOpacity={0.8}
                    >
                        <Feather name="mail" size={20} color="#a86e02" />
                        <Text className="ml-3 text-sm text-gray-600">{RESTAURANT_INFO.email}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-3 bg-gray-50 rounded-lg px-3"
                        onPress={() => openLink(`https://${RESTAURANT_INFO.website}`)}
                        accessibilityLabel="Site web"
                        accessibilityRole="button"
                        activeOpacity={0.8}
                    >
                        <Feather name="globe" size={20} color="#a86e02" />
                        <Text className="ml-3 text-sm text-gray-600">{RESTAURANT_INFO.website}</Text>
                    </TouchableOpacity>
                </View>

                {/* Réseaux sociaux */}
                <View className="px-5 py-4 bg-white mx-5 rounded-xl mb-4" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text className="text-lg font-bold text-gray-900 mb-3">Suivez-nous</Text>
                    <View className="flex-row justify-center my-2">
                        {RESTAURANT_INFO.socialMedia.map((social, index) => (
                            <TouchableOpacity
                                key={index}
                                className="w-12 h-12 rounded-full justify-center items-center mx-2.5"
                                style={{ backgroundColor: '#a86e02' }}
                                onPress={() => openLink(social.url)}
                                accessibilityLabel={`${social.name}`}
                                accessibilityRole="button"
                                activeOpacity={0.9}
                            >
                                <FontAwesome name={social.icon} size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Version de l'application */}
                <View className="items-center p-5">
                    <Text className="text-xs text-gray-400 mb-1">Version {RESTAURANT_INFO.appVersion}</Text>
                    <Text className="text-xs text-gray-400 text-center">
                        © {new Date().getFullYear()} Afood Restaurant. Tous droits réservés.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}