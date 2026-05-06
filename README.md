# Hpower Car Rental - Booking System

Professional car rental booking system with internationalization support (Spanish/English), integration with HQ Rentals platform, Supabase database, and administrative dashboard.

## Project Structure

```
web-hq-ant/
├── index.html              # Main landing page with booking form
├── fleet.html              # Dynamic fleet catalog (Supabase-powered)
├── booking.html            # HQ Rentals iframe integration
├── contact.html            # Contact information and form
├── login.html              # Admin authentication
├── admin-panel.html        # Administrative dashboard
├── terms.html              # Terms and conditions
├── js/
│   ├── supabase-client.js  # Supabase REST client (CRITICAL)
│   ├── main.js             # Lucide icons initialization
│   ├── i18n.js             # Internationalization (NOT USED - duplicated inline)
│   ├── carousel.js         # Banner carousel (NOT USED - duplicated inline)
│   └── booking.js          # Booking logic (NOT USED - duplicated inline)
├── backend/                # Express.js API server
│   ├── src/
│   │   ├── server.js       # Main server entry point
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route controllers
│   │   └── middlewares/    # Express middlewares
│   └── package.json
├── Logo/                   # Brand assets
├── assets/                 # Static assets
└── README.md               # This file
```

## Features

- **Responsive Design**: Mobile-first approach with breakpoints for tablets and desktops
- **Internationalization (i18n)**: Support for Spanish and English with language switcher (inline in each HTML)
- **Professional Icons**: Lucide Icons SVG library for consistent iconography
- **Booking Integration**: Seamless integration with HQ Rentals platform via iframe
- **Dynamic Fleet Catalog**: Real-time vehicle data from Supabase database
- **Live Fleet Counters**: Real-time availability counters on homepage
- **Administrative Dashboard**: Full admin panel with fleet management and sync capabilities
- **Theme Switching**: Dark/light mode toggle with localStorage persistence
- **Form Validation**: Client-side validation for booking form
- **Location Sync**: Automatic synchronization of pickup and return locations
- **HQ Rentals Sync**: Automated synchronization script for keeping Supabase updated

## Technologies Used

### Frontend
- **HTML5**: Semantic markup with inline CSS and JavaScript
- **CSS3**: Modern CSS with CSS variables, Flexbox, and Grid (inline in each HTML)
- **JavaScript (ES6+)**: Client-side logic and Supabase REST client
- **Lucide Icons**: Professional SVG icon library (CDN)

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for API server
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

### Database & External Services
- **Supabase**: PostgreSQL database and REST API
  - Tables: vehicles, vehicle_categories, vehicle_rates, locations, reservations_open
- **HQ Rentals API**: External booking platform (iframe integration)
- **Google Maps**: Location embeds

## Setup

### Frontend (Static Files)
1. Clone or download this project
2. Open `index.html` in a web browser
3. No build process required - works directly in the browser

### Backend (API Server)
1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Configure environment variables in `backend/.env`:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - JWT_SECRET
4. Start server: `npm start` or `npm run dev`
5. Server runs on `http://localhost:3000`

### HQ Rentals Sync Script
1. Ensure backend `.env` has HQ Rentals credentials
2. Run: `node sync-hq.js all` (sync all modules)
3. Or run individual modules: `node sync-hq.js vehicles`, `node sync-hq.js categories`, etc.

## File Descriptions

### HTML Files

#### `index.html`
Main landing page with:
- Inline CSS styling (dark/light theme support)
- Booking form with location, date, and time selection
- Live fleet counters from Supabase
- Banner carousel with city images (Miami, Charlotte, Nashville)
- Inline JavaScript for i18n, carousel, and form validation
- Navigation to fleet, booking, contact, login, and terms pages

#### `fleet.html`
Dynamic fleet catalog with:
- Inline CSS styling
- Vehicle cards rendered from Supabase data
- Location filters (All, Miami, Charlotte, Nashville)
- Fleet statistics banner (total, sedan, SUV, van counts)
- Inline JavaScript for Supabase queries and rendering
- Integration with `js/supabase-client.js`

#### `booking.html`
HQ Rentals iframe integration with:
- Inline CSS styling
- Dynamic iframe URL construction from URL parameters
- Theme switching
- Redirects to HQ Rentals booking system

#### `contact.html`
Contact information page with:
- Inline CSS styling
- Branch information (Miami, Charlotte, Nashville)
- Contact form (frontend-only, no backend integration)
- FAQ accordion
- Google Maps embeds for each location
- Inline i18n and theme switching

#### `login.html`
Admin authentication page with:
- Inline CSS styling
- Login form (email/password)
- POST to backend `/api/v1/auth/login`
- JWT token storage in localStorage
- Redirect to `admin-panel.html` on success
- Supabase SDK CDN and `js/supabase-client.js`

#### `admin-panel.html`
Administrative dashboard with:
- Inline CSS styling (glassmorphism design)
- Dashboard with fleet stats and HQ reservation summary
- Sync modules for HQ Rentals integration
- Location management
- HQ reservations viewer
- Integration with `js/supabase-client.js` (as module)
- API calls to backend `http://localhost:3000/api/v1`

