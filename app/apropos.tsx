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
        name: 'Afoud',
        tagline: 'Saveurs authentiques du monde à Casablanca',
        description: 'Afoud est votre destination culinaire pour découvrir les saveurs authentiques du monde. Nos recettes traditionnelles et notre engagement envers la qualité nous distinguent depuis notre ouverture.',
        foundedYear: 2020,
        address: 'G8X8+5Q Casablanca 20000, Maroc',
        phone: '+212 660 600 602',
        email: 'slimaneafoud1987@gmail.com',
        website: 'www.afoud.ma',
        socialMedia: [
            { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com/afoudrestaurant' },
            { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/afoudrestaurant' },
            { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com/afoudrestaurant' }
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
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* En-tête avec dégradé */}
            <LinearGradient colors={['#F97316', '#EA580C']} className="w-full h-24 absolute z-10">
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
                <View className="items-center justify-center py-14 bg-orange-50 rounded-b-3xl mb-5">
                    <Image
                        source={restaurantLogo}
                        className="w-24 h-24 mb-3"
                        resizeMode="contain"
                    />
                    <Text className="text-2xl font-bold text-gray-800 mb-1">{RESTAURANT_INFO.name}</Text>
                    <Text className="text-base text-gray-600 italic">{RESTAURANT_INFO.tagline}</Text>
                </View>

                {/* Caractéristiques */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Nos Points Forts</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {RESTAURANT_INFO.features.map((feature, index) => (
                            <View key={index} className="flex-col items-center w-[48%] bg-gray-50 rounded-lg p-4 mb-3">
                                <Feather name={feature.icon} size={24} color="#F97316" />
                                <Text className="mt-2 text-sm text-gray-600 text-center">{feature.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Notre histoire */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Notre Histoire</Text>
                    <Text className="text-base font-semibold text-gray-700 mb-2">
                        Notre fondateur : un passionné de cuisine internationale
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Notre fondateur est un véritable explorateur culinaire, dont la passion pour les saveurs du monde l'a mené à découvrir les secrets des cuisines traditionnelles. C'est lors de ses voyages à travers l'Europe, l'Asie et les Amériques qu'il a développé une profonde appréciation pour la diversité gastronomique mondiale.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        De retour au Maroc, inspiré par ces rencontres culinaires exceptionnelles, il a décidé d'ouvrir Afoud. Son rêve ? Créer un restaurant qui célèbre la richesse des traditions culinaires internationales, tout en respectant l'art de vivre marocain.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Aujourd'hui, Afoud incarne cette vision multiculturelle, en proposant une cuisine fusion qui raconte l'histoire des saveurs du monde, adaptées aux goûts locaux avec passion et authenticité.
                    </Text>
                </View>

                {/* Notre mission */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Notre Mission</Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Chez Afoud, notre mission est de faire découvrir les saveurs authentiques du monde à travers une cuisine de qualité, préparée avec amour et expertise. Nous croyons que la gastronomie est un langage universel qui unit les cultures et crée des moments de partage inoubliables.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Nous nous engageons à sélectionner les meilleurs ingrédients, à maintenir des standards d'excellence élevés, et à offrir une expérience culinaire exceptionnelle que ce soit en livraison, à emporter ou sur place. Notre objectif : que chaque repas chez Afoud soit une invitation au voyage gustatif.
                    </Text>
                </View>

                {/* Types de cuisine */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Nos Cuisines</Text>
                    <View className="flex-row flex-wrap">
                        {RESTAURANT_INFO.cuisineTypes.map((cuisine, index) => (
                            <View key={index} className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2">
                                <Text className="text-xs text-gray-600">{cuisine}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Spécialités */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Nos Spécialités Culinaires</Text>

                    <View className="mb-4 pb-3 border-b border-gray-100">
                        <Text className="text-base font-semibold text-orange-500 mb-1">Cuisine Marocaine Authentique</Text>
                        <Text className="text-sm leading-6 text-gray-600">
                            Découvrez nos tagines traditionnels, couscous parfumés et pastillas croustillantes, préparés selon les recettes ancestrales transmises de génération en génération.
                        </Text>
                    </View>

                    <View className="mb-4 pb-3 border-b border-gray-100">
                        <Text className="text-base font-semibold text-orange-500 mb-1">Spécialités Italiennes</Text>
                        <Text className="text-sm leading-6 text-gray-600">
                            Savourez nos pizzas artisanales, pâtes fraîches et risottos crémeux, préparés avec des ingrédients importés d'Italie et un savoir-faire authentique.
                        </Text>
                    </View>

                    <View className="mb-4 pb-3 border-b border-gray-100">
                        <Text className="text-base font-semibold text-orange-500 mb-1">Cuisine Asiatique Fusion</Text>
                        <Text className="text-sm leading-6 text-gray-600">
                            Explorez nos plats inspirés de la cuisine indienne, thaïlandaise et chinoise, avec des épices soigneusement sélectionnées et des techniques de cuisson traditionnelles.
                        </Text>
                    </View>

                    <View className="mb-4 pb-3 border-b border-gray-100">
                        <Text className="text-base font-semibold text-orange-500 mb-1">Grillades & Barbecue</Text>
                        <Text className="text-sm leading-6 text-gray-600">
                            Nos viandes grillées, poissons frais et brochettes sont marinés dans nos mélanges d'épices maison et cuits à la perfection sur nos grills traditionnels.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-base font-semibold text-orange-500 mb-1">Options Végétariennes & Saines</Text>
                        <Text className="text-sm leading-6 text-gray-600">
                            Notre sélection de plats végétariens, salades composées et bowls santé vous offre des alternatives délicieuses et équilibrées pour tous les goûts.
                        </Text>
                    </View>
                </View>

                {/* Zones de livraison */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Nos Services de Livraison</Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Nous livrons dans tout Casablanca et ses environs. Notre service de livraison rapide garantit des plats chauds et frais, livrés dans les meilleurs délais pour préserver la qualité de nos préparations.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-3">
                        Pour passer commande, contactez-nous au {RESTAURANT_INFO.phone} ou utilisez notre application mobile pour une expérience simplifiée.
                    </Text>

                    <View className="mt-4 bg-amber-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <Text className="text-sm font-bold text-amber-800">
                            Livraison GRATUITE pour toute commande supérieure à 200dh !
                        </Text>
                    </View>
                </View>

                {/* Horaires */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Horaires d'Ouverture</Text>
                    {RESTAURANT_INFO.openingHours.map((schedule, index) => (
                        <View key={index} className="flex-row justify-between py-1.5">
                            <Text className="text-sm text-gray-600">{schedule.day}</Text>
                            <Text className="text-sm font-medium text-gray-800">{schedule.hours}</Text>
                        </View>
                    ))}
                </View>

                {/* Coordonnées */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Nous Contacter</Text>

                    <TouchableOpacity
                        className="flex-row items-center py-2.5"
                        onPress={() => openLocation(RESTAURANT_INFO.address)}
                        accessibilityLabel="Adresse du restaurant"
                        accessibilityRole="button"
                    >
                        <Feather name="map-pin" size={20} color="#F97316" />
                        <Text className="ml-3 text-sm text-gray-600">{RESTAURANT_INFO.address}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-2.5"
                        onPress={() => callPhone(RESTAURANT_INFO.phone)}
                        accessibilityLabel="Numéro de téléphone"
                        accessibilityRole="button"
                    >
                        <Feather name="phone" size={20} color="#F97316" />
                        <Text className="ml-3 text-sm text-gray-600">{RESTAURANT_INFO.phone}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-2.5"
                        onPress={() => sendEmail(RESTAURANT_INFO.email)}
                        accessibilityLabel="Adresse email"
                        accessibilityRole="button"
                    >
                        <Feather name="mail" size={20} color="#F97316" />
                        <Text className="ml-3 text-sm text-gray-600">{RESTAURANT_INFO.email}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-2.5"
                        onPress={() => openLink(`https://${RESTAURANT_INFO.website}`)}
                        accessibilityLabel="Site web"
                        accessibilityRole="button"
                    >
                        <Feather name="globe" size={20} color="#F97316" />
                        <Text className="ml-3 text-sm text-gray-600">{RESTAURANT_INFO.website}</Text>
                    </TouchableOpacity>
                </View>

                {/* Réseaux sociaux */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Suivez-nous</Text>
                    <View className="flex-row justify-center my-2">
                        {RESTAURANT_INFO.socialMedia.map((social, index) => (
                            <TouchableOpacity
                                key={index}
                                className="w-10 h-10 rounded-full bg-orange-500 justify-center items-center mx-2.5"
                                onPress={() => openLink(social.url)}
                                accessibilityLabel={`${social.name}`}
                                accessibilityRole="button"
                            >
                                <FontAwesome name={social.icon} size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Politique de confidentialité et CGU */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <View className="flex-row justify-center items-center my-1">
                        <TouchableOpacity className="px-2.5 py-1">
                            <Text className="text-xs text-orange-500">Politique de Confidentialité</Text>
                        </TouchableOpacity>
                        <View className="w-px h-4 bg-gray-300" />
                        <TouchableOpacity className="px-2.5 py-1">
                            <Text className="text-xs text-orange-500">Conditions d'Utilisation</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Version de l'application */}
                <View className="items-center p-5">
                    <Text className="text-xs text-gray-400 mb-1">Version {RESTAURANT_INFO.appVersion}</Text>
                    <Text className="text-xs text-gray-400 text-center">
                        © {new Date().getFullYear()} Afoud Restaurant. Tous droits réservés.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}