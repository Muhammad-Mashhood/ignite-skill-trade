# SkillTrade Frontend

## Overview

This is the frontend application for the SkillTrade platform, built with React and Vite.

## Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── PrivateRoute.jsx    # Protected route wrapper
│   │   └── layout/
│   │       ├── Navbar.jsx          # Navigation bar
│   │       └── Navbar.css
│   ├── contexts/
│   │   ├── AuthContext.jsx         # Authentication state
│   │   └── ToastContext.jsx        # Toast notifications
│   ├── pages/
│   │   ├── HomePage.jsx            # Landing page
│   │   ├── LoginPage.jsx           # Login page
│   │   ├── RegisterPage.jsx        # Registration page
│   │   ├── DashboardPage.jsx       # User dashboard
│   │   ├── ProfilePage.jsx         # User profile
│   │   ├── SkillsPage.jsx          # Skills browsing
│   │   ├── MatchingPage.jsx        # Find learning partners
│   │   ├── TradesPage.jsx          # Trade management
│   │   └── NotFoundPage.jsx        # 404 page
│   ├── services/
│   │   └── api.js                  # API calls
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # App entry point
│   └── index.css                   # Global styles
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Features

### Pages

#### Home Page
- Landing page with platform overview
- Features showcase
- Call-to-action buttons

#### Authentication
- Login page
- Registration page
- JWT token management

#### Dashboard
- User statistics (coins, sessions, rating, level)
- Quick action buttons
- Overview of user activity

#### Profile (Coming Soon)
- Edit user information
- Manage skills to teach/learn
- Update availability

#### Skills (Coming Soon)
- Browse all available skills
- Filter by category
- Search functionality

#### Matching (Coming Soon)
- Find compatible learning partners
- Smart recommendations
- View partner profiles

#### Trades (Coming Soon)
- View pending/active/completed trades
- Accept/decline requests
- Rate completed sessions

### Components

#### Navbar
- Navigation links
- User coin balance display
- Login/logout functionality

#### PrivateRoute
- Route protection for authenticated users
- Redirects to login if not authenticated

### Context Providers

#### AuthContext
- Manages authentication state
- Login/logout/register functions
- User profile data
- JWT token handling

#### ToastContext
- Display success/error/info messages
- Auto-dismiss after 3 seconds
- Multiple toast support

### API Service

All API calls are centralized in `src/services/api.js`:

```javascript
// Example usage
import { loginUser, getUserProfile } from './services/api';

// Login
const data = await loginUser(email, password);

// Get profile
const profile = await getUserProfile();
```

## Styling

- Global styles in `index.css`
- Component-specific CSS files
- Utility classes for common patterns

### Utility Classes

```css
.btn                 /* Base button */
.btn-primary         /* Primary button */
.btn-secondary       /* Secondary button */
.card                /* Card container */
.loading             /* Loading state */
.error-message       /* Error display */
.success-message     /* Success display */
```

## Routes

| Path | Component | Protected | Description |
|------|-----------|-----------|-------------|
| `/` | HomePage | No | Landing page |
| `/login` | LoginPage | No | User login |
| `/register` | RegisterPage | No | User registration |
| `/dashboard` | DashboardPage | Yes | User dashboard |
| `/profile` | ProfilePage | Yes | User profile |
| `/skills` | SkillsPage | Yes | Browse skills |
| `/matching` | MatchingPage | Yes | Find partners |
| `/trades` | TradesPage | Yes | Manage trades |
| `*` | NotFoundPage | No | 404 page |

## Development

### Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### API Integration

The frontend proxies API requests to the backend server:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### State Management

Using React Context API for:
- Authentication state
- User profile
- Toast notifications

### Protected Routes

All authenticated pages are wrapped with `<PrivateRoute>`:

```jsx
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <DashboardPage />
    </PrivateRoute>
  }
/>
```

## Building for Production

1. Update `.env` with production API URL
2. Build the application:
```bash
npm run build
```
3. Deploy the `dist/` folder to your hosting service

## Future Enhancements

- Complete all placeholder pages
- Add loading states
- Implement error boundaries
- Add form validation
- Responsive design improvements
- Dark mode support
- Internationalization (i18n)
- Progressive Web App (PWA)
