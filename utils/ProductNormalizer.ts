// utils/ProductNormalizer.ts

/**
 * New Product schema interface
 */
export interface Variation {
    id: string;
    name: string;
    price: number;
}

export interface Addon {
    id: string;
    name: string;
    price: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    image?: string;
    price: number;
    discountPrice?: number;
    images: string[];
    categoryId: string;
    isAvailable: boolean;
    preparationTime: number;
    variations: Variation[];
    addons: Addon[];
    restaurantId: string;
    totalSold: number;
    rating: number;
    reviewCount: number;
    cuisineId: string;
}

/**
 * Normalize product data to match the new schema
 * @param {any} product - Raw product data
 * @returns {Product} Normalized product data
 */
export const normalizeProductData = (product: any): Product => {
    if (!product) return null;

    // Default values and type conversions for the new schema
    return {
        id: product.id || '',
        name: product.name || 'Unnamed Product',
        description: product.description || '',
        image: product.image || '',
        price: Number(product.price || product.discountedPrice || product.discountPrice || 0),
        discountPrice: Number(product.discountPrice || product.discountedPrice || 0),
        images: Array.isArray(product.images) ? product.images : [product.image].filter(Boolean),
        categoryId: product.categoryId || '',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        preparationTime: Number(product.preparationTime || 15), // Default 15 minutes
        variations: Array.isArray(product.variations) ? product.variations : [],
        addons: Array.isArray(product.addons) ? product.addons : [],
        restaurantId: product.restaurantId || '1', // Default restaurant ID
        totalSold: Number(product.totalSold || 0),
        rating: Number(product.rating || 0),
        reviewCount: Number(product.reviewCount || 0),
        cuisineId: product.cuisineId || ''
    };
};

/**
 * Check if a product has a valid price
 * @param {any} product - Product data to check
 * @returns {boolean} True if product has valid price
 */
export const hasValidPrice = (product: any): boolean => {
    if (!product) return false;

    const price = product.price || product.discountPrice || product.discountedPrice;
    return typeof price === 'number' && !isNaN(price) && price > 0;
};

/**
 * Get the display price for a product (with discount if available)
 * @param {any} product - Product data
 * @returns {number} Display price
 */
export const getDisplayPrice = (product: any): number => {
    if (!product) return 0;

    // If product has discount price, use that
    if (product.discountPrice && typeof product.discountPrice === 'number' &&
        !isNaN(product.discountPrice) && product.discountPrice > 0) {
        return product.discountPrice;
    }

    // For backward compatibility
    if (product.discountedPrice && typeof product.discountedPrice === 'number' &&
        !isNaN(product.discountedPrice) && product.discountedPrice > 0) {
        return product.discountedPrice;
    }

    // Otherwise use regular price
    return product.price || 0;
};