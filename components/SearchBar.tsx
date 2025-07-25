import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

interface SearchBarProps extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onAvatarPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
                                                 value,
                                                 onChangeText,
                                                 onAvatarPress,
                                                 placeholder = "Rechercher...",
                                                 ...props
                                             }) => {
    return (
        <View className="bg-black flex-row items-center px-4 py-2 mt-4 rounded-full">
            <TouchableOpacity
                onPress={onAvatarPress}
                activeOpacity={0.7}
            >
                <View className="w-8 h-8 rounded-full bg-neutral-700 mr-2 justify-center items-center">
                    <FontAwesome name="user" size={16} color="#ccc" />
                </View>
            </TouchableOpacity>

            <TextInput
                className="text-white ml-2 flex-1"
                placeholder={placeholder}
                placeholderTextColor="gray"
                value={value}
                onChangeText={onChangeText}
                {...props}
            />
        </View>
    );
};

export default SearchBar;