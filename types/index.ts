// types.ts - Centralized type definitions for the app

// Basic types
export type Category = {
    id: string;
    name: string;
    image: string;
};

export type CarouselItem = {
    id: string;
    title: string;
    subtitle?: string;
    image: string;
    bgColor?: string;
    buttonText?: string;
};

export type Product = {
    id: string;
    name: string;
    image: string | any; // Accept both URL strings and require() imports
    description?: string;
    price?: number;
    discountedPrice?: number;
    originalPrice?: number;
    discount?: number;
    restaurant?: string;
    rating?: number;
    [key: string]: any; // Allow additional properties
};

export type TrendingItem = Product & {
    discount?: number;
    restaurant: string;
    originalPrice: number;
    discountedPrice: number;
};

export type Restaurant = {
    id: string;
    name: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: string;
    image: string | any;
    cuisine?: string;
    address?: string;
    distance?: string;
};

export type Cuisine = {
    id: string;
    name: string;
    image: string | any;
};

// Interface for components that need to show loading states
export interface WithLoadingState {
    isLoading?: boolean;
}

// Interface for components that handle network status
export interface WithNetworkState {
    isOffline?: boolean;
}