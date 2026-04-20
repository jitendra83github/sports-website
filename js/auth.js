// ============================================
// PROGEAR SPORTS - AUTHENTICATION
// ============================================

// --------------------------------------------
// THEME MANAGER (Shared)
// --------------------------------------------
const ThemeManager = {
    THEME_KEY: 'progear_theme',
    currentTheme: 'light',

    init() {
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
        showToast(this.currentTheme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled', 'success');
    },

    setupToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    }
};

// Initialize theme on load
ThemeManager.init();

// --------------------------------------------
// DEMO MODE AUTHENTICATION
// For immediate testing without Firebase setup
// --------------------------------------------
const DemoAuth = {
    users: [
        { email: 'demo@progear.com', password: 'demo123', name: 'Demo User' },
        { email: 'admin@progear.com', password: 'admin123', name: 'Admin User' },
        { email: 'athlete@progear.com', password: 'sport123', name: 'Pro Athlete' }
    ],

    currentUser: null,

    init() {
        const saved = localStorage.getItem('progear_demo_user');
        if (saved) {
            this.currentUser = JSON.parse(saved);
        }
        return this;
    },

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = { email: user.email, name: user.name, avatar: '🏃' };
            localStorage.setItem('progear_demo_user', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }
        return { success: false, error: 'Invalid email or password' };
    },

    signup(email, password, name) {
        const exists = this.users.find(u => u.email === email);
        if (exists) {
            return { success: false, error: 'Email already registered' };
        }
        this.users.push({ email, password, name });
        this.currentUser = { email, name, avatar: '🏃' };
        localStorage.setItem('progear_demo_user', JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('progear_demo_user');
    },

    isLoggedIn() {
        return this.currentUser !== null;
    },

    getUser() {
        return this.currentUser;
    }
};

// Initialize demo auth
DemoAuth.init();

// --------------------------------------------
// DOM ELEMENTS
// --------------------------------------------
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotForm = document.getElementById('forgot-form');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const forgotBtn = document.getElementById('forgot-btn');

// --------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : '!'}</span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setButtonLoading(btn, loading) {
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId);
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function showModal(title, message) {
    const modal = document.getElementById('success-modal');
    modal.querySelector('h2').textContent = title;
    modal.querySelector('p').textContent = message;
    modal.classList.add('open');
}

function closeModal() {
    document.getElementById('success-modal').classList.remove('open');
}

// --------------------------------------------
// CARD SWITCHING
// --------------------------------------------
function showLogin() {
    clearErrors();
    document.getElementById('signup-card').classList.remove('active');
    document.getElementById('forgot-card').classList.remove('active');
    document.querySelector('.auth-card').classList.add('active');
}

function showSignUp() {
    clearErrors();
    document.querySelector('.auth-card').classList.remove('active');
    document.getElementById('forgot-card').classList.remove('active');
    document.getElementById('signup-card').classList.add('active');
}

function showForgotPassword() {
    clearErrors();
    document.querySelector('.auth-card').classList.remove('active');
    document.getElementById('signup-card').classList.remove('active');
    document.getElementById('forgot-card').classList.add('active');
}

// Make functions global
window.showLogin = showLogin;
window.showSignUp = showSignUp;
window.showForgotPassword = showForgotPassword;
window.closeModal = closeModal;

// --------------------------------------------
// PASSWORD VISIBILITY TOGGLE
// --------------------------------------------
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.closest('.input-wrapper').querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    });
});

// --------------------------------------------
// LOGIN HANDLER
// --------------------------------------------
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Validation
    if (!email) {
        showError('email-error', 'Email is required');
        return;
    }

    if (!password) {
        showError('password-error', 'Password is required');
        return;
    }

    setButtonLoading(loginBtn, true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const result = DemoAuth.login(email, password);

        if (result.success) {
            showToast(`Welcome back, ${result.user.name}!`, 'success');

            // Redirect to home page after successful login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showToast(result.error, 'error');
        }

    } catch (error) {
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        setButtonLoading(loginBtn, false);
    }
});

// --------------------------------------------
// SIGN UP HANDLER
// --------------------------------------------
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const terms = document.getElementById('terms').checked;

    // Validation
    if (!name) {
        showToast('Please enter your name', 'warning');
        return;
    }

    if (!email) {
        showError('signup-email-error', 'Email is required');
        return;
    }

    if (!password) {
        showError('signup-password-error', 'Password is required');
        return;
    }

    if (password.length < 6) {
        showError('signup-password-error', 'Password must be at least 6 characters');
        return;
    }

    if (password !== confirm) {
        showError('signup-confirm-error', 'Passwords do not match');
        return;
    }

    if (!terms) {
        showToast('Please accept the Terms of Service', 'warning');
        return;
    }

    setButtonLoading(signupBtn, true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const result = DemoAuth.signup(email, password, name);

        if (result.success) {
            showModal('Account Created!', `Welcome ${name}! Your account has been created successfully.`);
            signupForm.reset();
        } else {
            showToast(result.error, 'error');
        }

    } catch (error) {
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        setButtonLoading(signupBtn, false);
    }
});

// --------------------------------------------
// FORGOT PASSWORD HANDLER
// --------------------------------------------
forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('forgot-email').value.trim();

    if (!email) {
        showToast('Please enter your email', 'warning');
        return;
    }

    setButtonLoading(forgotBtn, true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        // In demo mode, check if email exists
        const user = DemoAuth.users.find(u => u.email === email);

        if (user) {
            showModal('Reset Link Sent', `We've sent a password reset link to ${email}. Please check your inbox. (Demo: Password is "${user.password}")`);
            forgotForm.reset();
        } else {
            showToast('No account found with this email', 'error');
        }

    } catch (error) {
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        setButtonLoading(forgotBtn, false);
    }
});

// --------------------------------------------
// SOCIAL LOGIN HANDLERS (Demo)
// --------------------------------------------
async function signInWithGoogle() {
    // Demo: simulate Google sign-in
    setButtonLoading(loginBtn, true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    DemoAuth.currentUser = { email: 'google.user@gmail.com', name: 'Google User', avatar: '🔵' };
    localStorage.setItem('progear_demo_user', JSON.stringify(DemoAuth.currentUser));

    showToast('Welcome Google User!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

async function signUpWithGoogle() {
    // Demo: simulate Google sign-up
    setButtonLoading(signupBtn, true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    DemoAuth.currentUser = { email: 'google.user@gmail.com', name: 'Google User', avatar: '🔵' };
    localStorage.setItem('progear_demo_user', JSON.stringify(DemoAuth.currentUser));

    showModal('Welcome!', 'Your account has been created with Google.');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Make global
window.signInWithGoogle = signInWithGoogle;
window.signUpWithGoogle = signUpWithGoogle;

// --------------------------------------------
// CHECK AUTH STATE ON LOAD
// --------------------------------------------
function checkAuthState() {
    if (DemoAuth.isLoggedIn()) {
        const user = DemoAuth.getUser();
        showToast(`You're already logged in as ${user.name}`, 'success');
    }
}

// --------------------------------------------
// INITIALIZE
// --------------------------------------------
// Show login card by default
document.querySelector('.auth-card').classList.add('active');

// Check if already logged in
checkAuthState();

// Add input focus animations
document.querySelectorAll('.input-wrapper input').forEach(input => {
    input.addEventListener('focus', () => {
        input.closest('.input-group')?.classList.add('focused');
    });

    input.addEventListener('blur', () => {
        input.closest('.input-group')?.classList.remove('focused');
    });
});
