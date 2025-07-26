// screens/SidebarScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity, ScrollView,
    StatusBar, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Feather, MaterialIcons, Ionicons,
    FontAwesome, MaterialCommunityIcons
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router }        from 'expo-router';

import { getUserProfile, signOut, toggleDarkMode } from '@/utils/firebase';

/* ----------------------------------------------------------------- */
/* 1️⃣  Custom toggle – shadow fix                                    */
/* ----------------------------------------------------------------- */
const knobShadow = Platform.select({
    ios : {
        shadowColor  : '#000',
        shadowOffset : { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius : 2,
    },
    android: { elevation: 4 },
});

const CustomToggleSwitch = ({ value, onValueChange }) => (
    <TouchableOpacity
        onPress={onValueChange}
        activeOpacity={0.8}
        className={`w-14 h-7 rounded-full flex-row items-center transition-all duration-300
                ${value ? 'bg-orange-500' : 'bg-gray-600'}`}
    >
        <View
            className={`w-5 h-5 rounded-full bg-white transition-all duration-300
              ${value ? 'ml-8' : 'ml-1'}`}
            style={knobShadow}
        />
    </TouchableOpacity>
);

/* ----------------------------------------------------------------- */
/* 2️⃣  Menu helpers                                                  */
/* ----------------------------------------------------------------- */
const MenuItem = ({ icon, label, onPress, isLast = false, badge = null }) => (
    <TouchableOpacity
        className={`px-4 py-4 flex-row items-center ${isLast ? '' : 'border-b border-gray-700'}`}
        activeOpacity={0.7}
        onPress={onPress}
    >
        <View className="w-9 items-center">{icon}</View>
        <Text className="text-white font-medium ml-3 flex-1">{label}</Text>

        {badge && (
            <View className="bg-red-500 px-2 py-0.5 rounded-full">
                <Text className="text-white text-xs font-bold">{badge}</Text>
            </View>
        )}

        <Feather name="chevron-right" size={20} color="#9CA3AF" className="ml-2" />
    </TouchableOpacity>
);

const Section = ({ title, children }) => (
    <View className="mx-4 mb-6">
        <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
            <Text className="text-orange-500 text-base font-bold">{title}</Text>
        </View>
        <View className="bg-gray-800 rounded-xl overflow-hidden shadow-lg shadow-black/20">
            {children}
        </View>
    </View>
);

/* ----------------------------------------------------------------- */
/* 3️⃣  Main component                                                */
/* ----------------------------------------------------------------- */
export default function SidebarScreen() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [user,       setUser      ] = useState<any>(null);
    const [loading,    setLoading   ] = useState(true);

    /* fetch profile -------------------------------------------------- */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setUser(await getUserProfile());
            } catch (e) {
                console.error('Error loading user profile:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    const handleSignOut = async () => {
        try {
            await signOut();
            setUser(null);
            Alert.alert('Succès', 'Vous avez été déconnecté');
        } catch (e) {
            console.error('Error signing out:', e);
            Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
        }
    };

    /* UI ------------------------------------------------------------- */
    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* ───── User header ───── */}
            <LinearGradient colors={['#F97316', '#EA580C']} className="px-4 py-6">
                <View className="flex-row items-center">
                    <View className="w-16 h-16 rounded-full bg-white/20 justify-center items-center
                          overflow-hidden border-2 border-white/30">
                        {user?.photoURL
                            ? <Image source={{ uri: user.photoURL }} className="w-full h-full" />
                            : <Feather name="user" size={32} color="white" />}
                    </View>

                    <View className="ml-4 flex-1">
                        <Text className="text-white font-bold text-lg">
                            {user ? user.displayName : 'Utilisateur Invité'}
                        </Text>
                        <Text className="text-white/80">
                            {user ? user.email : 'Connectez-vous pour accéder à toutes les fonctionnalités'}
                        </Text>
                    </View>
                            {/* 
                    {user && (
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"

                        >
                            <Feather name="edit" size={18} color="white" />
                        </TouchableOpacity>
                    )}
                        */}
                </View>

                {/* loyalty progress 
                {user && (
                    <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-white/90 text-sm">Points de Fidélité</Text>
                            <Text className="text-white font-bold">{user.loyaltyPoints ?? 0} pts</Text>
                        </View>

                        <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${(user.loyaltyPoints ?? 0) / 10}%` }}
                            />
                        </View>

                        <Text className="text-white/80 text-xs mt-1">
                            Gagnez 100 points de plus pour un repas gratuit
                        </Text>
                    </View>
                )}
                    */}
            </LinearGradient>

            {/* ───── Scrollable menu ───── */}
            <ScrollView className="flex-1">

                {/* General --------------------------------------------------- */}
                <Section title="Général">
                    <MenuItem icon={<Feather name="user" size={20} color="#F97316" />}
                              label="Profil"
                              onPress={() => router.push('/profileScreen')} />
                     {/*  ---------------------------------------------------
                    <MenuItem icon={<MaterialIcons name="location-on" size={20} color="#F97316" />}
                              label="Mes Adresses"
                           />

                    <MenuItem icon={<Ionicons name="language-outline" size={20} color="#F97316" />}
                              label="Langue"
                           /*   onPress={() => router.push('/languageScreen')} 
                         */}
                         {/* 
                    <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-700">
                        <View className="flex-row items-center">
                            <View className="w-9 items-center">
                                <Feather name="moon" size={20} color="#F97316" />
                            </View>
                            <Text className="text-white font-medium ml-3">Mode Sombre</Text>
                        </View>
                        <CustomToggleSwitch value={isDarkMode} onValueChange={()=>{}} />
                    </View>
                            */}
                            {/* 
                    <MenuItem icon={<Feather name="bell" size={20} color="#F97316" />}
                              label="Notifications"

                              isLast
                              badge="3" />
                              */}
                </Section>

                {/* Promotions & Rewards ------------------------------------- 
                <Section title="Promotions & Récompenses">
                    <MenuItem icon={<FontAwesome name="ticket" size={20} color="#F97316" />}
                              label="Mes Coupons"
                              badge={user ? '2' : undefined}
                             />

                    <MenuItem icon={<Feather name="gift" size={20} color="#F97316" />}
                              label="Récompenses"
                            />

                    <MenuItem icon={<Feather name="credit-card" size={20} color="#F97316" />}
                              label="Méthodes de Paiement"

                              isLast />
                </Section>
                */}

                {/* Earn with Us --------------------------------------------- 
                <Section title="Gagnez avec Nous">
                    <MenuItem icon={<Feather name="users" size={20} color="#F97316" />}
                              label="Parrainage & Gains"
                               />
                    <MenuItem icon={<Feather name="navigation" size={20} color="#F97316" />}
                              label="Devenir Livreur Partenaire"
                              />
                    <MenuItem icon={<FontAwesome name="building" size={20} color="#F97316" />}
                              label="Référencer Votre Restaurant"

                              isLast />
                </Section>

                */}

                {/* Help & Support ------------------------------------------- */}
                <Section title="Aide & Support">
                    <MenuItem onPress={()=>router.push("/apropos")} icon={<Feather name="info" size={20} color="#F97316" />}
                              label="À Propos"
                              />
                      <MenuItem onPress={()=>router.push("/helpAndSupportScreen")} icon={<Feather name="help-circle" size={20} color="#F97316" />}
                              label="Aide & Support"
                              />
                    <MenuItem onPress={()=>router.push("/termsConditionsScreen")} icon={<Feather name="file-text" size={20} color="#F97316" />}
                              label="Conditions Générales"
                              />
                    <MenuItem onPress={()=>router.push("/privacyPolicyScreen")} icon={<Feather name="shield" size={20} color="#F97316" />}
                              label="Politique de Confidentialité"

                              isLast />
                </Section>

                {/* Account actions ------------------------------------------ */}
                <View className="items-center justify-center my-6 pb-10">
                    {user ? (
                        <TouchableOpacity
                            className="bg-gray-800 px-8 py-3 rounded-xl flex-row items-center shadow-md shadow-black/30"
                            onPress={handleSignOut}
                        >
                            <Feather name="log-out" size={20} color="#F97316" />
                            <Text className="text-orange-500 font-bold ml-2">Se Déconnecter</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className="bg-orange-500 px-8 py-3 rounded-xl flex-row items-center shadow-md shadow-black/30"
                            onPress={() => router.push('/login')}
                        >
                            <Feather name="log-in" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Se Connecter</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}