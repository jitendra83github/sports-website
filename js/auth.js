// ============================================
// PROGEAR SPORTS - AUTHENTICATION
// ============================================

// --------------------------------------------
// FIREBASE CONFIGURATION
// --------------------------------------------
// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAQpnSVOSPLRJfG99PtFwBEZoGW1HfG9m4",
    authDomain: "progear-jit1.firebaseapp.com",
    projectId: "progear-jit1",
    storageBucket: "progear-jit1.firebasestorage.app",
    messagingSenderId: "711309433406",
    appId: "1:711309433406:web:cace0b98f0353d3ae20f6f",
    measurementId: "G-HF8K7PQK2D"
};

// Initialize Firebase
let firebaseInitialized = false;
let firebaseAuth = null;
let confirmationResult = null;
let recaptchaVerifier = null;

function initFirebase() {
    if (firebaseInitialized) return true;

    try {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded. Using demo mode.');
            return false;
        }

        firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        firebaseInitialized = true;
        return true;
    } catch (error) {
        console.warn('Firebase initialization failed:', error.message);
        return false;
    }
}

// Initialize Firebase on load
initFirebase();

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
// Falls back to this if Firebase is not configured
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
const phoneForm = document.getElementById('phone-form');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const forgotBtn = document.getElementById('forgot-btn');
const phoneBtn = document.getElementById('phone-btn');

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
    document.getElementById('phone-card').classList.remove('active');
    document.getElementById('signup-card').classList.remove('active');
    document.getElementById('forgot-card').classList.remove('active');
    document.querySelector('.auth-card').classList.add('active');
}

function showSignUp() {
    clearErrors();
    document.querySelector('.auth-card').classList.remove('active');
    document.getElementById('phone-card').classList.remove('active');
    document.getElementById('forgot-card').classList.remove('active');
    document.getElementById('signup-card').classList.add('active');
}

function showForgotPassword() {
    clearErrors();
    document.querySelector('.auth-card').classList.remove('active');
    document.getElementById('phone-card').classList.remove('active');
    document.getElementById('signup-card').classList.remove('active');
    document.getElementById('forgot-card').classList.add('active');
}

function showPhoneLogin() {
    clearErrors();
    document.querySelector('.auth-card').classList.remove('active');
    document.getElementById('signup-card').classList.remove('active');
    document.getElementById('forgot-card').classList.remove('active');
    document.getElementById('phone-card').classList.add('active');

    // Reset phone form state
    document.getElementById('phone-step-1').classList.remove('hidden');
    document.getElementById('phone-step-2').classList.add('hidden');
    phoneForm.reset();

    // Initialize reCAPTCHA if Firebase is available
    if (firebaseInitialized) {
        initRecaptcha();
    }
}

