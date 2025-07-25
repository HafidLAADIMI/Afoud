// screens/PrivacyPolicyScreen.tsx

import {
    View,
    Text,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
    // Fonction pour envoyer un email
    const sendPrivacyEmail = () => {
        Linking.openURL('mailto:slimaneafoud1987@gmail.com')
            .catch(err => console.error('Erreur lors de l\'ouverture du client email:', err));
    };

    // Fonction pour appeler le restaurant
    const callRestaurant = () => {
        Linking.openURL('tel:+212660600602')
            .catch(err => console.error('Erreur lors de l\'ouverture de l\'app téléphone:', err));
    };

    // Fonction pour ouvrir l'adresse dans Google Maps
    const openLocation = () => {
        const address = "G8X8+5Q Casablanca 20000 Casablanca Maroc";
        const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
        Linking.openURL(url)
            .catch(err => console.error('Erreur lors de l\'ouverture de Google Maps:', err));
    };

    // Données pour les sections de politique
    const policyAreas = [
        {
            title: "Protection des données de commande",
            description: "Vos informations de livraison, préférences alimentaires et historique de commandes sont protégées selon les normes marocaines.",
            icon: "shield"
        },
        {
            title: "Politique de remboursement",
            description: "Conditions de remboursement pour livraisons, commandes à emporter et service sur place selon votre mode de commande.",
            icon: "repeat"
        },
        {
            title: "Données de géolocalisation",
            description: "Utilisation sécurisée de votre position pour les livraisons à Casablanca et environs.",
            icon: "map-pin"
        },
        {
            title: "Partage avec partenaires",
            description: "Comment nous partageons vos données avec nos livreurs et partenaires pour assurer le service.",
            icon: "share-2"
        },
        {
            title: "Stockage sécurisé",
            description: "Conservation de vos données sur nos serveurs sécurisés avec chiffrement des informations sensibles.",
            icon: "database"
        },
        {
            title: "Communications",
            description: "Gestion des notifications de commande, promotions et communications marketing personnalisées.",
            icon: "bell"
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
                        headerTitle: "Politique de Confidentialité",
                        headerTintColor: '#FFFFFF',
                        headerBackVisible: true,
                        headerShadowVisible: false
                    }}
                />
            </LinearGradient>

            <ScrollView className="flex-1 mt-14" showsVerticalScrollIndicator={false}>
                {/* En-tête de la politique */}
                <View className="px-5 py-8 bg-orange-50 rounded-b-3xl mb-5 mt-10">
                    <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
                        Politique de Confidentialité
                    </Text>
                    <Text className="text-base text-gray-600 text-center">
                        Chez Afoud, nous prenons la protection de vos données personnelles très au sérieux
                    </Text>
                </View>

                {/* Nos engagements au Maroc */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">
                        Nos engagements au Maroc
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-4">
                        Cette page présente notre politique de confidentialité et nos pratiques concernant la collecte et le traitement de vos données personnelles. En tant qu'entreprise de restauration opérant à Casablanca, nous respectons strictement la loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600 mb-4">
                        Afoud propose des services de livraison, commandes à emporter et restauration sur place. Nous collectons uniquement les données nécessaires pour assurer ces services : informations de contact, adresses de livraison, préférences culinaires et données de paiement sécurisées.
                    </Text>
                    <Text className="text-sm leading-6 text-gray-600">
                        Afoud s'engage à respecter et protéger votre vie privée conformément aux lois marocaines et aux meilleures pratiques internationales en matière de protection des données.
                    </Text>
                </View>

                {/* Types de cuisines et services */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">
                        Nos services et spécialités
                    </Text>
                    <Text className="text-sm text-gray-600 mb-3">
                        Afoud vous propose une variété de cuisines : Marocaine, Italienne, Indienne, Mexicaine, Américaine, Française et bien d'autres spécialités.
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {['Livraison', 'À emporter', 'Sur place'].map((service, index) => (
                            <View key={index} className="bg-orange-100 px-3 py-1 rounded-full">
                                <Text className="text-orange-600 text-xs font-medium">{service}</Text>
                            </View>
                        ))}
                    </View>
                    <Text className="text-sm text-gray-600">
                        Nous collectons vos préférences culinaires pour vous proposer des recommandations personnalisées tout en respectant votre confidentialité.
                    </Text>
                </View>

                {/* Nos politiques */}
                <View className="px-5 py-4">
                    <Text className="text-lg font-bold text-gray-800 mb-4">
                        Nos politiques couvrent les domaines suivants
                    </Text>

                    {policyAreas.map((policy, index) => (
                        <View key={index} className="flex-row mb-5 items-start">
                            <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mt-0.5">
                                <Feather name={policy.icon} size={18} color="#F97316" />
                            </View>
                            <View className="flex-1 ml-3">
                                <Text className="text-base font-semibold text-gray-800 mb-1">
                                    {policy.title}
                                </Text>
                                <Text className="text-sm text-gray-600 leading-5">
                                    {policy.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Horaires d'ouverture */}
                <View className="px-5 py-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-3">
                        Horaires de service
                    </Text>
                    <Text className="text-sm text-gray-600 mb-3">
                        Notre support client et nos services de confidentialité sont disponibles pendant nos heures d'ouverture :
                    </Text>
                    <View className="bg-gray-50 rounded-lg p-3">
                        <Text className="text-sm text-gray-700 mb-1">
                            • Lundi : 11h00 - 01h00
                        </Text>
                        <Text className="text-sm text-gray-700 mb-1">
                            • Mardi à Dimanche : 11h30 - 01h00
                        </Text>
                        <Text className="text-xs text-gray-500 mt-2">
                            Support confidentialité disponible pendant ces créneaux
                        </Text>
                    </View>
                </View>

                {/* Séparateur */}
                <View className="h-px bg-gray-200 mx-5 my-2" />

                {/* Coordonnées */}
                <View className="px-5 py-4 mb-4">
                    <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <View className="flex-row items-center mb-3">
                            <MaterialIcons name="update" size={18} color="#F97316" />
                            <Text className="ml-2 text-sm text-gray-600">
                                Dernière mise à jour : 25 juillet 2025
                            </Text>
                        </View>

                        <Text className="text-sm text-gray-600 mb-4">
                            Pour toute question concernant notre politique de confidentialité, contactez-nous :
                        </Text>

                        {/* Bouton Email */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-orange-500 py-3 rounded-lg mb-3"
                            onPress={sendPrivacyEmail}
                            accessibilityLabel="Envoyer un email"
                            accessibilityRole="button"
                        >
                            <Feather name="mail" size={16} color="#FFFFFF" />
                            <Text className="ml-2 text-white font-medium">
                                slimaneafoud1987@gmail.com
                            </Text>
                        </TouchableOpacity>

                        {/* Bouton Téléphone */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-green-500 py-3 rounded-lg mb-3"
                            onPress={callRestaurant}
                            accessibilityLabel="Appeler le restaurant"
                            accessibilityRole="button"
                        >
                            <Feather name="phone" size={16} color="#FFFFFF" />
                            <Text className="ml-2 text-white font-medium">
                                +212 660 600 602
                            </Text>
                        </TouchableOpacity>

                        {/* Bouton Adresse */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-blue-500 py-3 rounded-lg"
                            onPress={openLocation}
                            accessibilityLabel="Voir notre localisation"
                            accessibilityRole="button"
                        >
                            <Feather name="map-pin" size={16} color="#FFFFFF" />
                            <Text className="ml-2 text-white font-medium text-center">
                                G8X8+5Q Casablanca 20000
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Avertissement légal */}
                <View className="px-5 py-4 mb-6">
                    <View className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <Text className="text-sm text-blue-800 mb-2 font-medium">
                            Information Importante
                        </Text>
                        <Text className="text-xs text-blue-700 leading-5">
                            Ce document représente un résumé de notre politique de confidentialité.
                            Pour tout litige ou question juridique, veuillez vous référer à la version
                            complète disponible sur demande. Cette politique peut être modifiée occasionnellement
                            pour refléter les changements dans nos pratiques ou les obligations légales marocaines.
                        </Text>
                    </View>
                </View>

                {/* Information sur les données de géolocalisation */}
                <View className="px-5 py-4 mb-6">
                    <View className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <Text className="text-sm text-orange-800 mb-2 font-medium">
                            Données de Localisation
                        </Text>
                        <Text className="text-xs text-orange-700 leading-5">
                            Afoud utilise votre localisation uniquement pour optimiser les livraisons dans la région de Casablanca.
                            Vos données de géolocalisation ne sont jamais partagées avec des tiers à des fins commerciales
                            et sont supprimées après la livraison de votre commande.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}