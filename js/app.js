// ============================================
// PROGEAR SPORTS - APPLICATION ENGINE
// ============================================

// --------------------------------------------
// PRODUCT DATA (Backend Simulation)
// --------------------------------------------
const ProductDB = {
    products: [
        { id: 1, name: 'Pro Championship Basketball', price: 89.99, icon: '🏀', category: 'Basketball' },
        { id: 2, name: 'Match-Grade Soccer Ball', price: 74.99, icon: '⚽', category: 'Soccer' },
        { id: 3, name: 'Carbon Fiber Tennis Racket', price: 199.99, icon: '🎾', category: 'Tennis' },
        { id: 4, name: 'Elite Running Shoes', price: 159.99, icon: '👟', category: 'Running' },
        { id: 5, name: 'Pro Tennis Balls (3-Pack)', price: 29.99, icon: '🎾', category: 'Tennis' },
        { id: 6, name: 'Basketball Hoop System', price: 349.99, icon: '🏀', category: 'Basketball' },
        { id: 7, name: 'Training Cones Set', price: 34.99, icon: '🚧', category: 'Soccer' },
        { id: 8, name: 'Compression Shorts', price: 44.99, icon: '🩳', category: 'Running' }
    ],

    getAll() {
        return [...this.products];
    },

    getById(id) {
        return this.products.find(p => p.id === id) || null;
    },

    getByCategory(category) {
        if (category === 'all') return [...this.products];
        return this.products.filter(p => p.category === category);
    }
};

// --------------------------------------------
// CART MANAGER (Backend Logic)
// --------------------------------------------
const CartManager = {
    items: [],

    init() {
        this.load();
        return this;
    },

    load() {
        try {
            const saved = localStorage.getItem('progear_cart');
            this.items = saved ? JSON.parse(saved) : [];
        } catch {
            this.items = [];
        }
    },

    save() {
        localStorage.setItem('progear_cart', JSON.stringify(this.items));
    },

    add(productId) {
        const product = ProductDB.getById(productId);
        if (!product) return { success: false, message: 'Product not found' };

        const existing = this.items.find(item => item.id === productId);

        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }

        this.save();
        return { success: true, message: `${product.name} added to cart!`, item: existing || this.items[this.items.length - 1] };
    },

    remove(productId) {
        const index = this.items.findIndex(item => item.id === productId);
        if (index === -1) return { success: false, message: 'Item not in cart' };

        const removed = this.items.splice(index, 1)[0];
        this.save();
        return { success: true, message: `${removed.name} removed from cart` };
    },

    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (!item) return { success: false, message: 'Item not in cart' };

        item.quantity += change;

        if (item.quantity <= 0) {
            return this.remove(productId);
        }

        this.save();
        return { success: true, message: `Quantity updated to ${item.quantity}`, item };
    },

    clear() {
        this.items = [];
        this.save();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    getItems() {
        return [...this.items];
    }
};