// Make functions global
window.showLogin = showLogin;
window.showSignUp = showSignUp;
window.showForgotPassword = showForgotPassword;
window.showPhoneLogin = showPhoneLogin;
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
// GOOGLE AUTHENTICATION
// --------------------------------------------
async function signInWithGoogle() {
    if (!firebaseInitialized) {
        // Demo mode fallback
        setButtonLoading(loginBtn, true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        DemoAuth.currentUser = { email: 'google.user@gmail.com', name: 'Google User', avatar: '🔵' };
        localStorage.setItem('progear_demo_user', JSON.stringify(DemoAuth.currentUser));

        showToast('Welcome Google User!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    setButtonLoading(loginBtn, true);

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        const result = await firebaseAuth.signInWithPopup(provider);
        const user = result.user;
        const isNewUser = result._tokenResponse?.isNewUser || false;

        // Store user data
        const userData = {
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            avatar: '🔵',
            uid: user.uid,
            provider: 'google'
        };

        // Check if returning user by email
        const existingUserData = localStorage.getItem('progear_demo_user');
        const existingUser = existingUserData ? JSON.parse(existingUserData) : null;

        if (existingUser && existingUser.email === user.email && existingUser.profileComplete) {
            // Returning user - go directly to home
            localStorage.setItem('progear_demo_user', JSON.stringify(userData));
            showToast(`Welcome back, ${userData.name}!`, 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // New user - go to profile setup
            sessionStorage.setItem('progear_pending_user', JSON.stringify(userData));
            showToast(`Welcome ${userData.name}! Let's set up your profile.`, 'success');
            setTimeout(() => {
                window.location.href = 'profile-setup.html';
            }, 1500);
        }

    } catch (error) {
        console.error('Google sign-in error:', error);

        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Sign-in cancelled', 'info');
        } else if (error.code === 'auth/network-request-failed') {
            showToast('Network error. Please check your connection.', 'error');
        } else {
            showToast(error.message || 'Google sign-in failed', 'error');
        }
    } finally {
        setButtonLoading(loginBtn, false);
    }
}

async function signUpWithGoogle() {
    if (!firebaseInitialized) {
        // Demo mode fallback
        setButtonLoading(signupBtn, true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        DemoAuth.currentUser = { email: 'google.user@gmail.com', name: 'Google User', avatar: '🔵' };
        localStorage.setItem('progear_demo_user', JSON.stringify(DemoAuth.currentUser));

        showModal('Welcome!', 'Your account has been created with Google.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    setButtonLoading(signupBtn, true);

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        const result = await firebaseAuth.signInWithPopup(provider);
        const user = result.user;
        const isNewUser = result._tokenResponse?.isNewUser || false;

        // Store user data
        const userData = {
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            avatar: '🔵',
            uid: user.uid,
            provider: 'google'
        };

        if (isNewUser) {
            // New user - go to profile setup
            sessionStorage.setItem('progear_pending_user', JSON.stringify(userData));
            showModal('Welcome!', 'Your account has been created with Google. Let\'s set up your profile.');
            setTimeout(() => {
                window.location.href = 'profile-setup.html';
            }, 2000);
        } else {
            // Existing user just logging in
            localStorage.setItem('progear_demo_user', JSON.stringify(userData));
            showModal('Welcome!', 'Welcome back!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }

    } catch (error) {
        console.error('Google sign-up error:', error);

        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Sign-up cancelled', 'info');
        } else if (error.code === 'auth/network-request-failed') {
            showToast('Network error. Please check your connection.', 'error');
        } else {
            showToast(error.message || 'Google sign-up failed', 'error');
        }
    } finally {
        setButtonLoading(signupBtn, false);
    }
}

// Make Google functions global
window.signInWithGoogle = signInWithGoogle;
window.signUpWithGoogle = signUpWithGoogle;

// --------------------------------------------
// PHONE AUTHENTICATION (OTP)
// --------------------------------------------
function initRecaptcha() {
    if (!firebaseInitialized) return;

    // Clear previous recaptcha if exists
    const recaptchaContainer = document.getElementById('recaptcha-container');
    recaptchaContainer.innerHTML = '';

    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': () => {
            // reCAPTCHA solved
        },
        'expired-callback': () => {
            showToast('reCAPTCHA expired. Please try again.', 'warning');
            initRecaptcha();
        }
    });

    recaptchaVerifier.render();
}

async function sendPhoneOTP() {
    const phoneNumber = document.getElementById('phone-number').value.trim();

    if (!phoneNumber) {
        showError('phone-error', 'Phone number is required');
        return false;
    }

    // Basic phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        showError('phone-error', 'Please enter a valid phone number with country code (e.g., +1234567890)');
        return false;
    }

    if (!firebaseInitialized) {
        // Demo mode - simulate OTP
        simulatePhoneOTP(phoneNumber);
        return true;
    }

    setButtonLoading(phoneBtn, true);

    try {
        // Ensure recaptcha is initialized
        if (!recaptchaVerifier) {
            initRecaptcha();
        }

        confirmationResult = await firebaseAuth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier);

        // Show OTP step
        document.getElementById('phone-step-1').classList.add('hidden');
        document.getElementById('phone-step-2').classList.remove('hidden');
        document.getElementById('phone-btn').querySelector('.btn-text').textContent = 'Verify OTP';

        // Start countdown
        startOTPCountdown();

        showToast('OTP sent to ' + phoneNumber, 'success');
        return true;

    } catch (error) {
        console.error('Phone OTP error:', error);

        if (error.code === 'auth/invalid-phone-number') {
            showError('phone-error', 'Invalid phone number format');
        } else if (error.code === 'auth/too-many-requests') {
            showError('phone-error', 'Too many attempts. Please try again later.');
        } else if (error.code === 'auth/captcha-check-failed') {
            showError('phone-error', 'reCAPTCHA verification failed. Please try again.');
            initRecaptcha();
        } else {
            showError('phone-error', error.message || 'Failed to send OTP');
        }
        return false;
    } finally {
        setButtonLoading(phoneBtn, false);
    }
}