#### `terms.html`
Terms and conditions page with:
- Inline CSS styling
- Static content with anchor navigation
- Table of contents with active tracking
- Back-to-top button
- Inline i18n and theme switching

### JavaScript Files

#### `js/supabase-client.js` (CRITICAL)
Supabase REST client that exposes `window.HpowerSupabase`:
- `supabaseQuery(table, params)` - Generic REST query helper
- `getAvailableCountByLocation()` - Fleet availability by location
- `getVehiclesByLocation(locationId)` - Vehicles grouped by category
- `getLocations()` - All locations
- `getCategories()` - All vehicle categories
- `getFleetStats(locationId)` - Fleet statistics (total, sedan, SUV, van)
- Used by: index.html, fleet.html, admin-panel.html

#### `js/main.js`
Entry point that initializes Lucide icons when DOM is ready.

#### `js/i18n.js` (NOT USED)
Internationalization module (ES/EN). Logic is duplicated inline in each HTML file instead.

#### `js/carousel.js` (NOT USED)
Banner carousel logic. Functionality is duplicated inline in index.html instead.

#### `js/booking.js` (NOT USED)
Booking form logic. Functionality is duplicated inline in index.html instead.

### Backend Structure

#### `backend/src/server.js`
Express.js server entry point with:
- CORS middleware
- Memory usage monitoring
- Route registration for auth, categories, vehicles, pricing, reservations, admin, sync
- Port 3000

#### `backend/src/routes/`
API route definitions:
- `auth.routes.js` - Authentication endpoints
- `categories.routes.js` - Vehicle categories
- `vehicles.routes.js` - Fleet management
- `pricing.routes.js` - Rates and pricing
- `reservations.routes.js` - Reservation management
- `publicBooking.routes.js` - Public booking API
- `admin.routes.js` - Admin endpoints
- `sync.routes.js` - HQ Rentals sync
- `hqRoutes.js` - HQ Rentals integration

#### `backend/src/controllers/`
Business logic for routes.

#### `backend/src/middlewares/`
Express middleware (auth, validation).

### Sync Scripts

#### `sync-hq.js`
Independent Node.js script for HQ Rentals synchronization:
- Syncs: locations, categories, vehicles, seasons, rates, charges, reservations
- Reads credentials from `backend/.env`
- Can run full sync or individual modules
- Can be automated with cron/PM2

## Customization

### Adding New Languages
Since i18n is duplicated inline in each HTML file, you need to add translations to the `translations` object in each HTML file's script section. The `js/i18n.js` file exists but is not currently used.

### Modifying Styles
All styles are inline in each HTML file within `<style>` tags. CSS variables are defined in `:root` for easy theming. There is no separate `css/styles.css` file.

### Adding New Cities
1. Add the city to the location select options in `index.html` and `booking.html`
2. Update the `LOCATION_MAP` in `js/supabase-client.js` with the new location ID
3. Add banner images to the carousel in `index.html`
4. Update Google Maps embeds in `contact.html` if needed

### Modifying Supabase Configuration
Edit `js/supabase-client.js` to update:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `LOCATION_MAP`
- `LOCATION_IDS`

### Backend Configuration
Edit `backend/.env` to configure:
- Supabase credentials
- JWT secret
- HQ Rentals API credentials

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Critical Dependencies

The following dependencies are critical for system operation:

1. **Supabase Database** - Primary database for vehicles, categories, rates, locations, and reservations
   - URL: `https://xtvopaehirznzeyuanwc.supabase.co`
   - Failure: No fleet counters, no dynamic fleet catalog

2. **js/supabase-client.js** - REST client for Supabase
   - Failure: No connection to Supabase database

3. **Backend API (localhost:3000)** - Admin authentication and dashboard
   - Failure: No admin login, no dashboard functionality

4. **HQ Rentals API** - External booking system
   - URL: `https://horsepower-car-rental-staging.us4.hqrentals.app`
   - Failure: No booking process

## Known Issues

- **Code Duplication**: i18n, carousel, and booking logic are duplicated inline in HTML files instead of using the modular JS files (`js/i18n.js`, `js/carousel.js`, `js/booking.js`)
- **login.html**: Loads Supabase SDK CDN in addition to `js/supabase-client.js` (redundant)
- **admin-panel.html**: Loads `js/supabase-client.js` as ES module while other files load it as regular script
- **Development Server**: Using `npx http-server` without cache disabled causes 1-hour cache blocking. Use `npx http-server -p 8081 -c-1` for development

## Development Notes

- For development with live Supabase data, ensure Row Level Security (RLS) in Supabase allows public SELECT for anon users on: vehicles, locations, vehicle_categories, vehicle_rates
- The sync script `sync-hq.js` can be automated with cron jobs or PM2 for periodic HQ Rentals synchronization
- All HTML files use inline CSS and JavaScript for simplicity, but this creates maintenance overhead

## License

© 2026 Hpower Car Rental. All rights reserved.
