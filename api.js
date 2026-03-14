/**
 * API Communication
 * Handle backend API calls
 */

// API Base URL (change this to your backend)
const API_BASE_URL = 'http://localhost:8000/api'; // Change for production

// Local storage key
const STORAGE_KEY = 'comkrubkrong_';

class API {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.user = null;
    }

    /**
     * Make API request with proper headers
     */
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': window.TelegramApp.getInitData()
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Use mock data if API not available
            return this.getMockData(endpoint);
        }
    }

    /**
     * Mock data for development/demo
     */
    getMockData(endpoint) {
        const mockData = {
            '/user': {
                id: 1,
                telegram_id: 123456789,
                first_name: 'Demo',
                last_name: 'User',
                username: 'demouser',
                phone: '012345678',
                total_orders: 5,
                completed_orders: 3,
                total_spent: 125.50
            },
            '/products': [
                {
                    id: 1,
                    name: 'iPhone 15 Pro',
                    description: 'Latest iPhone with amazing features',
                    price: 999.99,
                    category: 'Electronics',
                    stock: 10,
                    image_file_id: null,
                    views: 150,
                    sales: 25
                },
                {
                    id: 2,
                    name: 'Samsung Galaxy S24',
                    description: 'Powerful Android smartphone',
                    price: 899.99,
                    category: 'Electronics',
                    stock: 15,
                    image_file_id: null,
                    views: 120,
                    sales: 18
                },
                {
                    id: 3,
                    name: 'Nike Air Max',
                    description: 'Comfortable running shoes',
                    price: 129.99,
                    category: 'Fashion',
                    stock: 25,
                    image_file_id: null,
                    views: 200,
                    sales: 45
                }
            ],
            '/categories': [
                'Electronics',
                'Fashion',
                'Food & Beverage',
                'Health & Beauty',
                'Home & Garden',
                'Sports & Outdoors',
                'Books & Media',
                'Others'
            ],
            '/cart': {
                items: [],
                total: 0
            },
            '/orders': []
        };

        // Return mock data for matching endpoint
        for (const [key, value] of Object.entries(mockData)) {
            if (endpoint.includes(key)) {
                return value;
            }
        }

        return null;
    }

    // User APIs
    async getUser() {
        return this.request('/user');
    }

    async updateUser(data) {
        return this.request('/user', 'PUT', data);
    }

    // Product APIs
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/products?${query}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    async getCategories() {
        return this.request('/categories');
    }

    // Cart APIs
    async getCart() {
        // Try to get from local storage first
        const localCart = this.getLocalCart();
        if (localCart) {
            return localCart;
        }
        return this.request('/cart');
    }

    async addToCart(productId, quantity = 1) {
        const result = await this.request('/cart/add', 'POST', { productId, quantity });
        this.updateLocalCart(result);
        return result;
    }

    async removeFromCart(productId) {
        const result = await this.request('/cart/remove', 'POST', { productId });
        this.updateLocalCart(result);
        return result;
    }

    async updateCartItem(productId, quantity) {
        const result = await this.request('/cart/update', 'PUT', { productId, quantity });
        this.updateLocalCart(result);
        return result;
    }

    async clearCart() {
        const result = await this.request('/cart/clear', 'DELETE');
        this.clearLocalCart();
        return result;
    }

    // Order APIs
    async getOrders(status = 'all') {
        return this.request(`/orders?status=${status}`);
    }

    async getOrder(id) {
        return this.request(`/orders/${id}`);
    }

    async createOrder(orderData) {
        return this.request('/orders', 'POST', orderData);
    }

    // Local Storage Helpers
    getLocalCart() {
        const cartData = localStorage.getItem(STORAGE_KEY + 'cart');
        return cartData ? JSON.parse(cartData) : null;
    }

    updateLocalCart(cartData) {
        localStorage.setItem(STORAGE_KEY + 'cart', JSON.stringify(cartData));
    }

    clearLocalCart() {
        localStorage.removeItem(STORAGE_KEY + 'cart');
    }

    saveToStorage(key, value) {
        localStorage.setItem(STORAGE_KEY + key, JSON.stringify(value));
    }

    getFromStorage(key) {
        const data = localStorage.getItem(STORAGE_KEY + key);
        return data ? JSON.parse(data) : null;
    }

    removeFromStorage(key) {
        localStorage.removeItem(STORAGE_KEY + key);
    }
}

// Create and export API instance
const api = new API();
window.api = api;
