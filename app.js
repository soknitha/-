/**
 * Main App Logic
 * Handle UI and user interactions
 */

// App State
let appState = {
    currentTab: 'home',
    products: [],
    categories: [],
    cart: { items: [], total: 0 },
    orders: [],
    user: null,
    selectedProduct: null,
    selectedOrder: null
};

// Initialize App
async function initApp() {
    // Show loading
    showLoading();
    
    // Initialize Telegram
    window.TelegramApp.init();
    
    // Load initial data
    await loadInitialData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loading and show app
    hideLoading();
    showApp();
    
    // Load home page
    loadHomePage();
}

// Show/Hide Loading
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showApp() {
    document.getElementById('app').classList.remove('hidden');
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load user data
        const userData = window.TelegramApp.getUserData();
        appState.user = await api.getUser() || userData;
        
        // Load products
        appState.products = await api.getProducts();
        
        // Load categories
        appState.categories = await api.getCategories();
        
        // Load cart
        appState.cart = await api.getCart();
        
        // Update cart badge
        updateCartBadge();
        
    } catch (error) {
        console.error('Error loading data:', error);
        window.TelegramApp.showAlert('មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
            window.TelegramApp.haptic('light');
        });
    });
    
    // Search button
    document.getElementById('searchBtn').addEventListener('click', toggleSearch);
    document.getElementById('clearSearch').addEventListener('click', clearSearch);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Cart button
    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    
    // Product modal
    document.getElementById('closeProduct').addEventListener('click', closeProductModal);
    
    // Order modal
    document.getElementById('closeOrder').addEventListener('click', closeOrderModal);
    
    // Filters
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('sortFilter').addEventListener('change', sortProducts);
    document.getElementById('orderFilter').addEventListener('change', filterOrders);
    
    // Profile actions
    document.getElementById('editProfileBtn').addEventListener('click', editProfile);
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('helpBtn').addEventListener('click', openHelp);
}

// Tab Switching
function switchTab(tabName) {
    appState.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${tabName}-page`).classList.add('active');
    
    // Load page content
    switch (tabName) {
        case 'home':
            loadHomePage();
            break;
        case 'products':
            loadProductsPage();
            break;
        case 'orders':
            loadOrdersPage();
            break;
        case 'profile':
            loadProfilePage();
            break;
    }
}

// Page Loaders
function loadHomePage() {
    // Load featured products
    loadFeaturedProducts();
    
    // Load categories
    loadCategories();
}

function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    const featured = appState.products.slice(0, 6); // Top 6 products
    
    if (featured.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛍️</div><div class="empty-state-text">មិនមានផលិតផល</div></div>';
        return;
    }
    
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
    
    // Add click listeners
    container.querySelectorAll('.product-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            openProductDetail(featured[index]);
            window.TelegramApp.haptic('medium');
        });
    });
}

function loadCategories() {
    const container = document.getElementById('categories');
    const categoryIcons = {
        'Electronics': '📱',
        'Fashion': '👕',
        'Food & Beverage': '🍔',
        'Health & Beauty': '💄',
        'Home & Garden': '🏡',
        'Sports & Outdoors': '⚽',
        'Books & Media': '📚',
        'Others': '🎁'
    };
    
    container.innerHTML = appState.categories.map(category => `
        <div class="category-card" data-category="${category}">
            <div class="category-icon">${categoryIcons[category] || '📦'}</div>
            <div class="category-name">${category}</div>
        </div>
    `).join('');
    
    // Add click listeners
    container.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            document.getElementById('categoryFilter').value = category;
            switchTab('products');
            filterProducts();
            window.TelegramApp.haptic('light');
        });
    });
}

function loadProductsPage() {
    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="">ប្រភេទទាំងអស់</option>' +
        appState.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    displayProducts(appState.products);
}

function displayProducts(products) {
    const container = document.getElementById('allProducts');
    
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">រកមិនឃើញផលិតផល</div></div>';
        return;
    }
    
    container.innerHTML = products.map(product => createProductCard(product)).join('');
    
    // Add click listeners
    container.querySelectorAll('.product-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            openProductDetail(products[index]);
            window.TelegramApp.haptic('medium');
        });
    });
}

function loadOrdersPage() {
    loadOrders();
}

async function loadOrders(status = 'all') {
    try {
        const orders = await api.getOrders(status);
        appState.orders = orders;
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        // Show mock orders for demo
        displayOrders([]);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-text">មិនមានការបញ្ជាទិញ</div></div>';
        return;
    }
    
    const statusEmojis = {
        'pending': '⏳',
        'confirmed': '✅',
        'processing': '📦',
        'shipping': '🚚',
        'delivered': '✅',
        'cancelled': '❌'
    };
    
    container.innerHTML = orders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-number">${statusEmojis[order.status]} ${order.order_number}</div>
                <div class="order-status status-${order.status}">${order.status}</div>
            </div>
            <div class="order-details">
                <div>📅 ${formatDate(order.created_at)}</div>
                <div>${order.items?.length || 0} ទំនិញ</div>
            </div>
            <div class="order-total">$${order.total_amount.toFixed(2)}</div>
        </div>
    `).join('');
    
    // Add click listeners
    container.querySelectorAll('.order-card').forEach(card => {
        card.addEventListener('click', () => {
            const orderId = parseInt(card.dataset.orderId);
            const order = orders.find(o => o.id === orderId);
            openOrderDetail(order);
            window.TelegramApp.haptic('medium');
        });
    });
}

