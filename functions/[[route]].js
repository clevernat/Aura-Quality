import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for API routes
app.use('/api/*', cors());

// ============================================
// API ROUTES - User Management
// ============================================

// Get user profile by user_id
app.get('/api/users/:userId/profile', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');

  try {
    const result = await DB.prepare(
      'SELECT * FROM users WHERE user_id = ?'
    ).bind(userId).first();

    if (!result) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(result);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

// Create or update user profile
app.post('/api/users/:userId/profile', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');
  const body = await c.req.json();
  const { age_group, health_conditions, activity_level } = body;

  try {
    await DB.prepare(`
      INSERT INTO users (user_id, age_group, health_conditions, activity_level, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) 
      DO UPDATE SET 
        age_group = excluded.age_group,
        health_conditions = excluded.health_conditions,
        activity_level = excluded.activity_level,
        updated_at = datetime('now')
    `).bind(userId, age_group, health_conditions || '', activity_level).run();

    return c.json({ success: true, message: 'Profile saved' });
  } catch (error) {
    console.error('Error saving user profile:', error);
    return c.json({ error: 'Failed to save profile' }, 500);
  }
});

// ============================================
// API ROUTES - Saved Locations
// ============================================

// Get user's saved locations
app.get('/api/users/:userId/locations', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');

  try {
    const { results } = await DB.prepare(
      'SELECT * FROM saved_locations WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return c.json(results || []);
  } catch (error) {
    console.error('Error fetching saved locations:', error);
    return c.json({ error: 'Failed to fetch locations' }, 500);
  }
});

// Add a saved location
app.post('/api/users/:userId/locations', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');
  const body = await c.req.json();
  const { location_name, latitude, longitude } = body;

  try {
    const result = await DB.prepare(`
      INSERT INTO saved_locations (user_id, location_name, latitude, longitude)
      VALUES (?, ?, ?, ?)
    `).bind(userId, location_name, latitude, longitude).run();

    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Location saved' 
    });
  } catch (error) {
    console.error('Error saving location:', error);
    return c.json({ error: 'Failed to save location' }, 500);
  }
});

// Delete a saved location
app.delete('/api/users/:userId/locations/:locationId', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');
  const locationId = c.req.param('locationId');

  try {
    await DB.prepare(
      'DELETE FROM saved_locations WHERE id = ? AND user_id = ?'
    ).bind(locationId, userId).run();

    return c.json({ success: true, message: 'Location deleted' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return c.json({ error: 'Failed to delete location' }, 500);
  }
});

// ============================================
// API ROUTES - AQI Data History
// ============================================

// Save AQI data to history
app.post('/api/aqi/history', async (c) => {
  const { DB } = c.env;
  const body = await c.req.json();
  const { location_name, latitude, longitude, aqi, category, primary_pollutant, pollutants } = body;

  try {
    await DB.prepare(`
      INSERT INTO aqi_history 
      (location_name, latitude, longitude, aqi, category, primary_pollutant, pollutants)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      location_name,
      latitude,
      longitude,
      aqi,
      category,
      primary_pollutant,
      JSON.stringify(pollutants)
    ).run();

    return c.json({ success: true, message: 'AQI data saved' });
  } catch (error) {
    console.error('Error saving AQI history:', error);
    return c.json({ error: 'Failed to save AQI data' }, 500);
  }
});

// Get AQI history for a location
app.get('/api/aqi/history', async (c) => {
  const { DB } = c.env;
  const location = c.req.query('location');
  const days = parseInt(c.req.query('days') || '30');

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM aqi_history 
      WHERE location_name LIKE ?
      AND timestamp >= datetime('now', '-' || ? || ' days')
      ORDER BY timestamp DESC
      LIMIT 100
    `).bind(`%${location}%`, days).all();

    return c.json(results || []);
  } catch (error) {
    console.error('Error fetching AQI history:', error);
    return c.json({ error: 'Failed to fetch AQI history' }, 500);
  }
});

// ============================================
// API ROUTES - Real-time AQI Data (Proxy)
// ============================================

// Get AQI data from external API
app.get('/api/aqi/current', async (c) => {
  const lat = c.req.query('lat');
  const lng = c.req.query('lng');
  const location = c.req.query('location');

  if (!lat || !lng) {
    return c.json({ error: 'Latitude and longitude required' }, 400);
  }

  // For now, return mock data
  const mockData = generateMockAQIData(parseFloat(lat), parseFloat(lng), location || 'Unknown');
  
  return c.json(mockData);
});

// ============================================
// API ROUTES - AI Chat with Gemini
// ============================================

app.post('/api/chat', async (c) => {
  const { GEMINI_API_KEY } = c.env;
  const body = await c.req.json();
  const { message, context } = body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Context: ${context}\n\nUser question: ${message}`
            }]
          }],
          systemInstruction: {
            parts: [{
              text: 'You are a helpful Air Quality and Health Assistant for Aura Quality app. Provide concise, accurate information about air quality and health impacts.'
            }]
          }
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that.';

    return c.json({ reply });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return c.json({ error: 'Failed to get response from AI' }, 500);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateMockAQIData(lat, lng, locationName) {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const aqi = random(10, 350);
  
  let category = 'Good';
  let color = 'green';
  
  if (aqi > 300) {
    category = 'Hazardous';
    color = 'maroon';
  } else if (aqi > 200) {
    category = 'Very Unhealthy';
    color = 'purple';
  } else if (aqi > 150) {
    category = 'Unhealthy';
    color = 'red';
  } else if (aqi > 100) {
    category = 'Unhealthy for Sensitive Groups';
    color = 'orange';
  } else if (aqi > 50) {
    category = 'Moderate';
    color = 'yellow';
  }

  return {
    locationName,
    lat,
    lng,
    current: {
      aqi,
      category,
      color,
      primaryPollutant: 'PM2.5',
      pollutants: [
        { name: 'PM2.5', value: random(0, 50), unit: 'µg/m³' },
        { name: 'PM10', value: random(0, 100), unit: 'µg/m³' },
        { name: 'O3', value: random(0, 80), unit: 'ppb' },
        { name: 'NO2', value: random(0, 40), unit: 'ppb' },
        { name: 'SO2', value: random(0, 20), unit: 'ppb' },
        { name: 'CO', value: random(0, 10), unit: 'ppm' },
      ]
    },
    forecast: Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
      aqi: Math.max(10, aqi + random(-30, 30)),
    })),
    historical: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      aqi: Math.max(10, aqi + random(-50, 50)),
    })),
    phenomenon: {
      key: 'seasonal',
      title: 'Seasonal Ozone',
      explanation: 'Warm temperatures and sunlight are reacting with pollutants to form ground-level ozone.'
    },
    alerts: aqi > 150 ? [{
      type: 'Particle Pollution',
      severity: 'High',
      message: 'High levels of particle pollution detected. Reduce outdoor exposure.'
    }] : []
  };
}

// Export for Cloudflare Pages Functions
export function onRequest(context) {
  return app.fetch(context.request, context.env, context);
}
