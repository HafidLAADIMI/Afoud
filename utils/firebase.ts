    // utils/firebase.ts
    import {
        collection,
        writeBatch,
        getDocs,
        query,
        where,
        orderBy,
        limit,
        doc,
        getDoc,
        disableNetwork,
        enableNetwork,
        addDoc,
        updateDoc,
        deleteDoc,
        setDoc,
        serverTimestamp,
        initializeFirestore,
        getFirestore,
        memoryLocalCache
    } from 'firebase/firestore';
    import { getAuth } from 'firebase/auth';
    import { getFirebaseApp, initializeFirebase } from './firebaseInit';
    
    // Make sure Firebase is initialized
    initializeFirebase();
    
    // Get app instance
    const app = getFirebaseApp();
    
    // Initialize Firestore with memory cache for better mobile performance
    let db;
    try {
        db = initializeFirestore(app, {
            localCache: memoryLocalCache()
        });
        console.log("Firestore initialized with memory cache");
    } catch (error) {
        console.error("Error initializing Firestore with memory cache:", error);
    
        // Fallback to standard getFirestore
        try {
            db = getFirestore(app);
            console.log("Firestore initialized with default settings");
        } catch (fallbackError) {
            console.error("Fallback Firestore initialization also failed:", fallbackError);
            // Create a dummy db object that won't crash when called
            db = {
                collection: () => ({
                    doc: () => ({
                        get: () => Promise.resolve({ exists: () => false, data: () => ({}) })
                    })
                })
            };
        }
    }
    
    // Get auth instance
    const auth = getAuth(app);
    
    // Export Firebase instances
    export { app, db, auth };
    
    console.log("Firebase utility loaded");
    
    // ============= Type definitions =============
    export type Category = {
        id: string;
        name: string;
        image: string;
        description?: string;
        cuisineId?: string;
        itemCount?: number;
    };
    
    export type CarouselItem = {
        id: string;
        title: string;
        image: string;
        bgColor: string;
    };
    
    export type TrendingItem = {
        id: string;
        image: string;
        discount?: number;
        restaurant: string;
        name: string;
        originalPrice: number;
        discountedPrice: number;
    };
    
    export type Restaurant = {
        id: string;
        name: string;
        rating: number;
        deliveryTime: string;
        deliveryFee: string;
        image: string;
    };
    
    export type Cuisine = {
        id: string;
        name: string;
        image: string;
        description?: string;
        longDescription?: string;
        restaurantCount?: number;
    };
    
    export type CartItem = {
        id: string;
        name: string;
        price: number;
        originalPrice?: number;
        quantity: number;
        image: string;
        isVeg?: boolean;
        restaurant?: string;
    };
    
    export type Address = {
        id: string;
        label: string;
        address: string;
        city?: string;
        zipCode?: string;
        isDefault: boolean;
        instructions?: string;
        latitude?: number;
        longitude?: number;
    };
    
    export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';
    
    export type OrderItem = {
        id: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
    };
    
    export type Order = {
        id: string;
        date: string;
        status: OrderStatus;
        items: OrderItem[];
        subtotal: number;
        deliveryFee: number;
        discount: number;
        total: number;
        restaurant: string;
        restaurantAddress: string;
        deliveryAddress: string;
        paymentMethod: string;
        customerPhone?: string;
        customerName?: string;
        customerEmail?: string;
        orderType?: string;
        paymentStatus?: string;
        notes?: string;
        packagingFee?: number;
        tax?: number;
        driver?: {
            name: string;
            phone: string;
            rating: number;
            image?: string;
        };
    };
    
    export type UserProfile = {
        uid: string;
        displayName: string;
        email: string;
        photoURL?: string;
        phoneNumber?: string;
        loyaltyPoints?: number;
        addresses?: Address[];
    };
    
    export type GalleryImage = {
        id: string;
        image: string;
        title?: string;
        description?: string;
        category?: string;
    };
    
    export type Suggestion = {
        id: string;
        name: string;
        description?: string;
        price: number;
        image: string;
        category?: string;
        isVeg?: boolean;
        rating?: number;
        reviewCount?: number;
        positivePercentage?: number;
        estimatedTime?: string;
        cuisineId?: string;
        featured?: boolean;
        createdAt?: any;
    };
    
    // ============= Authentication & User Management =============
    
    /**
     * Get the current authenticated user ID
     * @returns {string} User ID or 'guest' if no user is logged in
     */
    export const getCurrentUserId = () => {
        try {
            const user = auth.currentUser;
            return user ? user.uid : 'guest';
        } catch (error) {
            console.error("Error getting current user ID:", error);
            return 'guest';
        }
    };
    
    
    /**
     * Get user profile from Firestore
     * @returns {Promise<UserProfile | null>} User profile or null if not found
     */
    export const getUserProfile = async (): Promise<UserProfile | null> => {
        return handleFirestoreOperation(async () => {
            const userId = getCurrentUserId();
            const userDoc = doc(db, 'users', userId);
            const snapshot = await getDoc(userDoc);
    
            if (snapshot.exists()) {
                return {uid: snapshot.id, ...snapshot.data()} as UserProfile;
            } else {
                return null;
            }
        }, null);
    };
    
    /**
     * Toggle dark mode setting for user
     * @param {boolean} isDarkMode - The dark mode state
     * @returns {Promise<void>}
     */
    export const toggleDarkMode = async (isDarkMode: boolean): Promise<void> => {
        try {
            const userId = getCurrentUserId();
            const userDoc = doc(db, 'users', userId);
            await updateDoc(userDoc, {darkMode: isDarkMode});
        } catch (error) {
            console.error('Error toggling dark mode:', error);
            throw error;
        }
    };
    
    /**
     * Sign out the current user
     * @returns {Promise<void>}
     */
    export const signOut = async (): Promise<void> => {
        try {
            await auth.signOut();
            console.log('User signed out');
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };
    
    // ============= Network management functions =============
    
    // Network management functions
    export const disableFirestoreNetwork = async () => {
        try {
            await disableNetwork(db);
            console.log("Firestore network disabled");
        } catch (error) {
            console.error("Error disabling network:", error);
        }
    };
    
    export const enableFirestoreNetwork = async () => {
        try {
            await enableNetwork(db);
            console.log("Firestore network enabled");
        } catch (error) {
            console.error("Error enabling network:", error);
        }
    };
    
    export const checkFirestoreConnection = async (): Promise<boolean> => {
        try {
            // Try to get a small document to test connection
            const testDoc = doc(db, 'categories', 'test_connection');
            await getDoc(testDoc);
            return true;
        } catch (error) {
            const errorMessage = error.message || '';
            const isOfflineError =
                errorMessage.includes('offline') ||
                error.code === 'unavailable' ||
                error.code === 'network-request-failed';
    
            if (isOfflineError) {
                console.warn("Device is offline. Using cached data.");
            } else {
                console.error("Firestore connection test failed:", error);
            }
            return false;
        }
    };
    
    // Error handler wrapper for Firestore operations
    const handleFirestoreOperation = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
        try {
            return await operation();
        } catch (error) {
            console.error('Firestore operation error:', error);
    
            // If this is a connection error, return fallback data instead of throwing
            const errorMessage = error.message || '';
    
            const isOfflineError =
                errorMessage.includes('offline') ||
                error.code === 'unavailable' ||
                error.code === 'network-request-failed';
    
            if (isOfflineError) {
                console.warn('Network error, returning fallback data');
                return fallback;
            }
    
            throw error;
        }
    };
    // ============= Content retrieval functions =============
    
    /**
     * Get carousel items for home screen
     * @returns {Promise<CarouselItem[]>} Array of carousel items
     */
    export const getCarouselItems = async (): Promise<CarouselItem[]> => {
        return handleFirestoreOperation(async () => {
            const carouselRef = collection(db, 'carouselItems');
            const snapshot = await getDocs(carouselRef);
    
            if (snapshot.metadata.fromCache) {
                console.log("Carousel data came from cache");
            }
    
            return snapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title || '',
                image: doc.data().image || '',
                bgColor: doc.data().bgColor || 'bg-gray-500'
            }));
        }, []);
    };
    
    /**
     * Get trending items for display
     * @returns {Promise<TrendingItem[]>} Array of trending items
     */
    export const getTrendingItems = async (): Promise<TrendingItem[]> => {
        return handleFirestoreOperation(async () => {
            const trendingRef = collection(db, 'trendingItems');
            const snapshot = await getDocs(trendingRef);
    
            if (snapshot.metadata.fromCache) {
                console.log("Trending items data came from cache");
            }
    
            return snapshot.docs.map(doc => ({
                id: doc.id,
                image: doc.data().image || '',
                discount: doc.data().discount,
                restaurant: doc.data().restaurant || '',
                name: doc.data().name || '',
                originalPrice: doc.data().originalPrice || 0,
                discountedPrice: doc.data().discountedPrice || 0
            }));
        }, []);
    };
    
    /**
     * Get restaurants with optional limit
     * @param {number} limitCount - Maximum number of restaurants to return
     * @returns {Promise<Restaurant[]>} Array of restaurants
     */
    export const getRestaurants = async (limitCount: number = 10): Promise<Restaurant[]> => {
        return handleFirestoreOperation(async () => {
            const restaurantsRef = collection(db, 'restaurants');
            const restaurantsQuery = query(
                restaurantsRef,
                orderBy('rating', 'desc'),
                limit(limitCount)
            );
            const snapshot = await getDocs(restaurantsQuery);
    
            if (snapshot.metadata.fromCache) {
                console.log("Restaurants data came from cache");
            }
    
            return snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || '',
                rating: doc.data().rating || 0,
                deliveryTime: doc.data().deliveryTime || '',
                deliveryFee: doc.data().deliveryFee || '',
                image: doc.data().image || ''
            }));
        }, []);
    };
    
    /**
     * Get restaurants by cuisine
     * @param {string} cuisineId - Cuisine ID to filter by
     * @param {number} limitCount - Maximum number of restaurants to return
     * @returns {Promise<Restaurant[]>} Array of restaurants
     */
    export const getRestaurantsByCuisine = async (cuisineId: string, limitCount: number = 10): Promise<Restaurant[]> => {
        return handleFirestoreOperation(async () => {
            const restaurantsRef = collection(db, 'restaurants');
            const restaurantsQuery = query(
                restaurantsRef,
                where('cuisineId', '==', cuisineId),
                orderBy('rating', 'desc'),
                limit(limitCount)
            );
            const snapshot = await getDocs(restaurantsQuery);
    
            return snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || '',
                rating: doc.data().rating || 0,
                deliveryTime: doc.data().deliveryTime || '',
                deliveryFee: doc.data().deliveryFee || '',
                image: doc.data().image || ''
            }));
        }, []);
    };
    
    /**
     * Search products by name
     * @param {string} searchTerm - Term to search for
     * @param {number} limitCount - Maximum number of results
     * @returns {Promise<any[]>} Array of matching products
     */
    export const searchProducts = async (searchTerm: string, limitCount: number = 20) => {
        return handleFirestoreOperation(async () => {
            // Basic search with client-side filtering to work better with offline mode
            const productsRef = collection(db, 'products');
            const snapshot = await getDocs(productsRef);
    
            if (snapshot.metadata.fromCache) {
                console.log("Search results came from cache");
            }
    
            // Filter product by name (case-insensitive)
            const searchTermLower = searchTerm.toLowerCase();
            const filteredProducts = snapshot.docs
                .filter(doc => {
                    const name = doc.data().name || '';
                    return name.toLowerCase().includes(searchTermLower);
                })
                .slice(0, limitCount)
                .map(doc => ({id: doc.id, ...doc.data()}));
    
            return filteredProducts;
        }, []);
    };
    
    /**
     * Get product by ID from any collection
     * @param {string} productId - ID of the product to retrieve
     * @returns {Promise<any>} Product data or null if not found
     */
    export const getProductById = async (productId: string) => {
        try {
            // Collections to search
            const collectionsToSearch = [
                'products',
                'trendingItems',
                'categories',
                'cuisines',
                'restaurants'
            ];
    
            // First, try to find by document ID
            for (const collectionName of collectionsToSearch) {
                try {
                    const productDocRef = doc(db, collectionName, productId);
                    const productDoc = await getDoc(productDocRef);
    
                    if (productDoc.exists()) {
                        console.log(`Product found in ${collectionName} collection by ID`);
                        console.log(productDoc.data());
                        return {
                            id: productDoc.id,
                            ...productDoc.data(),
                            sourceCollection: collectionName
                        };
                    }
                } catch (idError) {
                    console.warn(`Error checking ${collectionName} by ID:`, idError);
                }
            }
    
            // If not found by ID, search by 'id' field
            for (const collectionName of collectionsToSearch) {
                try {
                    const collectionRef = collection(db, collectionName);
                    const q = query(collectionRef, where('id', '==', productId));
    
                    const querySnapshot = await getDocs(q);
    
                    if (!querySnapshot.empty) {
                        const productData = querySnapshot.docs[0].data();
                        console.log(`Product found in ${collectionName} collection by 'id' field`);
                        return {
                            id: productId,
                            ...productData,
                            sourceCollection: collectionName
                        };
                    }
                } catch (fieldError) {
                    console.warn(`Error searching ${collectionName} by 'id' field:`, fieldError);
                }
            }
    
            // Log debugging information if no product is found
            console.error(`No product found with ID: ${productId}`);
            return null;
        } catch (error) {
            console.error('Comprehensive error in getProductById:', error);
            throw error;
        }
    };
    
    /**
     * Normalize product data for consistent display
     * @param {any} product - Raw product data
     * @returns {any} Normalized product data
     */
    export const normalizeProductData = (product: any) => {
        if (!product) return null;
    
        // Default values and type conversions
        return {
            id: product.id || product._id || '',
            name: product.name || 'Unnamed Product',
            restaurant: product.restaurant || 'Unknown Restaurant',
            price: Number(product.price || product.discountedPrice || 0),
            originalPrice: Number(product.originalPrice || product.price || 0),
            description: product.description || '',
            discount: Number(product.discount || 0),
            image: product.image
                ? (typeof product.image === 'string'
                    ? {uri: product.image}
                    : product.image)
                : require('@/assets/placeholder.png'),
            rating: Number(product.rating || 0),
            isVeg: product.isAvailable ?? false,
            addons: product.addons || []
        };
    };
    
    // ============= Category and Cuisine functions =============
    
    /**
     * Get all categories
     * @returns {Promise<Category[]>} Array of categories
     */
    export const getCategories = async (): Promise<Category[]> => {
        return handleFirestoreOperation(async () => {
            console.log('Fetching all categories...');
            const categoriesRef = collection(db, 'categories');
            const snapshot = await getDocs(categoriesRef);
    
            if (snapshot.empty) {
                console.warn('No categories found in the collection!');
                return [];
            }
    
            console.log(`Found ${snapshot.docs.length} categories`);
    
            const categories = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || '',
                image: doc.data().image || '',
                description: doc.data().description || '',
                cuisineId: doc.data().cuisineId || null,
                itemCount: doc.data().itemCount || 0
            }));
    
            return categories;
        }, []);
    };
    
    /**
     * Get category by ID
     * @param {string} categoryId - ID of the category
     * @returns {Promise<Category|null>} Category or null if not found
     */
    export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
        try {
            console.log(`Fetching category with ID: ${categoryId}`);
    
            if (!categoryId) {
                console.error('Invalid categoryId provided');
                return null;
            }
    
            const categoryDoc = doc(db, 'categories', categoryId);
            const snapshot = await getDoc(categoryDoc);
    
            if (snapshot.exists()) {
                console.log(`Found category by direct ID: ${categoryId}`);
                const data = snapshot.data();
                return {
                    id: snapshot.id,
                    name: data.name || '',
                    image: data.image || '',
                    description: data.description || '',
                    cuisineId: data.cuisineId || null,
                    itemCount: data.itemCount || 0
                };
            }
    
            console.log(`No category found with ID: ${categoryId}`);
            return null;
        } catch (error) {
            console.error(`Error fetching category with ID ${categoryId}:`, error);
            return null;
        }
    };
    
    /**
     * Get all cuisines
     * @returns {Promise<Cuisine[]>} Array of cuisines
     */
    export const getCuisines = async (): Promise<Cuisine[]> => {
        return handleFirestoreOperation(async () => {
            console.log('Fetching all cuisines...');
            const cuisinesRef = collection(db, 'cuisines');
            const snapshot = await getDocs(cuisinesRef);
    
            if (snapshot.empty) {
                console.warn('No cuisines found in the collection!');
                return [];
            }
    
            console.log(`Found ${snapshot.docs.length} cuisines`);
    
            const cuisines = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || '',
                image: doc.data().image || '',
                description: doc.data().description || '',
                restaurantCount: doc.data().restaurantCount || 0
            }));
    
            return cuisines;
        }, []);
    };
    
    /**
     * Get cuisine by ID
     * @param {string} cuisineId - ID of the cuisine
     * @returns {Promise<Cuisine|null>} Cuisine or null if not found
     */
    export const getCuisineById = async (cuisineId: string): Promise<Cuisine | null> => {
        try {
            console.log(`Fetching cuisine with ID: ${cuisineId}`);
    
            if (!cuisineId) {
                console.error('Invalid cuisineId provided');
                return null;
            }
    
            // Try direct document access first
            const cuisineDoc = doc(db, 'cuisines', cuisineId);
            const snapshot = await getDoc(cuisineDoc);
    
            if (snapshot.exists()) {
                console.log(`Found cuisine by direct ID: ${cuisineId}`);
                return {
                    id: snapshot.id,
                    name: snapshot.data().name || '',
                    image: snapshot.data().image || '',
                    description: snapshot.data().description || '',
                    longDescription: snapshot.data().longDescription || '',
                    restaurantCount: snapshot.data().restaurantCount || 0
                };
            }
    
            console.log(`No cuisine found with ID: ${cuisineId}`);
            return null;
        } catch (error) {
            console.error(`Error fetching cuisine with ID ${cuisineId}:`, error);
            return null;
        }
    };
    
    /**
     * Get cuisine from category
     * @param {string} categoryId - ID of the category
     * @returns {Promise<Cuisine|null>} Associated cuisine or null
     */
    export const getCuisineFromCategory = async (categoryId: string): Promise<Cuisine | null> => {
        try {
            console.log(`Getting cuisine for category ID: ${categoryId}`);
    
            // First get the category to find the cuisineId
            const category = await getCategoryById(categoryId);
    
            if (!category || !category.cuisineId) {
                console.error(`No valid cuisineId found for category: ${categoryId}`);
                return null;
            }
    
            const cuisineId = category.cuisineId;
            console.log(`Found cuisineId: ${cuisineId} for category: ${categoryId}`);
    
            // Now get the cuisine details
            return await getCuisineById(cuisineId);
        } catch (error) {
            console.error(`Error getting cuisine for category ${categoryId}:`, error);
            return null;
        }
    };
    
    /**
     * Get products by cuisine ID
     * @param {string} cuisineId - ID of the cuisine
     * @returns {Promise<any[]>} Array of products
     */
    export const getProductsByCuisine = async (cuisineId: string): Promise<any[]> => {
        try {
            console.log(`Fetching products for cuisine ID: ${cuisineId}`);
    
            if (!cuisineId) {
                console.error('Invalid cuisineId provided');
                return [];
            }
    
            // Query products by cuisineId field
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('cuisineId', '==', cuisineId));
            const snapshot = await getDocs(q);
    
            if (snapshot.empty) {
                console.warn(`No products found for cuisine ID: ${cuisineId}`);
                return [];
            }
    
            console.log(`Found ${snapshot.docs.length} products for cuisine ${cuisineId}`);
    
            // Map products to the expected Product interface format
            const products = snapshot.docs.map(doc => {
                const rawData = { id: doc.id, ...doc.data() };
    
                // Map from the current structure to the Product interface
                return {
                    id: rawData.id || '',
                    name: rawData.name || 'Unnamed Product',
                    description: rawData.description || '',
                    image: typeof rawData.image === 'string' ? rawData.image :
                        (rawData.image && rawData.image.uri ? rawData.image.uri : ''),
                    price: Number(rawData.price || rawData.discountedPrice || 0),
                    discountPrice: Number(rawData.discountPrice || 0),
                    images: [typeof rawData.image === 'string' ? rawData.image :
                        (rawData.image && rawData.image.uri ? rawData.image.uri : '')].filter(Boolean),
                    categoryId: rawData.categoryId || '',
                    // Map isVeg to isAvailable if isAvailable is not present
                    isAvailable: rawData.isAvailable !== undefined ? rawData.isAvailable :
                        (rawData.isVeg !== undefined ? rawData.isVeg : true),
                    preparationTime: Number(rawData.preparationTime || 15),
                    variations: Array.isArray(rawData.variations) ? rawData.variations : [],
                    // Ensure addons are properly structured
                    addons: Array.isArray(rawData.addons) ? rawData.addons.map(addon => ({
                        id: addon.id || '',
                        name: addon.name || '',
                        price: Number(addon.price || 0)
                    })) : [],
                    restaurantId: rawData.restaurantId || '1',
                    totalSold: Number(rawData.totalSold || 0), // Correction ici: a0 -> 0
                    rating: Number(rawData.rating || 0),
                    reviewCount: Number(rawData.reviewCount || 0),
                    cuisineId: rawData.cuisineId || cuisineId,
                    subCategory: rawData.subCategory || '' // Ajout du champ subCategory qui est utilisé pour le filtrage
                };
            });
    
            console.log("Normalized products:", JSON.stringify(products[0]));
            return products;
        } catch (error) {
            console.error(`Error fetching products for cuisine ${cuisineId}:`, error);
            return [];
        }
    };
    /**
     * Get products by category
     * @param {string} categoryId - ID of the category
     * @returns {Promise<any[]>} Array of products
     */
    export const getProductsByCategory = async (categoryId: string): Promise<any[]> => {
        try {
            console.log(`Fetching products for category ID: ${categoryId}`);
    
            if (!categoryId) {
                console.error('Invalid categoryId provided');
                return [];
            }
    
            // First, get the category to find its associated cuisineId
            const category = await getCategoryById(categoryId);
    
            if (!category || !category.cuisineId) {
                console.error(`No valid cuisineId found for category: ${categoryId}`);
                return [];
            }
    
            const cuisineId = category.cuisineId;
            console.log(`Found associated cuisineId: ${cuisineId} for category: ${categoryId}`);
    
            // Now fetch products by cuisineId
            return await getProductsByCuisine(cuisineId);
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            return [];
        }
    };
    
    // ============= Cart functions =============
    
    /**
     * Get cart items for current user
     * @returns {Promise<CartItem[]>} Array of cart items
     */
    export const getCartItems = async (): Promise<CartItem[]> => {
        return handleFirestoreOperation(async () => {
            const userId = getCurrentUserId();
            const cartRef = collection(db, 'users', userId, 'cart');
            const snapshot = await getDocs(cartRef);
    
            return snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || '',
                price: doc.data().price || 0,
                originalPrice: doc.data().originalPrice,
                quantity: doc.data().quantity || 1,
                image: doc.data().image || '',
                isVeg: doc.data().isVeg || false,
                restaurant: doc.data().restaurant || ''
            }));
        }, []);
    };
    
    /**
     * Get total price of cart
     * @returns {Promise<number>} Total price
     */
    export const getCartTotal = async (): Promise<number> => {
        try {
            const items = await getCartItems();
            return items.reduce((total, item) => total + (item.price * item.quantity), 0);
        } catch (error) {
            console.error('Error calculating cart total:', error);
            throw error;
        }
    };
    
    /**
     * Add item to cart
     * @param {any} item - Item to add
     * @returns {Promise<void>}
     */
    export const addToCart = async (item: any): Promise<void> => {
        try {
            const userId = getCurrentUserId();
            const cartRef = collection(db, 'users', userId, 'cart');
    
            // Check if the item already exists in the cart
            const q = query(cartRef, where('id', '==', item.id));
            const snapshot = await getDocs(q);
    
            if (!snapshot.empty) {
                // Item exists, update quantity
                const docRef = doc(db, 'users', userId, 'cart', snapshot.docs[0].id);
                await updateDoc(docRef, {
                    quantity: snapshot.docs[0].data().quantity + (item.quantity || 1)
                });
            } else {
                // Add new item
                const cartItem = {
                    id: item.id,
                    name: item.name,
                    price: item.price || item.discountedPrice,
                    originalPrice: item.originalPrice,
                    quantity: item.quantity || 1,
                    image: item.image,
                    isVeg: item.isAvailable || false,
                    restaurant: item.restaurant || '',
                    addedAt: serverTimestamp()
                };
    
                await addDoc(cartRef, cartItem);
            }
    
            console.log('Item added to cart successfully');
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };
    
    /**
     * Update cart item quantity
     * @param {string} itemId - ID of the item to update
     * @param {number} quantity - New quantity
     * @returns {Promise<void>}
     */
    export const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<void> => {
        try {
            const userId = getCurrentUserId();
            const cartRef = collection(db, 'users', userId, 'cart');
    
            // Find the item
            const q = query(cartRef, where('id', '==', itemId));
            const snapshot = await getDocs(q);
    
            if (!snapshot.empty) {
                const docRef = doc(db, 'users', userId, 'cart', snapshot.docs[0].id);
                await updateDoc(docRef, {quantity});
            }
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            throw error;
        }
    };
    
    /**
     * Remove item from cart
     * @param {string} itemId - ID of item to remove
     * @returns {Promise<void>}
     */
    export const removeCartItem = async (itemId: string): Promise<void> => {
        try {
            const userId = getCurrentUserId();
            const cartRef = collection(db, 'users', userId, 'cart');
    
            // Find the item
            const q = query(cartRef, where('id', '==', itemId));
            const snapshot = await getDocs(q);
    
            if (!snapshot.empty) {
                const docRef = doc(db, 'users', userId, 'cart', snapshot.docs[0].id);
                await deleteDoc(docRef);
            }
        } catch (error) {
            console.error('Error removing cart item:', error);
            throw error;
        }
    };
    
    /**
     * Clear all items from cart
     * @returns {Promise<void>}
     */
    export const clearCart = async (): Promise<void> => {
        try {
            const userId = getCurrentUserId();
            const cartRef = collection(db, 'users', userId, 'cart');
            const querySnapshot = await getDocs(cartRef);
    
            // Create a new batch for each operation
            const batch = writeBatch(db);
    
            querySnapshot.forEach((document) => {
                batch.delete(document.ref);
            });
    
            await batch.commit();
            console.log('Cart cleared successfully');
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    };
    
    // ============= Favorites functions =============
    
   // ============= Fixed Favorites functions =============

/**
 * Get favorite items with better error handling and debugging
 * @returns {Promise<any[]>} Array of favorite items
 */
export const getFavoriteItems = async (): Promise<any[]> => {
    return handleFirestoreOperation(async () => {
        const userId = getCurrentUserId();
        
        console.log('🔍 getFavoriteItems - Current user ID:', userId);
        
        if (userId === 'guest') {
            console.log('⚠️  Guest user detected, returning empty favorites');
            return [];
        }

        // Check if user is authenticated
        if (!auth.currentUser) {
            console.log('❌ No authenticated user found');
            return [];
        }

        console.log('👤 Authenticated user:', auth.currentUser.uid);
        
        const favoritesRef = collection(db, 'users', userId, 'favorites');
        console.log('📂 Favorites collection path:', `users/${userId}/favorites`);
        
        const snapshot = await getDocs(favoritesRef);
        
        console.log('📊 Firestore snapshot details:');
        console.log('  - Empty:', snapshot.empty);
        console.log('  - Size:', snapshot.size);
        console.log('  - From cache:', snapshot.metadata.fromCache);

        if (snapshot.empty) {
            console.log('📭 No favorites found in database');
            return [];
        }

        const favorites = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`📄 Document ID: ${doc.id}, Data:`, data);
            
            favorites.push({
                id: doc.id,
                ...data,
                // Ensure we have the proper structure
                firestoreDocId: doc.id // Keep track of Firestore document ID
            });
        });

        console.log(`✅ Successfully processed ${favorites.length} favorites`);
        console.log('🎯 First favorite:', favorites[0]);
        
        return favorites;
    }, []);
};

