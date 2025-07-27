// components/PrivacyDisclosure.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    SafeAreaView,
    Linking,
    Platform,
    StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PrivacyDisclosureProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export const PrivacyDisclosure: React.FC<PrivacyDisclosureProps> = ({
                                                                        visible,
                                                                        onAccept,
                                                                        onDecline,
                                                                    }) => {
    const [showFullPolicy, setShowFullPolicy] = useState(false);

    const openExternalPolicy = () => {
        Linking.openURL('https://afoud.ma').catch(err => 
            console.error('Error opening URL:', err)
        );
    };

    if (showFullPolicy) {
        return (
            <Modal 
                visible={visible} 
                animationType="slide" 
                presentationStyle="fullScreen"
            >
                <View style={{ flex: 1, backgroundColor: '#111827' }}>
                    <StatusBar barStyle="light-content" backgroundColor="#111827" />
                    
                    {/* Simple Header */}
                    <SafeAreaView style={{ backgroundColor: '#111827' }}>
                        <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#374151'
                        }}>
                            <TouchableOpacity
                                onPress={() => setShowFullPolicy(false)}
                                style={{
                                    backgroundColor: '#374151',
                                    borderRadius: 20,
                                    padding: 8,
                                    minWidth: 40,
                                    minHeight: 40,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Feather name="arrow-left" size={20} color="white" />
                            </TouchableOpacity>
                            
                            <Text style={{ 
                                color: 'white', 
                                fontSize: 18, 
                                fontWeight: 'bold',
                                flex: 1,
                                textAlign: 'center',
                                marginHorizontal: 16
                            }}>
                                Politique Complète
                            </Text>
                            
                            <View style={{ width: 40 }} />
                        </View>
                    </SafeAreaView>

                    {/* Content */}
                    <ScrollView 
                        style={{ flex: 1 }}
                        contentContainerStyle={{ 
                            padding: 20,
                            paddingBottom: Platform.OS === 'android' ? 100 : 80
                        }}
                        showsVerticalScrollIndicator={true}
                    >
                        <Text style={{ color: 'white', fontSize: 16, marginBottom: 16 }}>
                            <Text style={{ fontWeight: 'bold' }}>Dernière mise à jour :</Text> 25 juillet 2025
                        </Text>

                        <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
                            Cette Politique de Confidentialité décrit nos politiques et procédures concernant la collecte,
                            l'utilisation et la divulgation de vos informations lorsque vous utilisez le Service et vous
                            informe de vos droits à la confidentialité et de la façon dont la loi vous protège.
                        </Text>

                        <Text style={{ color: '#F97316', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                            Données Collectées
                        </Text>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                                📧 Informations Personnelles
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 18, marginBottom: 16 }}>
                                • Adresse e-mail{'\n'}
                                • Numéro de téléphone{'\n'}
                                • Adresse, État, Province, Code postal, Ville{'\n'}
                                • Données d'utilisation
                            </Text>
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                                📍 Informations de Localisation
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 18, marginBottom: 16 }}>
                                Avec votre permission préalable, nous pouvons collecter des informations
                                concernant votre localisation pour fournir les fonctionnalités de notre application.
                            </Text>
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                                📊 Données d'Utilisation
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 18, marginBottom: 16 }}>
                                Collectées automatiquement, incluant :{'\n'}
                                • Adresse IP de votre appareil{'\n'}
                                • Type et version du navigateur{'\n'}
                                • Pages visitées et temps passé{'\n'}
                                • Identifiants uniques de l'appareil{'\n'}
                                • Données de diagnostic
                            </Text>
                        </View>

                        <Text style={{ color: '#F97316', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                            Utilisation de Vos Données
                        </Text>

                        <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
                            Nous utilisons vos données personnelles pour :{'\n'}
                            • Fournir et maintenir notre Service{'\n'}
                            • Gérer votre compte utilisateur{'\n'}
                            • Exécuter des contrats d'achat{'\n'}
                            • Vous contacter avec des mises à jour{'\n'}
                            • Vous fournir des offres spéciales{'\n'}
                            • Gérer vos demandes{'\n'}
                            • Analyser l'utilisation et améliorer le Service
                        </Text>

                        <Text style={{ color: '#F97316', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                            Partage de Vos Données
                        </Text>

                        <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
                            Nous pouvons partager vos informations :{'\n'}
                            • Avec des prestataires de services{'\n'}
                            • Lors de transferts d'entreprise{'\n'}
                            • Avec des affiliés et partenaires{'\n'}
                            • Avec votre consentement{'\n'}
                            • Pour des exigences légales
                        </Text>

                        <Text style={{ color: '#F97316', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                            Vos Droits
                        </Text>

                        <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
                            Vous avez le droit de :{'\n'}
                            • Accéder à vos données personnelles{'\n'}
                            • Corriger ou mettre à jour vos informations{'\n'}
                            • Supprimer vos données{'\n'}
                            • Retirer votre consentement{'\n'}
                            • Désactiver l'accès à la localisation
                        </Text>

                        <View style={{ 
                            backgroundColor: '#374151', 
                            padding: 16, 
                            borderRadius: 8, 
                            marginBottom: 20 
                        }}>
                            <Text style={{ color: 'white', fontWeight: '600', marginBottom: 8 }}>
                                📞 Contact
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14 }}>
                                Email: slimaneafoud1987@gmail.com{'\n'}
                                Téléphone: +212 660 600 602{'\n'}
                                Site web: https://afoud.ma
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Fixed Bottom Buttons */}
                    <SafeAreaView style={{ backgroundColor: '#111827' }}>
                        <View style={{ 
                            flexDirection: 'row', 
                            paddingHorizontal: 16, 
                            paddingVertical: 12,
                            gap: 12,
                            borderTopWidth: 1,
                            borderTopColor: '#374151'
                        }}>
                            <TouchableOpacity
                                onPress={onDecline}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#4B5563',
                                    paddingVertical: 16,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    minHeight: 50
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                                    Refuser
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onAccept}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#F97316',
                                    paddingVertical: 16,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    minHeight: 50
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                                    Accepter et Continuer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        );
    }

    return (
        <Modal 
            visible={visible} 
            animationType="slide" 
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        >
            <View style={{ flex: 1, backgroundColor: '#111827' }}>
                <StatusBar barStyle="light-content" backgroundColor="#111827" />
                
                <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
                    {/* Header */}
                    <View style={{ padding: 20, paddingBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <Feather name="shield" size={24} color="#F97316" />
                            <Text style={{ 
                                color: 'white', 
                                fontSize: 20, 
                                fontWeight: 'bold', 
                                marginLeft: 12 
                            }}>
                                Confidentialité et Données
                            </Text>
                        </View>

                        {/* Read Full Policy Button - Moved to Top */}
                        <TouchableOpacity
                            onPress={() => setShowFullPolicy(true)}
                            style={{
                                backgroundColor: '#374151',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20
                            }}
                        >
                            <Text style={{ color: '#F97316', fontWeight: '600', marginRight: 8 }}>
                                Lire la politique complète
                            </Text>
                            <Feather name="external-link" size={16} color="#F97316" />
                        </TouchableOpacity>
                    </View>

                    {/* Scrollable Content */}
                    <ScrollView 
                        style={{ flex: 1 }}
                        contentContainerStyle={{ 
                            paddingHorizontal: 20,
                            paddingBottom: Platform.OS === 'android' ? 100 : 80
                        }}
                        showsVerticalScrollIndicator={true}
                    >
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
                            Bienvenue chez Afoud
                        </Text>

                        <Text style={{ color: '#D1D5DB', fontSize: 16, lineHeight: 22, marginBottom: 20 }}>
                            Nous respectons votre vie privée et sommes transparents sur la façon dont nous utilisons vos données pour vous offrir la meilleure expérience culinaire avec nos saveurs authentiques du monde.
                        </Text>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: '#F97316', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                                📍 Localisation
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 18, marginBottom: 16 }}>
                                • Trouvez les restaurants les plus proches de vous{'\n'}
                                • Calculez les frais de livraison précis{'\n'}
                                • Optimisez les temps de livraison à Casablanca{'\n'}
                                • Suivez vos commandes en temps réel
                            </Text>
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: '#F97316', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                                👤 Informations Personnelles
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 18, marginBottom: 16 }}>
                                • Email et nom pour votre compte{'\n'}
                                • Adresse de livraison{'\n'}
                                • Numéro de téléphone pour vous contacter{'\n'}
                                • Historique des commandes pour personnaliser vos recommandations culinaires
                            </Text>
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: '#F97316', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                                📊 Données d'Utilisation
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 18, marginBottom: 16 }}>
                                • Améliorer les performances de l'application{'\n'}
                                • Personnaliser vos recommandations culinaires{'\n'}
                                • Résoudre les problèmes techniques{'\n'}
                                • Analyser les tendances pour de meilleures offres gastronomiques
                            </Text>
                        </View>

                        <View style={{ 
                            backgroundColor: '#374151', 
                            padding: 16, 
                            borderRadius: 8, 
                            marginBottom: 20 
                        }}>
                            <Text style={{ color: 'white', fontWeight: '600', marginBottom: 8 }}>
                                🔒 Vos Droits et Contrôles
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 18 }}>
                                • Vous pouvez modifier vos préférences à tout moment{'\n'}
                                • Désactiver la localisation dans les paramètres{'\n'}
                                • Supprimer votre compte et vos données{'\n'}
                                • Contacter notre équipe pour toute question
                            </Text>
                        </View>

                        <View style={{ 
                            backgroundColor: 'rgba(29, 78, 216, 0.3)', 
                            padding: 16, 
                            borderRadius: 8, 
                            marginBottom: 20 
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Feather name="info" size={16} color="#60A5FA" />
                                <Text style={{ color: '#60A5FA', fontWeight: '600', marginLeft: 8 }}>
                                    Conformité Apple
                                </Text>
                            </View>
                            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 18 }}>
                                Cette demande respecte les exigences d'Apple pour la transparence du suivi des applications (ATT).
                                Votre choix sera respecté et peut être modifié dans les paramètres iOS.
                            </Text>
                        </View>

                        <View style={{ 
                            backgroundColor: '#374151', 
                            padding: 16, 
                            borderRadius: 8, 
                            marginBottom: 20 
                        }}>
                            <Text style={{ color: 'white', fontWeight: '600', marginBottom: 8 }}>
                                📞 Nous Contacter
                            </Text>
                            <Text style={{ color: '#D1D5DB', fontSize: 14 }}>
                                Email: slimaneafoud1987@gmail.com{'\n'}
                                Téléphone: +212 660 600 602{'\n'}
                                Site: https://afoud.ma{'\n'}
                                Adresse: G8X8+5Q Casablanca 20000, Maroc{'\n'}
                                {'\n'}
                                Pour toute question sur vos données ou cette politique de confidentialité.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Fixed Bottom Buttons */}
                    <View style={{ 
                        flexDirection: 'row', 
                        paddingHorizontal: 20, 
                        paddingVertical: 16,
                        gap: 12,
                        borderTopWidth: 1,
                        borderTopColor: '#374151',
                        backgroundColor: '#111827'
                    }}>
                        <TouchableOpacity
                            onPress={onDecline}
                            style={{
                                flex: 1,
                                backgroundColor: '#4B5563',
                                paddingVertical: 16,
                                borderRadius: 8,
                                alignItems: 'center',
                                minHeight: 50
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                                Refuser le Suivi
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onAccept}
                            style={{
                                flex: 1,
                                backgroundColor: '#F97316',
                                paddingVertical: 16,
                                borderRadius: 8,
                                alignItems: 'center',
                                minHeight: 50
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                                Accepter et Continuer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};