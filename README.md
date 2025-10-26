# Aura Quality - Full-Stack AI-Powered Air Quality & Health Advisor

<div align="center">
  <img src="https://storage.googleapis.com/aistudio-ux-team-public/sample_app_icons/aura-quality.svg" alt="Aura Quality Logo" width="120">
</div>

<p align="center">
  <strong>A comprehensive full-stack web application providing real-time air quality data, personalized health recommendations, and AI-powered assistance using Cloudflare Workers, Hono, and D1 Database</strong>
</p>

## 🌟 Project Overview

**Aura Quality** has been transformed into a production-ready full-stack application with:
- **Backend**: Hono framework running on Cloudflare Workers
- **Frontend**: React 19 with TypeScript
- **Database**: Cloudflare D1 (SQLite) for user profiles and AQI history
- **AI**: Google Gemini API for intelligent chat assistance
- **Deployment**: Cloudflare Pages for edge-optimized global delivery

## 🚀 Live URLs

- **Development Server**: https://3000-iysmgzhzxulltpd8rxnmm-5185f4aa.sandbox.novita.ai
- **API Health Check**: https://3000-iysmgzhzxulltpd8rxnmm-5185f4aa.sandbox.novita.ai/api/aqi/current?lat=34&lng=-118
- **GitHub Repository**: https://github.com/clevernat/Aura-Quality

## ✨ Key Features

### Frontend Features
- 🌍 **Interactive Air Quality Map** - Leaflet.js map with real-time AQI markers
- ❤️ **Personalized Health Dashboard** - Custom profiles with health conditions
- 📈 **Historical Data Trends** - 30-day AQI history with interactive charts
- 🗓️ **7-Day Forecast** - Plan outdoor activities with AQI predictions
- 🌪️ **Atmospheric Insights** - Educational explanations for air quality phenomena
- 🚨 **Real-Time Safety Alerts** - Prominent warnings for poor air quality
- 📱 **Fully Responsive** - Beautiful UI with TailwindCSS

### Backend Features (NEW)
- 🔐 **User Profile Management** - Save age, health conditions, activity level
- 📍 **Saved Locations** - Store and retrieve favorite locations
- 📊 **AQI History Tracking** - Persistent storage of historical air quality data
- 🤖 **AI Chat API** - Gemini-powered intelligent responses
- 🔄 **Real-time Data Proxy** - Backend API for AQI data fetching
- 💾 **D1 Database** - Fast, distributed SQLite database

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Leaflet.js** - Interactive maps
- **Recharts** - Data visualization
- **Google Gemini API** - AI chat assistance

### Backend
- **Hono** - Ultra-fast web framework for Cloudflare Workers
- **Cloudflare Workers** - Edge computing platform
- **Cloudflare D1** - Distributed SQLite database
- **Wrangler** - Development and deployment CLI
- **TypeScript** - End-to-end type safety

## 📂 Project Structure

