# Aura Quality: AI-Powered Air Quality & Health Advisor

<div align="center">
  <img src="https://storage.googleapis.com/aistudio-ux-team-public/sample_app_icons/aura-quality.svg" alt="Aura Quality Logo" width="120">
</div>

<p align="center">
  <strong>A comprehensive, responsive web application that provides real-time air quality data, personalized health recommendations, and an AI-powered assistant to help users understand and mitigate the effects of air pollution.</strong>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

Aura Quality is a data-rich, single-page application designed to deliver crucial air quality information in an intuitive and actionable format. It combines real-time data visualization, personalized health profiling, and a conversational AI to create a holistic tool for public health awareness.

## ✨ Key Features

*   **🌍 Interactive Air Quality Map:** Visualize real-time Air Quality Index (AQI) data on a dynamic Leaflet map with color-coded, numbered markers. Search for any location worldwide or use geolocation to get data for your current spot.
*   **❤️ Personalized Health Dashboard:** Create a user profile with your age, pre-existing health conditions, and activity level to receive tailored health tips and proactive alerts for poor air quality days. User profiles are saved locally for convenience.
*   **🧠 AI-Powered Chat Assistant:** Ask questions in natural language and get instant, context-aware answers from a Google Gemini-powered chatbot. The assistant leverages Google Search grounding to provide real-time, global AQI data and general knowledge.
*   **📈 Historical Data Trends:** Analyze 30-day historical AQI data with an interactive chart to understand air quality patterns and make informed decisions.
*   **🌪️ Atmospheric Insights:** Get clear, educational explanations for atmospheric phenomena like temperature inversions, stagnant air, and wildfire smoke that affect local air quality.
*   **🚨 Real-Time Safety Alerts:** Stay informed with a prominent global banner that displays public safety alerts for events like high ozone levels or heavy particle pollution.
*   **🗓️ 7-Day Forecast:** View a detailed 7-day AQI forecast to plan your outdoor activities and take necessary precautions.
*   **📱 Fully Responsive:** A clean, modern UI built with Tailwind CSS that works seamlessly on both desktop and mobile devices.

## 🛠️ Tech Stack

*   **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Mapping:** [Leaflet.js](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
*   **Charting:** [Recharts](https://recharts.org/)
*   **AI & Geocoding:**
    *   **[Google Gemini API](https://ai.google.dev/):** Powers the intelligent chatbot (`gemini-2.5-flash` model) with search grounding capabilities.
    *   **[OpenStreetMap Nominatim API](https://nominatim.org/):** Used for robust geocoding (search) and reverse geocoding (map clicks).
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`) and a custom hook for persisting state to `localStorage`.
*   **Data Source:** A mock data service (`airQualityService.ts`) that simulates a real-world AQI API, providing realistic and dynamic data for development and demonstration.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm (or yarn) installed on your machine.
*   A Google Gemini API key. You can obtain one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/aura-quality.git
    cd aura-quality
    ```
2.  **Install NPM packages:**
    ```sh
    npm install
    ```
3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add your Google Gemini API key:
    ```
    API_KEY="YOUR_GEMINI_API_KEY"
    ```
    *Note: This project relies on a build setup that makes `process.env.API_KEY` available in the browser. A standard `create-react-app` or Vite setup would require prefixing the variable with `REACT_APP_` or `VITE_` respectively. Adjust as needed for your specific dev environment.*

4.  **Run the development server:**
    ```sh
    npm start
    ```
    The application should now be running on `http://localhost:3000` (or another port depending on your setup).

## 📂 Project Structure

The project is organized into a logical and maintainable structure:

```
/
├── public/
│   └── index.html      # Main HTML file
├── src/
│   ├── components/     # Reusable React components (Map, Sidebar, Chatbot, etc.)
│   ├── hooks/          # Custom React hooks (e.g., useLocalStorage)
│   ├── services/       # API interaction and data fetching logic
│   ├── App.tsx         # Main application component and layout
│   ├── index.tsx       # Application entry point
│   ├── constants.ts    # App-wide constants (AQI categories)
│   └── types.ts        # TypeScript type definitions
├── .env                # Environment variables (API keys)
└── package.json        # Project dependencies and scripts
```

---

Built with a focus on great UI/UX, modern development practices, and powerful AI integration.