function loadProfilePage() {
    if (!appState.user) return;
    
    document.getElementById('profileName').textContent = appState.user.first_name + ' ' + (appState.user.last_name || '');
    document.getElementById('profileUsername').textContent = '@' + (appState.user.username || 'user');
    document.getElementById('totalOrders').textContent = appState.user.total_orders || 0;
    document.getElementById('completedOrders').textContent = appState.user.completed_orders || 0;
    document.getElementById('totalSpent').textContent = '$' + (appState.user.total_spent || 0).toFixed(2);
}

// Product Card Creation
function createProductCard(product) {
    const inStock = product.stock > 0;
    const stockClass = inStock ? '' : 'out-of-stock';
    
    return `
        <div class="product-card ${stockClass}" data-product-id="${product.id}">
            <img src="${product.image_url || 'https://via.placeholder.com/150'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/150'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock">${inStock ? '✅ មានស្តុក' : '❌ អស់ស្តុក'} (${product.stock})</div>
            </div>
        </div>
    `;
}

// Product Detail Modal
function openProductDetail(product) {
    appState.selectedProduct = product;
    
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const body = document.getElementById('productModalBody');
    
    title.textContent = product.name;
    
    const inStock = product.stock > 0;
    
    body.innerHTML = `
        <img src="${product.image_url || 'https://via.placeholder.com/400x300'}" 
             alt="${product.name}" 
             style="width: 100%; border-radius: 12px; margin-bottom: 20px;"
             onerror="this.src='https://via.placeholder.com/400x300'">
        
        <div style="margin-bottom: 20px;">
            <div style="font-size: 24px; font-weight: 700; color: var(--primary-color); margin-bottom: 10px;">
                $${product.price.toFixed(2)}
            </div>
            <div style="color: var(--text-secondary); margin-bottom: 15px;">
                📂 ${product.category} | 📦 ${inStock ? 'មានស្តុក' : 'អស់ស្តុក'} (${product.stock})
            </div>
            <div style="color: var(--text-secondary); font-size: 14px;">
               👁 ${product.views} | 🛒 ${product.sales} លក់
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">📝 ពិពណ៌នា</h3>
            <p style="color: var(--text-secondary); line-height: 1.6;">
                ${product.description || 'មិនមានពិពណ៌នា'}
            </p>
        </div>
        
        <button class="btn btn-primary btn-block" id="addToCartBtn" ${!inStock ? 'disabled' : ''}>
            🛒 បន្ថែមទៅកន្ត្រក
        </button>
    `;
    
    modal.classList.remove('hidden');
    
    // Add to cart button
    if (inStock) {
        document.getElementById('addToCartBtn').addEventListener('click', () => {
            addProductToCart(product);
        });
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    appState.selectedProduct = null;
}

// Order Detail Modal
function openOrderDetail(order) {
    appState.selectedOrder = order;
    
    const modal = document.getElementById('orderModal');
    const body = document.getElementById('orderModalBody');
    
    const statusEmojis = {
        'pending': '⏳ កំពុងរងចាំ',
        'confirmed': '✅ បានបញ្ជាក់',
        'processing': '📦 កំពុងដំណើរការ',
        'shipping': '🚚 កំពុងដឹកជញ្ជូន',
        'delivered': '✅ ជោគជ័យ',
        'cancelled': '❌ បានបោះបង់'
    };
    
    body.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">
                ${order.order_number}
            </div>
            <div style="color: var(--text-secondary);">
                📅 ${formatDate(order.created_at)}
            </div>
            <div style="margin-top: 10px; padding: 8px 16px; background: var(--bg-color); border-radius: 8px; display: inline-block;">
                ${statusEmojis[order.status]}
            </div>
        </div>
        
        <h3 style="font-size: 16px; margin-bottom: 10px;">ផលិតផល:</h3>
        <div style="background: var(--bg-color); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
            ${order.items?.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div>${item.product_name} x ${item.quantity}</div>
                    <div style="font-weight: 600;">$${item.subtotal.toFixed(2)}</div>
                </div>
            `).join('') || '<div>មិនមានទិន្នន័យ</div>'}
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700;">
                <div>សរុប:</div>
                <div style="color: var(--primary-color);">$${order.total_amount.toFixed(2)}</div>
            </div>
        </div>
        
        <h3 style="font-size: 16px; margin-bottom: 10px;">ព័ត៌មានដឹកជញ្ជូន:</h3>
        <div style="color: var(--text-secondary); margin-bottom: 10px;">
            📍 ${order.shipping_address || 'N/A'}
        </div>
        <div style="color: var(--text-secondary); margin-bottom: 20px;">
            📞 ${order.shipping_phone || 'N/A'}
        </div>
        
        ${order.notes ? `
        <h3 style="font-size: 16px; margin-bottom: 10px;">ចំណាំ:</h3>
        <div style="color: var(--text-secondary);">
            ${order.notes}
        </div>
        ` : ''}
    `;
    
    modal.classList.remove('hidden');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.add('hidden');
    appState.selectedOrder = null;
}

// Cart Functions
function openCart() {
    loadCart();
    document.getElementById('cartModal').classList.remove('hidden');
    window.TelegramApp.haptic('medium');
}

function closeCart() {
    document.getElementById('cartModal').classList.add('hidden');
}

function loadCart() {
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    
    if (!appState.cart.items || appState.cart.items.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛒</div><div class="empty-state-text">កន្ត្រករបស់អ្នកទទេ</div></div>';
        totalElement.textContent = '$0.00';
        return;
    }
    
    container.innerHTML = appState.cart.items.map((item, index) => `
        <div class="cart-item">
            <img src="${item.product.image_url || 'https://via.placeholder.com/80'}" 
                 alt="${item.product.name}" 
                 class="cart-item-image"
                 onerror="this.src='https://via.placeholder.com/80'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.product.name}</div>
                <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="btn btn-secondary btn-sm" style="margin-left: 10px;" onclick="removeFromCart(${index})">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    totalElement.textContent = `$${appState.cart.total.toFixed(2)}`;
}

async function addProductToCart(product) {
    try {
        // Add to cart via API
        await api.addToCart(product.id, 1);
        
        // Update local state
        const existingItem = appState.cart.items?.find(item => item.product.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            if (!appState.cart.items) appState.cart.items = [];
            appState.cart.items.push({
                product: product,
                quantity: 1
            });
        }
        
        calculateCartTotal();
        updateCartBadge();
        
        window.TelegramApp.haptic('success');
        window.TelegramApp.showAlert('✅ បានបន្ថែមទៅកន្ត្រក!');
        closeProductModal();
    } catch (error) {
        console.error('Error adding to cart:', error);
        window.TelegramApp.haptic('error');
        window.TelegramApp.showAlert('❌ មានបញ្ហា!');
    }
}

window.updateQuantity = async function(index, change) {
    const item = appState.cart.items[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stock) {
        window.TelegramApp.showAlert('❌ ស្តុកមិនគ្រប់គ្រាន់!');
        return;
    }
    
    item.quantity = newQuantity;
    await api.updateCartItem(item.product.id, newQuantity);
    
    calculateCartTotal();
    updateCartBadge();
    loadCart();
    window.TelegramApp.haptic('light');
};

window.removeFromCart = async function(index) {
    const item = appState.cart.items[index];
    
    window.TelegramApp.showConfirm('លុបផលិតផលនេះចេញពីកន្ត្រក?', async (confirmed) => {
        if (confirmed) {
            await api.removeFromCart(item.product.id);
            appState.cart.items.splice(index, 1);
            calculateCartTotal();
            updateCartBadge();
            loadCart();
            window.TelegramApp.haptic('success');
        }
    });
};

function calculateCartTotal() {
    appState.cart.total = appState.cart.items?.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
    }, 0) || 0;
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const count = appState.cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    badge.textContent = count;
}

// Checkout
function checkout() {
    if (!appState.cart.items || appState.cart.items.length === 0) {
        window.TelegramApp.showAlert('កន្ត្រករបស់អ្នកទទេ!');
        return;
    }
    
    window.TelegramApp.showAlert('មុខងារនេះនឹងត្រូវបានបន្ថែមឆាប់ៗនេះ!\nសូមប្រើ Bot ដើម្បីបញ្ជាទិញ។');
    
    // TODO: Implement checkout flow
    // This would typically send data back to the bot
    // window.TelegramApp.sendData({ action: 'checkout', cart: appState.cart });
}

// Search
function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.toggle('hidden');
    if (!searchBar.classList.contains('hidden')) {
        document.getElementById('searchInput').focus();
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    handleSearch();
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if (!query) {
        displayProducts(appState.products);
        return;
    }
    
    const filtered = appState.products.filter(product => {
        return product.name.toLowerCase().includes(query) ||
               (product.description && product.description.toLowerCase().includes(query)) ||
               product.category.toLowerCase().includes(query);
    });
    
    displayProducts(filtered);
}

// Filters
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = appState.products;
    
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    displayProducts(filtered);
}

function sortProducts() {
    const sort = document.getElementById('sortFilter').value;
    let products = [...appState.products];
    
    switch (sort) {
        case 'price_low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price_high':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            products.sort((a, b) => b.sales - a.sales);
            break;
        case 'newest':
        default:
            products.sort((a, b) => b.id - a.id);
    }
    
    displayProducts(products);
}

function filterOrders() {
    const status = document.getElementById('orderFilter').value;
    loadOrders(status);
}

// Profile Actions
function editProfile() {
    window.TelegramApp.showAlert('មុខងារនេះនឹងត្រូវបានបន្ថែមឆាប់ៗនេះ!');
}

function openSettings() {
    window.TelegramApp.showAlert('មុខងារនេះនឹងត្រូវបានបន្ថែមឆាប់ៗនេះ!');
}

function openHelp() {
    window.TelegramApp.showAlert('ត្រូវការជំនួយ? សូមទាក់ទង @YourSupport');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('km-KH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Start app when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
