import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import i18n from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languages = [
    { id: 'en', name: 'English', flag: require('@/assets/flags/us.png'), rtl: false },
    { id: 'ar', name: 'عربي', flag: require('@/assets/flags/ar.png'), rtl: true },
    { id: 'es', name: 'Español', flag: require('@/assets/flags/spanish.png'), rtl: false },
    { id: 'fr', name: 'Français', flag: require('@/assets/flags/french.png'), rtl: false },
];

export default function LanguageScreen() {
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

    const handleUpdate = async () => {
        await i18n.changeLanguage(selectedLanguage);
        await AsyncStorage.setItem('user_language', selectedLanguage);
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar backgroundColor="#000" barStyle="light-content" />
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center p-4 border-b border-gray-800">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="chevron-left" size={28} color="#FFF" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-4">Language</Text>
                </View>

                {/* Language List */}
                <View className="px-4 py-6">
                    <Text className="text-white text-lg font-semibold mb-4">Choose Your Language</Text>

                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.id}
                            onPress={() => setSelectedLanguage(lang.id)}
                            className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border-2 ${
                                selectedLanguage === lang.id
                                    ? 'border-orange-500 bg-gray-800'
                                    : 'border-gray-700 bg-gray-800/60'
                            } shadow-sm shadow-black/20`}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center">
                                <Image source={lang.flag} className="w-8 h-6" resizeMode="cover" />
                                <Text
                                    className="text-white text-base ml-4"
                                    style={{ textAlign: lang.rtl ? 'right' : 'left' }}
                                >
                                    {lang.name}
                                </Text>
                            </View>
                            {selectedLanguage === lang.id && (
                                <View className="w-6 h-6 rounded-full bg-orange-500 items-center justify-center">
                                    <Feather name="check" size={16} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Save Button */}
                <View className="px-4 pb-6">
                    <TouchableOpacity
                        className="bg-orange-500 rounded-xl py-4 items-center shadow-md shadow-orange-900/30"
                        onPress={handleUpdate}
                    >
                        <Text className="text-white font-bold text-lg">Apply Language</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
