// screens/TermsConditionsScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Linking,
    Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';

export default function TermsConditionsScreen() {
    // État pour les interrupteurs d'acceptation
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptUpdates, setAcceptUpdates] = useState(false);

    // Fonction pour envoyer un email
    const contactSupport = () => {
        Linking.openURL('mailto:support@dixiefood.ma')
            .catch(err => console.error('Erreur lors de l\'ouverture du client email:', err));
    };

    // Sections des conditions générales
    const termsSections = [
        {
            title: "Commandes et livraisons",
            content: "En passant commande via notre application ou notre site web, vous acceptez de fournir des informations précises et complètes concernant votre adresse de livraison et vos coordonnées. Nous nous engageons à livrer votre commande dans les délais indiqués lors de la validation. Des frais de livraison peuvent s'appliquer en fonction de votre zone géographique et du montant de votre commande."
        },
        {
            title: "Prix et paiements",
            content: "Les prix affichés sont en Dirhams marocains (MAD) et incluent toutes les taxes applicables. Les frais de livraison sont indiqués séparément. Nous acceptons plusieurs méthodes de paiement, y compris les cartes de crédit/débit, les paiements mobiles et le paiement à la livraison. En cas de problème avec votre paiement, votre commande pourra être mise en attente ou annulée."
        },
        {
            title: "Qualité des produits",
            content: "Chez Dixie, nous nous engageons à vous offrir des produits de la plus haute qualité. Tous nos plats sont préparés avec des ingrédients frais suivant des normes d'hygiène strictes. En cas d'insatisfaction concernant la qualité de votre commande, veuillez nous contacter dans un délai de 24 heures pour obtenir un remboursement ou un remplacement."
        },
        {
            title: "Annulations et remboursements",
            content: "Les commandes peuvent être annulées sans frais avant que le restaurant ne commence à les préparer. Une fois la préparation commencée, l'annulation peut entraîner des frais. Les remboursements sont généralement traités dans un délai de 3 à 5 jours ouvrables, selon votre méthode de paiement."
        },
        {
            title: "Responsabilité et litiges",
            content: "Dixie s'engage à résoudre tout litige à l'amiable. En cas de problème avec votre commande, notre service client est disponible pour vous aider. Nous nous réservons le droit de refuser le service à notre seule discrétion. Tout litige qui ne peut être résolu à l'amiable sera soumis à la juridiction exclusive des tribunaux de Casablanca, Maroc."
        },
        {
            title: "Modifications des conditions",
            content: "Nous nous réservons le droit de modifier ces conditions générales à tout moment. Les modifications entreront en vigueur dès leur publication sur notre site ou application. Il est de votre responsabilité de consulter régulièrement nos conditions générales pour vous tenir informé des éventuelles modifications."
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* En-tête avec dégradé */}
            <LinearGradient colors={['#F97316', '#EA580C']} className="w-full h-24 absolute z-10">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        headerTransparent: true,
                        headerTitle: "Conditions Générales",
                        headerTintColor: '#FFFFFF',
                        headerBackVisible: true,
                        headerShadowVisible: false
                    }}
                />
            </LinearGradient>

            <ScrollView className="flex-1 mt-14" showsVerticalScrollIndicator={false}>
                {/* En-tête des conditions */}
                <View className="px-5 py-8 bg-orange-50 rounded-b-3xl mb-5 mt-5">
                    <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
                        Conditions Générales
                    </Text>
                    <Text className="text-base text-gray-600 text-center px-2">
                        Veuillez lire attentivement les conditions générales qui régissent l'utilisation de nos services
                    </Text>
                </View>

                {/* Introduction */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-sm leading-6 text-gray-600 mb-4">
                        Ces conditions générales définissent les termes et conditions d'utilisation des services proposés par Dixie Restaurant, accessible via notre application mobile et notre site web. En utilisant nos services, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                    </Text>
                    <View className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                        <Text className="text-sm font-medium text-amber-800 mb-1">
                            Note importante
                        </Text>
                        <Text className="text-xs text-amber-700 leading-5">
                            L'utilisation de notre application et de nos services de livraison est réservée aux personnes âgées de 18 ans ou plus. En acceptant ces conditions, vous confirmez que vous avez atteint l'âge légal requis.
                        </Text>
                    </View>
                </View>

                {/* Sections des conditions */}
                {termsSections.map((section, index) => (
                    <View key={index} className="px-5 py-4 border-b border-gray-200">
                        <Text className="text-base font-semibold text-gray-800 mb-2">
                            {index + 1}. {section.title}
                        </Text>
                        <Text className="text-sm leading-6 text-gray-600">
                            {section.content}
                        </Text>
                    </View>
                ))}

                {/* Vos droits */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">
                        Vos droits en tant que client
                    </Text>

                    <View className="mb-4">
                        <View className="flex-row mb-2 items-center">
                            <MaterialIcons name="check-circle" size={18} color="#F97316" />
                            <Text className="ml-2 text-sm text-gray-700 font-medium">
                                Droit à l'information
                            </Text>
                        </View>
                        <Text className="text-sm text-gray-600 ml-6">
                            Vous avez le droit d'être informé de manière claire sur nos produits, prix et conditions.
                        </Text>
                    </View>

                    <View className="mb-4">
                        <View className="flex-row mb-2 items-center">
                            <MaterialIcons name="check-circle" size={18} color="#F97316" />
                            <Text className="ml-2 text-sm text-gray-700 font-medium">
                                Droit à la qualité
                            </Text>
                        </View>
                        <Text className="text-sm text-gray-600 ml-6">
                            Vous êtes en droit de recevoir des produits de qualité, conformes à nos descriptions.
                        </Text>
                    </View>

                    <View className="mb-4">
                        <View className="flex-row mb-2 items-center">
                            <MaterialIcons name="check-circle" size={18} color="#F97316" />
                            <Text className="ml-2 text-sm text-gray-700 font-medium">
                                Droit de réclamation
                            </Text>
                        </View>
                        <Text className="text-sm text-gray-600 ml-6">
                            Vous pouvez formuler une réclamation en cas d'insatisfaction, qui sera traitée dans les plus brefs délais.
                        </Text>
                    </View>

                    <View>
                        <View className="flex-row mb-2 items-center">
                            <MaterialIcons name="check-circle" size={18} color="#F97316" />
                            <Text className="ml-2 text-sm text-gray-700 font-medium">
                                Droit à la confidentialité
                            </Text>
                        </View>
                        <Text className="text-sm text-gray-600 ml-6">
                            Vos données personnelles sont protégées conformément à notre politique de confidentialité.
                        </Text>
                    </View>
                </View>

                {/* Acceptation des conditions */}
                <View className="px-5 py-6 border-b border-gray-200">
                    <Text className="text-base font-semibold text-gray-800 mb-4">
                        Acceptation des conditions
                    </Text>

                    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-800 mb-1">
                                    J'accepte les conditions générales
                                </Text>
                                <Text className="text-xs text-gray-500">
                                    En activant cette option, vous confirmez avoir lu et accepté nos conditions générales.
                                </Text>
                            </View>
                            <Switch
                                value={acceptTerms}
                                onValueChange={setAcceptTerms}
                                trackColor={{ false: "#D1D5DB", true: "#FDBA74" }}
                                thumbColor={acceptTerms ? "#F97316" : "#F3F4F6"}
                                ios_backgroundColor="#D1D5DB"
                            />
                        </View>

                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-800 mb-1">
                                    Recevoir les mises à jour
                                </Text>
                                <Text className="text-xs text-gray-500">
                                    Soyez informé des modifications de nos conditions générales et de nos promotions.
                                </Text>
                            </View>
                            <Switch
                                value={acceptUpdates}
                                onValueChange={setAcceptUpdates}
                                trackColor={{ false: "#D1D5DB", true: "#FDBA74" }}
                                thumbColor={acceptUpdates ? "#F97316" : "#F3F4F6"}
                                ios_backgroundColor="#D1D5DB"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`py-3 rounded-lg items-center ${
                            acceptTerms ? 'bg-orange-500' : 'bg-gray-300'
                        }`}
                        disabled={!acceptTerms}
                    >
                        <Text className={`font-medium ${
                            acceptTerms ? 'text-white' : 'text-gray-500'
                        }`}>
                            Confirmer et continuer
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Coordonnées et mise à jour */}
                <View className="px-5 py-6">
                    <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <View className="flex-row items-center mb-3">
                            <MaterialIcons name="update" size={18} color="#F97316" />
                            <Text className="ml-2 text-sm text-gray-600">
                                Dernière mise à jour : 21 mai 2025
                            </Text>
                        </View>

                        <Text className="text-sm text-gray-600 mb-3">
                            Pour toute question concernant nos conditions générales, veuillez contacter notre service client à{' '}
                            <Text
                                className="text-orange-500 font-medium"
                                onPress={contactSupport}
                            >
                                support@dixiefood.ma
                            </Text>
                        </Text>

                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-orange-500 py-2 rounded-lg"
                            onPress={contactSupport}
                            accessibilityLabel="Contacter le service client"
                            accessibilityRole="button"
                        >
                            <Feather name="headphones" size={16} color="#FFFFFF" />
                            <Text className="ml-2 text-white font-medium">
                                Contacter le service client
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-xs text-gray-500 text-center mt-6">
                        © {new Date().getFullYear()} Dixie Restaurant. Tous droits réservés.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}