// --------------------------------------------
// UI CONTROLLER (Frontend Rendering)
// --------------------------------------------
const UIController = {
    elements: {},

    cacheElements() {
        this.elements = {
            productGrid: document.getElementById('product-grid'),
            cartItems: document.querySelector('.cart-items'),
            cartCount: document.querySelector('.cart-count'),
            cartTotal: document.querySelector('.cart-total-amount'),
            cartSidebar: document.querySelector('.cart-sidebar'),
            cartOverlay: document.querySelector('.modal-overlay'),
            toastContainer: null
        };
    },

    // Render Products Grid
    renderProducts(products) {
        if (!this.elements.productGrid) return;

        this.elements.productGrid.innerHTML = products.map((product, index) => `
            <div class="product-card animate-on-scroll" style="--delay: ${index * 0.1}s">
                <div class="product-img">${product.icon}</div>
                <h4>${product.name}</h4>
                <div class="price">$${product.price.toFixed(2)}</div>
                <button class="btn-primary add-to-cart" data-id="${product.id}">
                    <span class="btn-text">Add to Cart</span>
                    <span class="btn-icon">🛒</span>
                </button>
            </div>
        `).join('');

        // Re-trigger animations
        setTimeout(() => {
            document.querySelectorAll('.product-card').forEach(card => {
                card.classList.add('visible');
            });
        }, 50);
    },

    // Render Cart Items
    renderCart() {
        if (!this.elements.cartItems) return;

        const items = CartManager.getItems();

        if (items.length === 0) {
            this.elements.cartItems.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <p>Your cart is empty</p>
                    <a href="#products" class="btn-primary" onclick="App.closeCart()">Start Shopping</a>
                </div>
            `;
            this.elements.cartCount.style.display = 'none';
            this.elements.cartTotal.textContent = '$0.00';
            return;
        }

        this.elements.cartItems.innerHTML = items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-img">${item.icon}</div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn qty-minus" data-id="${item.id}">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-item-remove" data-id="${item.id}">×</button>
                </div>
            </div>
        `).join('');

        this.elements.cartCount.textContent = CartManager.getTotalItems();
        this.elements.cartCount.style.display = 'flex';
        this.elements.cartTotal.textContent = `$${CartManager.getTotal().toFixed(2)}`;
    },

    // Toast Notifications
    showToast(message, type = 'success') {
        let container = this.elements.toastContainer;

        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
            this.elements.toastContainer = container;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Update category card active states
    updateCategoryStates(selectedCategory) {
        document.querySelectorAll('.category-card').forEach(card => {
            if (selectedCategory === 'all') {
                card.classList.remove('active');
            } else {
                card.classList.toggle('active', card.dataset.category === selectedCategory);
            }
        });
    }
};

// --------------------------------------------
// THEME MANAGER (Light/Dark Mode)
// --------------------------------------------
const ThemeManager = {
    THEME_KEY: 'progear_theme',
    currentTheme: 'light',

    init() {
        // Load saved theme or default to light
        const saved = localStorage.getItem(this.THEME_KEY);
        this.currentTheme = saved || 'light';
        this.applyTheme();
        this.setupToggle();
        return this;
    },

    applyTheme() {
        const themeIcon = document.querySelector('.theme-icon');
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
    },

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem(this.THEME_KEY, this.currentTheme);
        this.applyTheme();

        // Show toast notification
        const message = this.currentTheme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
        showToast(message, 'success');
    },

    setupToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    }
};

// --------------------------------------------
// AUTH MODULE (Shared with auth.js)
// --------------------------------------------
const AuthModule = {
    currentUser: null,

    init() {
        const saved = localStorage.getItem('progear_demo_user');
        if (saved) {
            this.currentUser = JSON.parse(saved);
        }
        return this;
    },

    isLoggedIn() {
        return this.currentUser !== null;
    },

    getUser() {
        return this.currentUser;
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('progear_demo_user');
    }
};

AuthModule.init();

// --------------------------------------------
// TOAST NOTIFICATIONS (Global)
// --------------------------------------------
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : '!'}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make globally available
window.showToast = showToast;

