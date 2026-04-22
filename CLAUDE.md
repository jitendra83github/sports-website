# ProGear Sports Website

Premium sports equipment e-commerce website.

## Project Overview
- **Type**: Static HTML/CSS/JS e-commerce website
- **Repository**: https://github.com/jitendra83github/sports-website
- **Live Site**: https://sports-website-3b5b5.web.app (Firebase Hosting)
- **Main Page**: `index.html` (home page with products, cart, auth)
- **Auth Page**: `auth.html` (login/signup/forgot password)

## Tech Stack
- HTML5, CSS3, JavaScript (vanilla)
- Firebase Auth & Hosting (ready for integration)
- LocalStorage for cart/theme persistence

## File Structure
```
├── index.html          # Main landing page
├── auth.html           # Authentication page (login/signup)
├── firebase.json       # Firebase hosting configuration
├── css/
│   ├── styles.css      # Main stylesheet + dark theme
│   └── auth.css        # Auth page styles + dark theme
├── js/
│   ├── app.js          # Main app logic, cart, theme manager
│   └── auth.js         # Authentication logic
├── images/
│   └── logo.svg        # SVG shield logo (optional, inline used instead)
└── .gitignore
```

## Key Features

### Logo
- Custom SVG shield icon with "P" letter and lightning bolt
- Gold gradient coloring matching luxury theme
- Hover animation (scale effect)
- Tagline "Sports" below main text

### Theme Toggle
- Light/dark mode with localStorage persistence
- Toggle button in navbar header (🌙/☀️)
- `ThemeManager` module handles toggle/save

### Shopping Cart
- Slide-out sidebar with quantity controls
- `CartManager` object manages cart state
- Data persists in localStorage key: `progear_cart`

### User Authentication
- Demo auth system with Firebase-ready structure
- Demo users: demo@progear.com, admin@progear.com, athlete@progear.com (password: demo123, admin123, sport123)
- Google OAuth buttons (demo mode)
- User data in localStorage: `progear_demo_user`

### Profile Modal
- Modern redesigned popup with cover background
- Animated avatar with online status indicator
- Premium member badges with star icon
- Stats row (Orders, Wishlist, Total Spent) with icons
- Quick action buttons with SVG icons
- Settings menu with arrow indicators
- Full dark theme support
- Smooth scale + slide entrance animations

### Product Filtering
- Category cards filter products on click
- Active state highlighting with gold border

### Toast Notifications
- `showToast(message, type)` function
- Success/error/info types supported

## Key Functions/Objects

### app.js
- `ThemeManager` - Theme toggle (init, toggle, applyTheme, setupToggle)
- `CartManager` - Cart operations (add, remove, updateQuantity, getTotal, getTotalItems, getItems)
- `UIController` - UI rendering (renderProducts, renderCart, showToast, cacheElements)
- `AuthModule` - Auth state (isLoggedIn, getUser, logout, init)
- `App` - Main controller (init, setupNavigation, setupCart, setupCategoryCards, setupUserMenu, openProfileModal, closeProfileModal, etc.)
- `showToast(message, type)` - Global toast notification

### auth.js
- `DemoAuth` - Demo authentication (login, signup, logout, isLoggedIn, getUser)
- `ThemeManager` - Same theme module as app.js
- `showToast(message, type)` - Toast for auth page
- Card switching: `showLogin()`, `showSignUp()`, `showForgotPassword()`
- Password toggle: `.toggle-password` button

## Theme Implementation
- CSS variables defined in `:root` for light theme
- Dark theme via `body.dark-theme` class override
- Theme preference saved to localStorage key: `progear_theme`
- Theme applied on page load from saved preference

## Cart Storage Format
```json
[{"id": 1, "name": "Wilson NBA Official Game Ball", "price": 189.99, "image": "https://...", "category": "Basketball", "quantity": 2}]
```

## User Storage Format
```json
{"email": "demo@progear.com", "name": "Demo User", "avatar": "🏃"}
```

## Testing Auth
- Login: http://localhost:PORT/auth.html (serve locally)
- Demo credentials: demo@progear.com / demo123
- Or use Google/GitHub social login buttons (demo mode)

## Common Tasks

### Add new product
Edit `ProductDB.products` array in `js/app.js`:
```js
{id: 17, name: 'New Product', price: 99.99, image: 'https://...', category: 'Basketball'}
```

### Add new theme color
Edit CSS `:root` variables in `css/styles.css`:
```css
:root {
    --primary: #c9a962;
    --gold: #d4af37;
    /* add new colors here */
}
```

### Modify cart behavior
Edit `CartManager` methods in `js/app.js`

## Deployment

### GitHub
```bash
git add .
git commit -m "Your message"
git push origin main
```

### Firebase Hosting
1. Run `firebase login` to authenticate
2. Run `firebase deploy` to deploy

Or use CI/CD with GitHub Actions (configured in `.github/workflows/`)

## Dependencies (CDN)
- Firebase Auth SDK (in auth.html)
- No other external dependencies