/**
 * Add item to favorites with proper data structure
 * @param {any} item - Item to add to favorites
 * @returns {Promise<void>}
 */
export const addToFavorites = async (item: any): Promise<void> => {
    try {
        const userId = getCurrentUserId();
        
        console.log('💝 addToFavorites - User ID:', userId);
        console.log('💝 addToFavorites - Item:', item);
        
        if (userId === 'guest') {
            throw new Error('User must be logged in to add favorites');
        }

        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        const favoritesRef = collection(db, 'users', userId, 'favorites');
        
        // Check if already in favorites using the product ID
        const q = query(favoritesRef, where('id', '==', item.id));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log('⚠️  Item already in favorites:', item.name);
            return; // Item already exists
        }

        // Prepare the favorite item data with all necessary fields
        const favoriteData = {
            id: item.id, // Product ID
            name: item.name || 'Unnamed Product',
            price: Number(item.price || item.discountedPrice || 0),
            originalPrice: Number(item.originalPrice || item.price || 0),
            image: typeof item.image === 'string' ? item.image : 
                   (item.image?.uri || ''),
            description: item.description || '',
            rating: Number(item.rating || 0),
            reviewCount: Number(item.reviewCount || 0),
            restaurant: item.restaurant || '',
            cuisineId: item.cuisineId || '',
            categoryId: item.categoryId || '',
            isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
            addedAt: serverTimestamp(),
            // Keep any additional fields
            ...item
        };

        console.log('💾 Saving favorite data:', favoriteData);

        // Add to favorites using the product ID as document ID
        const favoriteDocRef = doc(favoritesRef, item.id);
        await setDoc(favoriteDocRef, favoriteData);

        console.log('✅ Successfully added to favorites:', item.name);
    } catch (error) {
        console.error('❌ Error adding to favorites:', error);
        throw error;
    }
};

