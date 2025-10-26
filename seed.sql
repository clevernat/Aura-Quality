-- Insert test users
INSERT OR IGNORE INTO users (user_id, age_group, health_conditions, activity_level) VALUES 
  ('demo-user-1', 'Adults (18-64)', 'None', 'Moderate (some outdoor activity)'),
  ('demo-user-2', 'Seniors (65+)', 'Asthma,COPD', 'Low (mostly indoors)'),
  ('demo-user-3', 'Children (0-17)', 'Asthma', 'High (regular outdoor exercise)');

-- Insert test saved locations
INSERT OR IGNORE INTO saved_locations (user_id, location_name, latitude, longitude) VALUES 
  ('demo-user-1', 'Los Angeles, CA', 34.0522, -118.2437),
  ('demo-user-1', 'New York, NY', 40.7128, -74.0060),
  ('demo-user-2', 'San Francisco, CA', 37.7749, -122.4194),
  ('demo-user-3', 'Chicago, IL', 41.8781, -87.6298);

-- Insert sample AQI history data
INSERT OR IGNORE INTO aqi_history (location_name, latitude, longitude, aqi, category, primary_pollutant, pollutants) VALUES 
  ('Los Angeles, CA', 34.0522, -118.2437, 85, 'Moderate', 'PM2.5', '[]'),
  ('New York, NY', 40.7128, -74.0060, 45, 'Good', 'PM2.5', '[]'),
  ('San Francisco, CA', 37.7749, -122.4194, 52, 'Moderate', 'O3', '[]');