async function verifyPhoneOTP() {
    // Get OTP from inputs
    const otpDigits = [];
    for (let i = 1; i <= 6; i++) {
        const digit = document.getElementById(`otp-${i}`).value.trim();
        if (!digit) {
            showError('otp-error', 'Please enter all 6 digits');
            return false;
        }
        otpDigits.push(digit);
    }
    const otp = otpDigits.join('');

    if (otp.length !== 6) {
        showError('otp-error', 'Please enter all 6 digits');
        return false;
    }

    if (!firebaseInitialized) {
        // Demo mode - simulate success
        DemoAuth.currentUser = {
            email: 'phone.user@progear.com',
            name: 'Phone User',
            avatar: '📱'
        };
        localStorage.setItem('progear_demo_user', JSON.stringify(DemoAuth.currentUser));

        showToast('Phone verification successful!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return true;
    }

    setButtonLoading(phoneBtn, true);

    try {
        const result = await confirmationResult.confirm(otp);
        const user = result.user;

        // Store user data
        const userData = {
            email: user.phoneNumber ? `${user.phoneNumber}@progear.temp` : 'phone.user@progear.com',
            name: 'Phone User',
            avatar: '📱',
            uid: user.uid,
            phone: user.phoneNumber,
            provider: 'phone'
        };

        // Check if returning user
        const existingUserData = localStorage.getItem('progear_demo_user');
        const existingUser = existingUserData ? JSON.parse(existingUserData) : null;

        if (existingUser && existingUser.phone === user.phoneNumber && existingUser.profileComplete) {
            // Returning user - go directly to home
            localStorage.setItem('progear_demo_user', JSON.stringify(userData));
            showToast('Phone verification successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // New user - go to profile setup
            sessionStorage.setItem('progear_pending_user', JSON.stringify(userData));
            showToast('Verification successful! Let\'s set up your profile.', 'success');
            setTimeout(() => {
                window.location.href = 'profile-setup.html';
            }, 1500);
        }
        return true;

    } catch (error) {
        console.error('OTP verification error:', error);

        if (error.code === 'auth/invalid-verification-code') {
            showError('otp-error', 'Invalid OTP. Please try again.');
        } else if (error.code === 'auth/code-expired') {
            showError('otp-error', 'OTP has expired. Please request a new one.');
        } else {
            showError('otp-error', error.message || 'Verification failed');
        }
        return false;
    } finally {
        setButtonLoading(phoneBtn, false);
    }
}

// Demo mode phone OTP simulation
function simulatePhoneOTP(phoneNumber) {
    document.getElementById('phone-step-1').classList.add('hidden');
    document.getElementById('phone-step-2').classList.remove('hidden');
    document.getElementById('phone-btn').querySelector('.btn-text').textContent = 'Verify OTP';

    startOTPCountdown();
    showToast('Demo: OTP sent to ' + phoneNumber, 'success');
}

// OTP Timer
let otpCountdownInterval = null;

function startOTPCountdown() {
    let seconds = 60;
    const countdownEl = document.getElementById('otp-countdown');
    const timerText = document.getElementById('otp-timer-text');
    const resendBtn = document.getElementById('resend-otp-btn');

    if (otpCountdownInterval) {
        clearInterval(otpCountdownInterval);
    }

    resendBtn.disabled = true;
    timerText.style.display = 'block';

    otpCountdownInterval = setInterval(() => {
        seconds--;
        countdownEl.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(otpCountdownInterval);
            timerText.style.display = 'none';
            resendBtn.disabled = false;
        }
    }, 1000);
}

function resendOTP() {
    if (firebaseInitialized && recaptchaVerifier) {
        // Reset recaptcha
        recaptchaVerifier.render();
    }
    document.getElementById('phone-step-2').classList.add('hidden');
    document.getElementById('phone-step-1').classList.remove('hidden');
    document.getElementById('phone-btn').querySelector('.btn-text').textContent = 'Send OTP';

    // Clear OTP inputs
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`otp-${i}`).value = '';
    }
}

// Make resendOTP global
window.resendOTP = resendOTP;

// Phone form submit handler
phoneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const isStep1 = !document.getElementById('phone-step-2').classList.contains('hidden');

    if (isStep1) {
        await sendPhoneOTP();
    } else {
        await verifyPhoneOTP();
    }
});

// OTP input auto-focus
document.querySelectorAll('.otp-digit').forEach((input, index, inputs) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;

        // Only allow digits
        if (!/^\d*$/.test(value)) {
            e.target.value = '';
            return;
        }

        // Move to next input if value entered
        if (value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        // Handle backspace to move to previous input
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });

    // Handle paste for OTP
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        pastedData.split('').forEach((char, i) => {
            if (inputs[i]) {
                inputs[i].value = char;
            }
        });

        // Focus last filled or first empty
        const lastFilledIndex = Math.min(pastedData.length, inputs.length - 1);
        inputs[lastFilledIndex].focus();
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