```
aura-quality-fullstack/
├── components/           # React components (Map, Sidebar, Chatbot, etc.)
├── hooks/                # Custom React hooks (useLocalStorage)
├── services/             # API interaction and data fetching
├── functions/            # Hono backend API routes
│   └── [[route]].ts      # Catch-all API handler
├── migrations/           # D1 database migrations
│   └── 0001_initial_schema.sql
├── public/               # Static assets
├── dist/                 # Build output (Cloudflare Pages)
├── App.tsx               # Main React application
├── index.tsx             # React entry point
├── index.html            # HTML template
├── wrangler.jsonc        # Cloudflare configuration
├── vite.config.ts        # Vite build configuration
├── ecosystem.config.cjs  # PM2 process manager config
└── seed.sql              # Test data for development
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  age_group TEXT,
  health_conditions TEXT,
  activity_level TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Saved Locations Table
```sql
CREATE TABLE saved_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### AQI History Table
```sql
CREATE TABLE aqi_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  aqi INTEGER NOT NULL,
  category TEXT NOT NULL,
  primary_pollutant TEXT,
  pollutants TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### User Management
- `GET /api/users/:userId/profile` - Get user profile
- `POST /api/users/:userId/profile` - Create/update user profile

### Saved Locations
- `GET /api/users/:userId/locations` - Get saved locations
- `POST /api/users/:userId/locations` - Add saved location
- `DELETE /api/users/:userId/locations/:locationId` - Delete location

### AQI Data
- `GET /api/aqi/current?lat={lat}&lng={lng}&location={name}` - Get current AQI
- `POST /api/aqi/history` - Save AQI data to history
- `GET /api/aqi/history?location={name}&days={days}` - Get historical AQI

### AI Chat
- `POST /api/chat` - Chat with Gemini AI assistant
  ```json
  {
    "message": "What's the AQI in Los Angeles?",
    "context": "User is viewing Los Angeles data"
  }
  ```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Cloudflare account (for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/clevernat/Aura-Quality.git
   cd Aura-Quality
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.dev.vars` file in project root:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   OPENWEATHERMAP_API_KEY=optional-api-key
   IQAIR_API_KEY=optional-api-key
   ```

4. **Initialize local database**
   ```bash
   npm run db:migrate:local
   npm run db:seed
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start development server**
   ```bash
   npm run dev:sandbox
   ```

   Or with PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/*

## 📦 Available Scripts

```bash
npm run dev              # Start Vite dev server
npm run dev:sandbox      # Start Wrangler Pages dev with D1
npm run build            # Build for production
npm run preview          # Preview production build
npm run deploy           # Deploy to Cloudflare Pages
npm run clean-port       # Kill process on port 3000
npm run test             # Test local server

# Database commands
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:prod  # Apply migrations to production
npm run db:seed          # Seed local database
npm run db:reset         # Reset local database
npm run db:console:local # Open local D1 console
npm run db:console:prod  # Open production D1 console

# Git commands
npm run git:init         # Commit all changes
npm run git:status       # Check git status
npm run git:log          # View git log
```

## 🌐 Deployment to Cloudflare Pages

### Step 1: Create Production D1 Database
```bash
npx wrangler d1 create aura-quality-db
```

Copy the `database_id` from output and update `wrangler.jsonc`:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "aura-quality-db",
      "database_id": "your-actual-database-id-here"
    }
  ]
}
```

### Step 2: Apply Migrations to Production
```bash
npm run db:migrate:prod
```

### Step 3: Set Environment Secrets
```bash
npx wrangler pages secret put GEMINI_API_KEY --project-name aura-quality
npx wrangler pages secret put OPENWEATHERMAP_API_KEY --project-name aura-quality
npx wrangler pages secret put IQAIR_API_KEY --project-name aura-quality
```

### Step 4: Deploy
```bash
npm run deploy
```

Your app will be available at:
- Production: `https://aura-quality.pages.dev`
- Branch: `https://main.aura-quality.pages.dev`

## 🔑 Environment Variables

### Required
- `GEMINI_API_KEY` - Google Gemini API key for AI chat

### Optional (for real AQI data)
- `OPENWEATHERMAP_API_KEY` - OpenWeatherMap API key
- `IQAIR_API_KEY` - IQAir API key

## 🧪 Testing the API

```bash
# Test AQI endpoint
curl "http://localhost:3000/api/aqi/current?lat=34.0522&lng=-118.2437&location=Los%20Angeles"

# Test user profile
curl -X POST http://localhost:3000/api/users/demo-user-1/profile \
  -H "Content-Type: application/json" \
  -d '{"age_group":"Adults (18-64)","health_conditions":"None","activity_level":"Moderate (some outdoor activity)"}'

# Test saved locations
curl http://localhost:3000/api/users/demo-user-1/locations

# Test AI chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What should I do if AQI is 150?","context":"User has asthma"}'
```

## 📈 Currently Completed Features

✅ Full-stack architecture with Hono backend  
✅ Cloudflare D1 database integration  
✅ User profile management API  
✅ Saved locations functionality  
✅ AQI history tracking  
✅ AI chat with Gemini API  
✅ Interactive map with real-time data  
✅ Responsive UI with TailwindCSS  
✅ Historical data visualization  
✅ 7-day AQI forecast  
✅ Health recommendations based on user profile  
✅ PM2 process management  
✅ Local development environment  

## 🚧 Features Not Yet Implemented

⏳ Real-time AQI API integration (currently using mock data)  
⏳ User authentication system (OAuth/JWT)  
⏳ Push notification system for alerts  
⏳ Data export functionality (CSV/JSON)  
⏳ Advanced analytics dashboard  
⏳ Multi-language support  
⏳ Mobile app (React Native)  
⏳ Email alerts for poor air quality  
⏳ Social sharing features  

## 🎯 Recommended Next Steps

1. **Integrate Real AQI API** - Replace mock data with OpenWeatherMap or IQAir API
2. **Add Authentication** - Implement user login with Cloudflare Access or Auth0
3. **Implement Notifications** - Use Cloudflare Durable Objects for real-time alerts
4. **Add Data Export** - Generate CSV/JSON exports of historical data
5. **Enhance AI Features** - Add image analysis for pollution detection
6. **Improve Performance** - Add caching with Cloudflare KV
7. **Add Testing** - Unit tests with Vitest, E2E tests with Playwright
8. **Monitor Usage** - Integrate Cloudflare Analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👥 Authors

- **Original Creator**: clevernat
- **Full-Stack Enhancement**: GenSpark AI Assistant

## 🙏 Acknowledgments

- Google Gemini API for AI assistance
- Cloudflare for edge computing infrastructure
- OpenStreetMap for geocoding services
- Leaflet.js for mapping functionality
- React and Hono communities for excellent tools

---

**Built with ❤️ using modern web technologies and AI assistance**