/**
 * Remove item from favorites with better error handling
 * @param {string} itemId - ID of item to remove
 * @returns {Promise<void>}
 */
export const removeFromFavorites = async (itemId: string): Promise<void> => {
    try {
        const userId = getCurrentUserId();
        
        console.log('🗑️  removeFromFavorites - User ID:', userId);
        console.log('🗑️  removeFromFavorites - Item ID:', itemId);
        
        if (userId === 'guest') {
            throw new Error('User must be logged in to remove favorites');
        }

        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        const favoritesRef = collection(db, 'users', userId, 'favorites');

        // Try direct document deletion first (if itemId is the document ID)
        try {
            const directDocRef = doc(favoritesRef, itemId);
            const directDoc = await getDoc(directDocRef);
            
            if (directDoc.exists()) {
                await deleteDoc(directDocRef);
                console.log('✅ Removed favorite using direct document ID');
                return;
            }
        } catch (directError) {
            console.log('⚠️  Direct document deletion failed, trying query method');
        }

        // If direct deletion fails, query by 'id' field
        const q = query(favoritesRef, where('id', '==', itemId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docToDelete = snapshot.docs[0];
            await deleteDoc(docToDelete.ref);
            console.log('✅ Removed favorite using query method');
        } else {
            console.log('⚠️  Item not found in favorites');
        }

    } catch (error) {
        console.error('❌ Error removing from favorites:', error);
        throw error;
    }
};

/**
 * Check if an item is in favorites
 * @param {string} itemId - ID of item to check
 * @returns {Promise<boolean>} True if item is in favorites
 */
export const isInFavorites = async (itemId: string): Promise<boolean> => {
    try {
        const userId = getCurrentUserId();
        
        if (userId === 'guest' || !auth.currentUser) {
            return false;
        }

        const favoritesRef = collection(db, 'users', userId, 'favorites');
        
        // Try direct document check first
        const directDocRef = doc(favoritesRef, itemId);
        const directDoc = await getDoc(directDocRef);
        
        if (directDoc.exists()) {
            return true;
        }

        // If direct check fails, query by 'id' field
        const q = query(favoritesRef, where('id', '==', itemId));
        const snapshot = await getDocs(q);

        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking if item is in favorites:', error);
        return false;
    }
};

/**
 * Get favorites count
 * @returns {Promise<number>} Number of favorite items
 */
export const getFavoritesCount = async (): Promise<number> => {
    try {
        const favorites = await getFavoriteItems();
        return favorites.length;
    } catch (error) {
        console.error('Error getting favorites count:', error);
        return 0;
    }
};

/**
 * Clear all favorites
 * @returns {Promise<void>}
 */
export const clearAllFavorites = async (): Promise<void> => {
    try {
        const userId = getCurrentUserId();
        
        if (userId === 'guest' || !auth.currentUser) {
            throw new Error('User must be logged in to clear favorites');
        }

        const favoritesRef = collection(db, 'users', userId, 'favorites');
        const snapshot = await getDocs(favoritesRef);

        if (snapshot.empty) {
            console.log('No favorites to clear');
            return;
        }

        // Use batch to delete all favorites
        const batch = writeBatch(db);
        
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Cleared ${snapshot.size} favorites`);
    } catch (error) {
        console.error('Error clearing favorites:', error);
        throw error;
    }
};
    
    // ============= Address functions =============
    
    /**
     * Get user addresses
     * @returns {Promise<Address[]>} Array of addresses
     */
    export const getUserAddresses = async (): Promise<Address[]> => {
        return handleFirestoreOperation(async () => {
            const userId = getCurrentUserId();
            const addressesRef = collection(db, 'users', userId, 'addresses');
            const snapshot = await getDocs(addressesRef);
    
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Address));
        }, []);
    };
    
    /**
     * Add or update address
     * @param {Address} address - Address to save
     * @returns {Promise<string>} Address ID
     */
    export const saveAddress = async (address: Address): Promise<string> => {
        try {
            const userId = getCurrentUserId();
            const addressesRef = collection(db, 'users', userId, 'addresses');
    
            // If this is a default address, unset default on all others
            if (address.isDefault) {
                const snapshot = await getDocs(addressesRef);
                for (const doc of snapshot.docs) {
                    if (doc.id !== address.id && doc.data().isDefault) {
                        await updateDoc(doc.ref, {isDefault: false});
                    }
                }
            }
    
            // If address has an ID, update it
            if (address.id && address.id !== 'new') {
                const addressRef = doc(addressesRef, address.id);
                await updateDoc(addressRef, address);
                return address.id;
            } else {
                // Create new address
                const docRef = await addDoc(addressesRef, address);
                return docRef.id;
            }
        } catch (error) {
            console.error('Error saving address:', error);
            throw error;
        }
    };
    
    /**
     * Delete an address
     * @param {string} addressId - ID of address to delete
     * @returns {Promise<void>}
     */
    export const deleteAddress = async (addressId: string): Promise<void> => {
        try {
            const userId = getCurrentUserId();
            const addressRef = doc(db, 'users', userId, 'addresses', addressId);
            await deleteDoc(addressRef);
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    };
    
    // ============= Order functions =============
    
    /**
     * Create a new order
     * @param {any} orderData - Order data to save
     * @returns {Promise<string>} Order ID
     */
    export const createOrder = async (orderData) => {
        try {
            // Get the current user ID
            const userId = getCurrentUserId();

            // CRITICAL FIX: Handle both item structures (from checkout and from product details)
            // Notice we check for both selectedAddons/selectedVariations AND addons/variations
            const formattedItems = Array.isArray(orderData.items)
                ? orderData.items.map(item => {
                    // Get variations either from selectedVariations or variations
                    const variations = Array.isArray(item.selectedVariations)
                        ? item.selectedVariations
                        : Array.isArray(item.variations)
                            ? item.variations
                            : [];

                    // Get addons either from selectedAddons or addons
                    const addons = Array.isArray(item.selectedAddons)
                        ? item.selectedAddons
                        : Array.isArray(item.addons)
                            ? item.addons
                            : [];

                    // CRITICAL FIX: Use priceAtPurchase if available, fall back to price
                    const basePrice = parseFloat(String(item.priceAtPurchase || item.price || 0));

                    // CRITICAL FIX: Use itemSubtotal if available
                    const itemSubtotal = parseFloat(String(item.itemSubtotal || 0));

                    return {
                        id: item.productId || item.id || '',
                        name: item.name || 'Unnamed Item',
                        price: basePrice, // Use base price
                        quantity: parseInt(String(item.quantity || 1)),
                        image: item.image?.uri || (typeof item.image === 'string' ? item.image : ''),
                        variations: variations,
                        addons: addons,
                        subtotal: itemSubtotal || basePrice * parseInt(String(item.quantity || 1))
                    };
                })
                : [];

            // Log the formatted items for debugging
            console.log('Formatted order items:', JSON.stringify(formattedItems, null, 2));

            // Calculate subtotal to ensure it's accurate, now accounting for item.subtotal
            const subtotal = formattedItems.reduce((sum, item) => {
                // Use item.subtotal if already calculated, otherwise calculate manually
                if (item.subtotal && item.subtotal > 0) {
                    return sum + item.subtotal;
                }

                // Otherwise, calculate from base price and options
                let itemTotal = item.price * item.quantity;

                // Add variations price
                if (Array.isArray(item.variations)) {
                    const variationTotal = item.variations.reduce(
                        (varSum, variation) => varSum + parseFloat(String(variation.price || 0)),
                        0
                    ) * item.quantity;
                    itemTotal += variationTotal;
                }

                // Add addon prices
                if (Array.isArray(item.addons)) {
                    const addonTotal = item.addons.reduce(
                        (addonSum, addon) => addonSum + (parseFloat(String(addon.price || 0)) * (addon.quantity || 1)),
                        0
                    ) * item.quantity;
                    itemTotal += addonTotal;
                }

                return sum + itemTotal;
            }, 0);

            // CRITICAL FIX: Get the correct total amount from various possible sources
            const deliveryFee = parseFloat(String(orderData.deliveryFee || 0));
            const tipAmount = parseFloat(String(orderData.tipAmount || 0));
            const calculatedTotal = subtotal + deliveryFee + tipAmount;

            // Use grandTotal if available, otherwise fallback to total or calculate
            const totalAmount = parseFloat(String(
                orderData.grandTotal ||
                orderData.totalAmount ||
                calculatedTotal
            ));

            // CRITICAL FIX: Determine payment status based on payment method
            let paymentStatus = orderData.paymentStatus || 'unpaid';
            if (orderData.paymentMethod === 'card' || orderData.paymentMethod === 'online_payment') {
                paymentStatus = 'paid';
            } else if (orderData.paymentDetails?.status === 'paid' || orderData.paymentDetails?.status === 'paid_online') {
                paymentStatus = 'paid';
            }

            // Log the totals for debugging
            console.log('Order totals:', {
                subtotal,
                deliveryFee,
                tipAmount,
                totalAmount,
                paymentMethod: orderData.paymentMethod,
                paymentStatus
            });

            // Build a complete order object
            const completeOrderData = {
                // User information
                userId,
                userEmail: orderData.userEmail || '',
                customerName: orderData.customerName || '',
                customerPhone: orderData.phoneNumber || '',

                // Order items
                items: formattedItems,

                // Financial information
                subtotal,
                deliveryFee,
                tipAmount,
                discount: parseFloat(String(orderData.discount || 0)),
                tax: parseFloat(String(orderData.tax || 0)),
                packagingFee: parseFloat(String(orderData.packagingFee || 0)),
                total: totalAmount,
                currency: orderData.currency || 'MAD',

                // Location data
                deliveryAddress: orderData.shippingAddress?.address ||
                    orderData.deliveryLocation?.address ||
                    orderData.address?.address || '',
                deliveryLocation: orderData.shippingAddress ||
                    orderData.deliveryLocation || {
                        latitude: orderData.address?.latitude || null,
                        longitude: orderData.address?.longitude || null,
                        address: orderData.address?.address || '',
                        instructions: orderData.address?.instructions || orderData.additionalNote || ''
                    },

                // Order details
                date: new Date().toISOString(),
                orderType: orderData.deliveryOption || 'delivery',
                status: orderData.status || 'pending',
                paymentMethod: orderData.paymentMethod || 'cash',
                paymentStatus: paymentStatus,
                notes: orderData.orderNotes || orderData.additionalNote || '',

                // Cuisine/restaurant reference
                cuisineId: orderData.cuisineId || (orderData.items && orderData.items[0]?.cuisineId) || '',
                cuisineName: orderData.cuisineName || '',
                restaurantId: orderData.restaurantId || (orderData.items && orderData.items[0]?.restaurantId) || '',

                // Metadata
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                source: 'mobile-app'
            };

            // Final log of the complete order data being saved
            console.log('FINAL ORDER DATA:', JSON.stringify(completeOrderData, null, 2));

            // Store in both user's orders and main orders collection
            const userOrdersRef = collection(db, 'users', userId, 'orders');
            const orderDoc = await addDoc(userOrdersRef, completeOrderData);



            // Update the user's order document with its own ID
            await updateDoc(doc(db, 'users', userId, 'orders', orderDoc.id), {
                id: orderDoc.id
            });

            console.log('Order created with ID:', orderDoc.id);
            return orderDoc.id;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    };
    /**
     * Create a draft order (not yet confirmed)
     * @param {any} orderData - Order data
     * @returns {Promise<string>} Order ID
     */
    
    
    /**
     * Get all orders for the current user
     * @returns {Promise<Order[]>} Array of orders
     */
    export const getOrders = async (): Promise<Order[]> => {
        try {
            const userId = getCurrentUserId();
            const ordersRef = collection(db, 'users', userId, 'orders');
            const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
            const querySnapshot = await getDocs(q);
            const orders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
    
            console.log(`Found ${orders.length} orders`);
            return orders;
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    };
    
    /**
     * Get order details by ID
     * @param {string} orderId - Order ID
     * @returns {Promise<Order|null>} Order or null if not found
     */
    export const getOrderDetails = async (orderId: string): Promise<Order | null> => {
        try {
            const userId = getCurrentUserId();
            const orderDocRef = doc(db, 'users', userId, 'orders', orderId);
            const orderDoc = await getDoc(orderDocRef);
    
            if (orderDoc.exists()) {
                return {id: orderDoc.id, ...orderDoc.data()} as Order;
            } else {
                console.error('Order not found:', orderId);
                return null;
            }
        } catch (error) {
            console.error('Error getting order details:', error);
            throw error;
        }
    };
    
    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise<void>}
     */
    export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
        try {
            const userId = getCurrentUserId();
            const orderDocRef = doc(db, 'users', userId, 'orders', orderId);
    
            await updateDoc(orderDocRef, {
                status: status,
                updatedAt: serverTimestamp()
            });
    
            console.log(`Order ${orderId} status updated to ${status}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    };
    
    /**
     * Cancel an order
     * @param {string} orderId - Order ID
     * @returns {Promise<void>}
     */
    export const cancelOrder = async (orderId: string): Promise<void> => {
        return updateOrderStatus(orderId, 'cancelled');
    };
    
    /**
     * Track an order
     * @param {string} orderId - Order ID
     * @returns {Promise<any>} Tracking info
     */
    export const trackOrder = async (orderId: string): Promise<any> => {
        try {
            // Get the order details
            const orderDetails = await getOrderDetails(orderId);
    
            if (!orderDetails) {
                throw new Error('Order not found');
            }
    
            // In a real app, this would fetch real-time tracking data
            // For now, we'll just return the order details with a placeholder location
            return {
                ...orderDetails,
                tracking: {
                    status: orderDetails.status,
                    currentLocation: {
                        latitude: 35.6762,
                        longitude: 139.6503
                    },
                    estimatedDeliveryTime: '30-45 minutes'
                }
            };
        } catch (error) {
            console.error('Error tracking order:', error);
            throw error;
        }
    };
    
    /**
     * Reorder items from a previous order
     * @param {string} orderId - Order ID
     * @returns {Promise<boolean>} Success status
     */
    export const reorderItems = async (orderId: string): Promise<boolean> => {
        try {
            // Get the original order
            const orderDetails = await getOrderDetails(orderId);
    
            if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
                throw new Error('Order not found or has no items');
            }
    
            // Add items to cart
            for (const item of orderDetails.items) {
                await addToCart(item);
            }
    
            return true;
        } catch (error) {
            console.error('Error reordering items:', error);
            throw error;
        }
    };
    
    // ============= Gallery functions =============
    
    /**
     * Get restaurant gallery images
     * @returns {Promise<GalleryImage[]>} Array of gallery images
     */
    export const getRestaurantGallery = async (): Promise<GalleryImage[]> => {
        try {
            const galleryRef = collection(db, 'restaurantGallery');
            const snapshot = await getDocs(galleryRef);
    
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as GalleryImage)
            }));
        } catch (error) {
            console.error('Error fetching restaurant gallery:', error);
            return [];
        }
    };
    
    /**
     * Create or update a gallery image
     * @param {GalleryImage} image - Gallery image data
     * @returns {Promise<void>}
     */
    export const createOrUpdateGalleryImage = async (image: GalleryImage): Promise<void> => {
        try {
            const docRef = doc(db, 'restaurantGallery', image.id);
            await setDoc(docRef, image);
            console.log(`Gallery image ${image.id} added/updated successfully`);
        } catch (error) {
            console.error('Error creating/updating gallery image:', error);
            throw error;
        }
    };
    
    // ============= Suggestions functions =============
    
    /**
     * Get suggested items
     * @returns {Promise<Suggestion[]>} Array of suggestions
     */
    export const getSuggestions = async (): Promise<Suggestion[]> => {
        return handleFirestoreOperation(async () => {
            console.log('Récupération des suggestions du jour...');
            const suggestionsRef = collection(db, 'suggestions');
    
            // Requête simplifiée sans tri
            const q = query(suggestionsRef, where('featured', '==', true), limit(5));
            const snapshot = await getDocs(q);
    
            if (snapshot.empty) {
                console.warn('Aucune suggestion trouvée dans la collection !');
                return [];
            }
    
            console.log(`Trouvé ${snapshot.docs.length} suggestions`);
    
            const suggestions = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || '',
                description: doc.data().description || '',
                price: doc.data().price || 0,
                image: doc.data().image || '',
                category: doc.data().category || '',
                isVeg: doc.data().isVeg || false,
                rating: doc.data().rating || 4.5,
                reviewCount: doc.data().reviewCount || 0,
                positivePercentage: doc.data().positivePercentage || 95,
                estimatedTime: doc.data().estimatedTime || '20-30 min',
                cuisineId: doc.data().cuisineId || null,
                featured: doc.data().featured || true,
                createdAt: doc.data().createdAt
            }));
    
            return suggestions;
        }, []);
    };
    
    /**
     * Get daily suggestion
     * @returns {Promise<Suggestion|null>} Daily suggestion or null
     */
    export const getDailySuggestion = async (): Promise<Suggestion | null> => {
        const suggestions = await getSuggestions();
        return suggestions.length > 0 ? suggestions[0] : null;
    };
    
    /**
     * Add a new suggestion
     * @param {any} suggestionData - Suggestion data
     * @returns {Promise<Suggestion>} Created suggestion
     */
    export const addSuggestion = async (suggestionData: any): Promise<Suggestion> => {
        try {
            // Vérifier si l'utilisateur est admin (à implémenter selon votre logique d'authentification)
            const userId = getCurrentUserId();
            const userDoc = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userDoc);
    
            if (!userSnapshot.exists() || !userSnapshot.data().isAdmin) {
                throw new Error('Accès non autorisé. Seuls les administrateurs peuvent ajouter des suggestions.');
            }
    
            const suggestionsRef = collection(db, 'suggestions');
    
            // Préparer les données avec timestamp
            const suggestion = {
                ...suggestionData,
                featured: true,
                createdAt: serverTimestamp()
            };
    
            // Ajouter à Firestore
            const docRef = await addDoc(suggestionsRef, suggestion);
            console.log(`Suggestion ajoutée avec ID: ${docRef.id}`);
    
            return {
                id: docRef.id,
                ...suggestion
            } as Suggestion;
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la suggestion:', error);
            throw error;
        }
    };
    // Add this to your firebase.ts file
    /**
     * Process payment and complete order
     * @param {string} orderId - ID of the order
     * @param {string} paymentMethod - Payment method
     * @returns {Promise<void>}
     */
    
    
    /**
     * Update order payment method and status
     * @param {string} orderId - ID of the order
     * @param {string} paymentMethod - Payment method
     * @returns {Promise<void>}
     */
    export const updateOrderPayment = async (orderId: string, paymentMethod: string): Promise<void> => {
        try {
            const userId = getCurrentUserId();
            const orderDocRef = doc(db, 'users', userId, 'orders', orderId);
    
            // Update the order
            await updateDoc(orderDocRef, {
                paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'paid',
                updatedAt: serverTimestamp()
            });
    
            console.log(`Order ${orderId} payment method updated to ${paymentMethod}`);
        } catch (error) {
            console.error('Error updating order payment method:', error);
            throw error;
        }
    };
    // RECOMMENDED ITEMS
    export const getRecommendedItems = async (): Promise<any[]> => {
        return handleFirestoreOperation(async () => {
            const recommendedRef = collection(db, 'recommendedItems');
            const snapshot = await getDocs(recommendedRef);
    
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }, []);
    };
    
    // Export the Firebase config
    export const getFirebaseConfig = () => {
        return {
      apiKey: "AIzaSyA0HdeDYIv38UHICf7tsFaXWtFNG_5WUSE",
  authDomain: "afood-a8ea4.firebaseapp.com",
  projectId: "afood-a8ea4",
  storageBucket: "afood-a8ea4.firebasestorage.app",
  messagingSenderId: "555100471697",
  appId: "1:555100471697:web:c259b06146389fa9901a30"
        };
    };
    // get order by id
    export const getOrderById = async (orderId) => {
        try {
            console.log(`Attempting to fetch order with ID: ${orderId}`);
    
            // Get current user
            const user = auth.currentUser;
    
            if (!user) {
                console.error("No authenticated user found when fetching order");
                throw new Error("User not authenticated");
            }
    
            const userId = user.uid;
            console.log(`Fetching order for user: ${userId}`);
    
            // Construct the document reference
            const orderDoc = doc(db, 'users', userId, 'orders', orderId);
            console.log(`Looking for order at path: users/${userId}/orders/${orderId}`);
    
            // Get the document
            const snapshot = await getDoc(orderDoc);
    
            console.log(`Order document exists: ${snapshot.exists()}`);
    
            if (snapshot.exists()) {
                const orderData = {
                    id: snapshot.id,
                    ...snapshot.data()
                };
                console.log("Successfully retrieved order data:", orderData);
                return orderData;
            } else {
                // Try alternative path (if your schema might have changed)
                console.log("Order not found at primary path, trying alternative path...");
                const altOrderDoc = doc(db, 'orders', orderId);
                const altSnapshot = await getDoc(altOrderDoc);
    
                if (altSnapshot.exists()) {
                    const orderData = {
                        id: altSnapshot.id,
                        ...altSnapshot.data()
                    };
                    console.log("Found order at alternative path:", orderData);
                    return orderData;
                }
    
                console.warn(`Order not found: ${orderId}`);
                return null;
            }
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            console.error('Error details:', error.code, error.message);
    
            // Return null instead of throwing to prevent app crashes
            return null;
        }
    };
    // Add these functions to your firebase.ts file
    
    /**
     * Get the current authenticated user with complete profile information
     * @returns {Promise<Object>} User data with profile
     */
    export const getCurrentUser = async () => {
        try {
            const user = auth.currentUser;
    
            if (!user) {
                console.log('No authenticated user found');
                return null;
            }
    
            // Get additional profile data
            try {
                const userDoc = doc(db, 'users', user.uid);
                const userSnapshot = await getDoc(userDoc);
    
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
    
                    return {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || userData.displayName || '',
                        photoURL: user.photoURL || userData.photoURL || '',
                        phoneNumber: userData.phoneNumber || user.phoneNumber || '',
                        profile: userData
                    };
                }
            } catch (profileError) {
                console.warn('Error fetching user profile:', profileError);
            }
    
            // Return basic user if profile fetch fails
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                phoneNumber: user.phoneNumber || ''
            };
        } catch (error) {
            console.error('Error getting current user with profile:', error);
    
            // Return basic user if available
            return auth.currentUser ? {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName || ''
            } : null;
        }
    };
    
    /**
     * Get user contact information
     * @returns {Promise<Object>} User contact information
     */
    export const getUserContactInformation = async () => {
        try {
            const userId = getCurrentUserId();
    
            if (userId === 'guest') {
                return {
                    phoneNumber: '',
                    email: '',
                    displayName: 'Guest'
                };
            }
    
            const userDoc = doc(db, 'users', userId);
            const snapshot = await getDoc(userDoc);
    
            if (snapshot.exists()) {
                const userData = snapshot.data();
                return {
                    phoneNumber: userData.phoneNumber || '',
                    email: userData.email || '',
                    displayName: userData.displayName || ''
                };
            }
    
            return {
                phoneNumber: '',
                email: '',
                displayName: ''
            };
        } catch (error) {
            console.error('Error getting user contact information:', error);
            return {
                phoneNumber: '',
                email: '',
                displayName: ''
            };
        }
    };
    
    /**
     * Create a draft order with complete information
     * @param {any} orderData - Order data
     * @returns {Promise<string>} Order ID
     */
    export const createDraftOrder = async (orderData: any): Promise<string> => {
        try {
            // Get the current user ID
            const userId = getCurrentUserId();
    
            // Get the current user's information
            let userEmail = '';
            let userPhone = '';
    
            // Fetch user email from Firebase Auth
            if (auth.currentUser) {
                userEmail = auth.currentUser.email || '';
    
                // Try to get more user details from Firestore
                try {
                    const userDoc = doc(db, 'users', userId);
                    const userSnapshot = await getDoc(userDoc);
    
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        userPhone = userData.phoneNumber || orderData.phoneNumber || '';
                    }
                } catch (userError) {
                    console.warn('Error getting user data:', userError);
                }
            }
    
            // Format items with complete information
            const formattedItems = Array.isArray(orderData.items)
                ? orderData.items.map(item => ({
                    id: item.id || '',
                    name: item.name || 'Unnamed Item',
                    price: parseFloat(String(item.price || 0)),
                    quantity: parseInt(String(item.quantity || 1)),
                    image: typeof item.image === 'string' ? item.image : '',
                    // Include variations if available
                    variations: Array.isArray(item.variations) ? item.variations : [],
                    // Include addons if available
                    addons: Array.isArray(item.addons) ? item.addons : []
                }))
                : [];
    
            // Handle single product case from direct order
            if (!formattedItems.length && orderData.id) {
                formattedItems.push({
                    id: orderData.id,
                    name: orderData.productName || '',
                    price: parseFloat(String(orderData.productPrice || 0)),
                    quantity: parseInt(String(orderData.quantity || 1)),
                    image: orderData.productImage || '',
                    // Parse addons from JSON string if available
                    addons: orderData.addons
                        ? (typeof orderData.addons === 'string'
                            ? JSON.parse(orderData.addons)
                            : orderData.addons)
                        : [],
                    // Parse variations from JSON string if available
                    variations: orderData.variations
                        ? (typeof orderData.variations === 'string'
                            ? JSON.parse(orderData.variations)
                            : orderData.variations)
                        : []
                });
            }
    
            // Format location data
            const locationData = {
                // From address object
                address: orderData.address?.address || orderData.deliveryAddress || '',
                latitude: orderData.address?.latitude ||
                    orderData.latitude ||
                    (orderData.locationCoordinates?.latitude) || null,
                longitude: orderData.address?.longitude ||
                    orderData.longitude ||
                    (orderData.locationCoordinates?.longitude) || null,
                instructions: orderData.address?.instructions || orderData.notes || ''
            };
    
            // Calculate subtotal to ensure it's accurate
            const subtotal = formattedItems.reduce((sum, item) => {
                // Base price × quantity
                let itemTotal = item.price * item.quantity;
    
                // Add variations price
                if (Array.isArray(item.variations)) {
                    const variationTotal = item.variations.reduce(
                        (varSum, variation) => varSum + (variation.price || 0),
                        0
                    );
                    itemTotal += variationTotal;
                }
    
                // Add addon prices
                if (Array.isArray(item.addons)) {
                    const addonTotal = item.addons.reduce(
                        (addonSum, addon) => addonSum + ((addon.price || 0) * (addon.quantity || 1)),
                        0
                    );
                    itemTotal += addonTotal;
                }
    
                return sum + itemTotal;
            }, 0);
    
            // Build a complete order object
            const completeOrderData = {
                // User information
                userId,
                userEmail: userEmail || orderData.userEmail || '',
                customerName: orderData.customerName || '',
                customerPhone: orderData.phoneNumber || userPhone || '',
    
                // Order items
                items: formattedItems,
    
                // Financial information
                subtotal,
                deliveryFee: parseFloat(String(orderData.deliveryFee || 0)),
                tipAmount: parseFloat(String(orderData.tipAmount || 0)),
                discount: parseFloat(String(orderData.discount || 0)),
                tax: parseFloat(String(orderData.tax || 0)),
                packagingFee: parseFloat(String(orderData.packagingFee || 0)),
                total: parseFloat(String(orderData.totalAmount || subtotal + parseFloat(String(orderData.deliveryFee || 0)))),
                currency: orderData.currency || 'MAD',
    
                // Location data
                deliveryAddress: locationData.address,
                deliveryLocation: locationData,
    
                // Order details
                date: new Date().toISOString(),
                orderType: orderData.orderType || orderData.deliveryOption || 'delivery',
                status: 'draft',
                paymentMethod: orderData.paymentMethod || 'pending',
                paymentStatus: 'pending',
                notes: orderData.additionalNote || orderData.notes || '',
    
                // Cuisine/restaurant reference
                cuisineId: orderData.cuisineId || formattedItems[0]?.cuisineId || '',
                cuisineName: orderData.cuisineName || '',
                restaurantId: orderData.restaurantId || formattedItems[0]?.restaurantId || '',
    
                // Metadata
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                source: 'mobile-app'
            };
    
            // Store in both user's orders and main orders collection
            // 1. Add to user's orders collection
            const userOrdersRef = collection(db, 'users', userId, 'orders');
            const orderDoc = await addDoc(userOrdersRef, completeOrderData);
    
            // 2. Add to main orders collection
            await setDoc(doc(db, 'orders', orderDoc.id), {
                ...completeOrderData,
                id: orderDoc.id
            });
    
            // Update the user's order document with its own ID
            await updateDoc(doc(db, 'users', userId, 'orders', orderDoc.id), {
                id: orderDoc.id
            });
    
            console.log('Draft order created with ID:', orderDoc.id);
            return orderDoc.id;
        } catch (error) {
            console.error('Error creating draft order:', error);
            throw error;
        }
    };
    
    /**
     * Process payment and complete the order
     * @param {string} orderId - ID of the order to process
     * @param {string} paymentMethod - Payment method used
     * @returns {Promise<boolean>} Success status
     */
    export const processPaymentAndCompleteOrder = async (orderId: string, paymentMethod: string): Promise<boolean> => {
        try {
            console.log(`Processing payment for order ${orderId} with method ${paymentMethod}`);
    
            const userId = getCurrentUserId();
    
            // 1. Fetch the current order
            const userOrderDocRef = doc(db, 'users', userId, 'orders', orderId);
            const mainOrderDocRef = doc(db, 'orders', orderId);
    
            const orderSnap = await getDoc(userOrderDocRef);
    
            if (!orderSnap.exists()) {
                console.error(`Order with ID ${orderId} not found in user orders`);
    
                // Try to find in main orders collection
                const mainOrderSnap = await getDoc(mainOrderDocRef);
    
                if (!mainOrderSnap.exists()) {
                    throw new Error(`Order with ID ${orderId} not found`);
                }
            }
    
            // 2. Update the payment information
            const paymentUpdate = {
                status: 'pending', // Changed from draft to pending
                paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'paid',
                updatedAt: serverTimestamp(),
                orderConfirmedAt: serverTimestamp()
            };
    
            // 3. Update both copies of the order
            const batch = writeBatch(db);
    
            // Update in user's orders collection
            batch.update(userOrderDocRef, paymentUpdate);
    
            // Update in main orders collection
            batch.update(mainOrderDocRef, paymentUpdate);
    
            await batch.commit();
    
            // 4. On successful payment, clear the cart
            if (paymentMethod !== 'cash') {
                try {
                    await clearCart();
                } catch (cartError) {
                    console.error('Error clearing cart after order payment:', cartError);
                    // Don't throw here, it's not critical
                }
            }
    
            console.log(`Order ${orderId} processed successfully with payment method ${paymentMethod}`);
            return true;
        } catch (error) {
            console.error('Error processing payment for order:', error);
            throw error;
        }
    };


    // get All products
    export const getAllProducts = async (limitCount: number = 50, startAfterId?: string): Promise<any[]> => {
        return handleFirestoreOperation(async () => {
            console.log(`Fetching all products with limit ${limitCount}${startAfterId ? ` starting after ${startAfterId}` : ''}`);

            const productsRef = collection(db, 'products');
            let productsQuery;

            // Set up pagination if startAfterId is provided
            if (startAfterId) {
                // First, get the document to start after
                const startAfterDoc = await getDoc(doc(db, 'products', startAfterId));

                if (!startAfterDoc.exists()) {
                    console.warn(`Start document with ID ${startAfterId} not found`);
                    return [];
                }

                productsQuery = query(
                    productsRef,
                    orderBy('name'),
                    startAfter(startAfterDoc),
                    limit(limitCount)
                );
            } else {
                productsQuery = query(
                    productsRef,
                    orderBy('name'),
                    limit(limitCount)
                );
            }

            const snapshot = await getDocs(productsQuery);

            if (snapshot.empty) {
                console.warn('No products found in the collection!');
                return [];
            }

            console.log(`Found ${snapshot.docs.length} products`);

            // Map products to the expected format
            const products = snapshot.docs.map(doc => {
                const rawData = { id: doc.id, ...doc.data() };

                // Map from the current structure to a normalized format
                return {
                    id: rawData.id || '',
                    name: rawData.name || 'Unnamed Product',
                    description: rawData.description || '',
                    image: typeof rawData.image === 'string' ? rawData.image :
                        (rawData.image && rawData.image.uri ? rawData.image.uri : ''),
                    price: Number(rawData.price || rawData.discountedPrice || 0),
                    discountPrice: Number(rawData.discountPrice || 0),
                    images: [typeof rawData.image === 'string' ? rawData.image :
                        (rawData.image && rawData.image.uri ? rawData.image.uri : '')].filter(Boolean),
                    categoryId: rawData.categoryId || '',
                    isAvailable: rawData.isAvailable !== undefined ? rawData.isAvailable :
                        (rawData.isVeg !== undefined ? rawData.isVeg : true),
                    preparationTime: Number(rawData.preparationTime || 15),
                    variations: Array.isArray(rawData.variations) ? rawData.variations : [],
                    addons: Array.isArray(rawData.addons) ? rawData.addons.map(addon => ({
                        id: addon.id || '',
                        name: addon.name || '',
                        price: Number(addon.price || 0)
                    })) : [],
                    restaurantId: rawData.restaurantId || '',
                    totalSold: Number(rawData.totalSold || 0),
                    rating: Number(rawData.rating || 0),
                    reviewCount: Number(rawData.reviewCount || 0),
                    cuisineId: rawData.cuisineId || '',
                    subCategory: rawData.subCategory || ''
                };
            });

            return products;
        }, []);
    };

    export async function getRestaurantById(id: string) {
        try {
            const restaurantRef = doc(db, "restaurants", id);
            const docSnap = await getDoc(restaurantRef);

            if (docSnap.exists()) {
                return {
                    success: true,
                    restaurant: { id: docSnap.id, ...docSnap.data() } as Restaurant,
                };
            } else {
                return { success: false, error: "Restaurant not found" };
            }
        } catch (error) {
            console.error("Error getting restaurant:", error);
            return { success: false, error: (error as Error).message };
        }
    }
    export default app;