// --------------------------------------------
// APPLICATION CONTROLLER (Main App)
// --------------------------------------------
const App = {
    currentCategory: 'all',

    init() {
        // Initialize theme
        ThemeManager.init();

        // Initialize cart
        CartManager.init();

        // Cache DOM elements
        UIController.cacheElements();

        // Render initial products
        UIController.renderProducts(ProductDB.getAll());

        // Setup all event listeners
        this.setupNavigation();
        this.setupCart();
        this.setupCategoryCards();
        this.setupNewsletter();
        this.setupFooter();
        this.setupUserMenu();

        // Initial cart render
        UIController.renderCart();

        // Update navbar based on auth state
        this.updateNavbarAuth();
    },

    // Update Navbar based on Auth State
    updateNavbarAuth() {
        const userMenu = document.getElementById('user-menu');
        const loginBtn = document.getElementById('login-btn-nav');
        const userName = document.getElementById('user-name');
        const userAvatar = document.getElementById('user-avatar');

        if (AuthModule.isLoggedIn()) {
            const user = AuthModule.getUser();
            if (userMenu) userMenu.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';
            if (userName) userName.textContent = user.name;
            if (userAvatar) userAvatar.textContent = user.avatar || '👤';
        } else {
            if (userMenu) userMenu.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
        }
    },

    // User Menu Setup
    setupUserMenu() {
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        const logoutBtn = document.getElementById('logout-btn');
        const viewProfile = document.getElementById('view-profile');
        const myOrders = document.getElementById('my-orders');
        const wishlist = document.getElementById('wishlist');
        const profileModal = document.getElementById('profile-modal');
        const profileModalClose = document.getElementById('profile-modal-close');
        const profileLogoutBtn = document.getElementById('profile-logout-btn');

        // Toggle dropdown
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('open');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.remove('open');
            });
        }

        // View Profile
        if (viewProfile) {
            viewProfile.addEventListener('click', (e) => {
                e.preventDefault();
                userDropdown.classList.remove('open');
                this.openProfileModal();
            });
        }

        // My Orders
        if (myOrders) {
            myOrders.addEventListener('click', (e) => {
                e.preventDefault();
                userDropdown.classList.remove('open');
                this.openProfileModal();
            });
        }

        // Wishlist
        if (wishlist) {
            wishlist.addEventListener('click', (e) => {
                e.preventDefault();
                userDropdown.classList.remove('open');
                this.openProfileModal();
            });
        }

        // Profile Modal Close
        if (profileModalClose) {
            profileModalClose.addEventListener('click', () => this.closeProfileModal());
        }

        // Close modal when clicking overlay
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) {
                    this.closeProfileModal();
                }
            });
        }

        // Profile Logout Button
        if (profileLogoutBtn) {
            profileLogoutBtn.addEventListener('click', () => {
                this.closeProfileModal();
                this.performLogout();
            });
        }

        // Logout from dropdown
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                userDropdown.classList.remove('open');
                this.performLogout();
            });
        }
    },

    // Open Profile Modal
    openProfileModal() {
        const profileModal = document.getElementById('profile-modal');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileAvatar = document.getElementById('profile-avatar');

        if (AuthModule.isLoggedIn()) {
            const user = AuthModule.getUser();
            if (profileName) profileName.textContent = user.name;
            if (profileEmail) profileEmail.textContent = user.email;
            if (profileAvatar) profileAvatar.textContent = user.avatar || '👤';
        }

        if (profileModal) {
            profileModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    },

    // Close Profile Modal
    closeProfileModal() {
        const profileModal = document.getElementById('profile-modal');
        if (profileModal) {
            profileModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    },

    // Perform Logout
    performLogout() {
        AuthModule.logout();
        showToast('You have been signed out successfully!', 'success');

        // Update navbar immediately
        this.updateNavbarAuth();

        // Redirect to home after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    },

    // Navigation & Scroll
    setupNavigation() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile menu
                    const navLinks = document.querySelector('.nav-links');
                    if (navLinks) navLinks.style.display = '';
                }
            });
        });

        // Mobile menu
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        if (mobileBtn && navLinks) {
            mobileBtn.addEventListener('click', () => {
                const isOpen = navLinks.style.display === 'flex';
                navLinks.style.display = isOpen ? '' : 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '60px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#1a1a1a';
                navLinks.style.padding = '1rem';
                mobileBtn.textContent = isOpen ? '☰' : '✕';
            });
        }

        // Animate elements on scroll
        this.setupScrollAnimations();
    },

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    // Cart Functionality
    setupCart() {
        // Cart toggle button
        const cartToggle = document.querySelector('.cart-toggle');
        const cartClose = document.querySelector('.cart-close');

        if (cartToggle) {
            cartToggle.addEventListener('click', () => this.openCart());
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart());
        }

        if (UIController.elements.cartOverlay) {
            UIController.elements.cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        // Add to cart buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                const btn = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const productId = parseInt(btn.dataset.id);
                this.addToCart(productId, btn);
            }

            // Quantity buttons
            if (e.target.classList.contains('qty-plus')) {
                const productId = parseInt(e.target.dataset.id);
                this.updateCartQuantity(productId, 1);
            }

            if (e.target.classList.contains('qty-minus')) {
                const productId = parseInt(e.target.dataset.id);
                this.updateCartQuantity(productId, -1);
            }

            if (e.target.classList.contains('cart-item-remove')) {
                const productId = parseInt(e.target.dataset.id);
                this.removeFromCart(productId);
            }
        });
    },

    addToCart(productId, buttonEl) {
        // Button animation
        if (buttonEl) {
            buttonEl.classList.add('adding');
            setTimeout(() => buttonEl.classList.remove('adding'), 500);
        }

        const result = CartManager.add(productId);

        if (result.success) {
            UIController.renderCart();
            UIController.showToast(result.message, 'success');

            // Animate cart count
            const cartCount = UIController.elements.cartCount;
            if (cartCount) {
                cartCount.classList.add('bump');
                setTimeout(() => cartCount.classList.remove('bump'), 300);
            }
        } else {
            UIController.showToast(result.message, 'error');
        }
    },

    removeFromCart(productId) {
        const result = CartManager.remove(productId);
        if (result.success) {
            UIController.renderCart();
            UIController.showToast(result.message, 'success');
        }
    },

    updateCartQuantity(productId, change) {
        const result = CartManager.updateQuantity(productId, change);
        if (result.success) {
            UIController.renderCart();
        }
    },

    openCart() {
        const sidebar = UIController.elements.cartSidebar;
        const overlay = UIController.elements.cartOverlay;

        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    },

    closeCart() {
        const sidebar = UIController.elements.cartSidebar;
        const overlay = UIController.elements.cartOverlay;

        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    },

    handleCheckout() {
        const items = CartManager.getItems();

        if (items.length === 0) {
            UIController.showToast('Your cart is empty!', 'error');
            return;
        }

        const total = CartManager.getTotal();
        CartManager.clear();
        UIController.renderCart();
        UIController.showToast(`Order placed! Total: $${total.toFixed(2)}`, 'success');
        this.closeCart();
    },

    // Category Cards
    setupCategoryCards() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;

                // Toggle off if already selected
                if (card.classList.contains('active') && this.currentCategory !== 'all') {
                    this.currentCategory = 'all';
                    UIController.renderProducts(ProductDB.getAll());
                    UIController.updateCategoryStates('all');
                } else {
                    this.currentCategory = category;
                    const filtered = ProductDB.getByCategory(category);
                    UIController.renderProducts(filtered);
                    UIController.updateCategoryStates(category);
                }
            });
        });
    },

    // Newsletter
    setupNewsletter() {
        const form = document.querySelector('.newsletter-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;

                if (email) {
                    UIController.showToast('Thanks for subscribing!', 'success');
                    form.reset();
                }
            });
        }
    },

    // Footer
    setupFooter() {
        const footerLinks = {
            'Contact Us': () => UIController.showToast('Contact: support@progear.com', 'success'),
            'Shipping Info': () => UIController.showToast('Free shipping on orders over $100!', 'success'),
            'Returns': () => UIController.showToast('30-day hassle-free returns', 'success'),
            'FAQ': () => UIController.showToast('Visit our FAQ page for help', 'success'),
            'Instagram': () => UIController.showToast('Opening Instagram...', 'success'),
            'Twitter': () => UIController.showToast('Opening Twitter...', 'success'),
            'Facebook': () => UIController.showToast('Opening Facebook...', 'success'),
            'YouTube': () => UIController.showToast('Opening YouTube...', 'success')
        };

        document.querySelectorAll('footer a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const text = link.textContent;
                if (footerLinks[text]) {
                    footerLinks[text]();
                } else if (['Basketball', 'Soccer', 'Tennis', 'Running'].includes(text)) {
                    this.currentCategory = text;
                    UIController.renderProducts(ProductDB.getByCategory(text));
                    UIController.updateCategoryStates(text);
                    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
};

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
