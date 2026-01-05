<template>
  <div class="weather-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      Loading weather data...
    </div>

    <!-- Error state -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Weather data display -->
    <div v-if="weatherData" class="weather-card">
      <!-- Location and basic info -->
      <div class="weather-header">
        <h2>{{ weatherData.name }}, {{ weatherData.sys.country }}</h2>
        <div class="current-temp">
          <span class="temp-value">{{ Math.round(weatherData.main.temp) }}</span>
          <span class="temp-unit">°C</span>
        </div>
        <div class="weather-description">
          <img 
            :src="`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`" 
            :alt="weatherData.weather[0].description"
            class="weather-icon"
          />
          <span class="description-text">{{ capitalizeFirst(weatherData.weather[0].description) }}</span>
        </div>
      </div>

      <!-- Weather details -->
      <div class="weather-details">
        <div class="detail-item">
          <span class="detail-label">Feels Like</span>
          <span class="detail-value">{{ Math.round(weatherData.main.feels_like) }}°C</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Humidity</span>
          <span class="detail-value">{{ weatherData.main.humidity }}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Wind Speed</span>
          <span class="detail-value">{{ Math.round(weatherData.wind.speed * 3.6) }} km/h</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Pressure</span>
          <span class="detail-value">{{ weatherData.main.pressure }} hPa</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Visibility</span>
          <span class="detail-value">{{ (weatherData.visibility / 1000).toFixed(1) }} km</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Sunrise</span>
          <span class="detail-value">{{ formatTime(weatherData.sys.sunrise) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Sunset</span>
          <span class="detail-value">{{ formatTime(weatherData.sys.sunset) }}</span>
        </div>
      </div>

      <!-- Temperature range -->
      <div class="temperature-range">
        <div class="temp-min">
          <span class="range-label">Min</span>
          <span class="range-value">{{ Math.round(weatherData.main.temp_min) }}°C</span>
        </div>
        <div class="temp-bar">
          <div class="temp-progress" :style="tempRangeStyle"></div>
        </div>
        <div class="temp-max">
          <span class="range-label">Max</span>
          <span class="range-value">{{ Math.round(weatherData.main.temp_max) }}°C</span>
        </div>
      </div>
    </div>

    <!-- Refresh button -->
    <!-- <button @click="fetchWeatherData" class="refresh-btn" :disabled="loading">
      {{ loading ? 'Refreshing...' : 'Refresh Weather' }}
    </button> -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Coordinates for Beirut, Lebanon (you can change to other Lebanese cities)
const LEBANON_COORDS = {
  lat: 33.8938, // Beirut latitude
  lon: 35.5018  // Beirut longitude
}

const API_KEY = '5408a1b07f159206390e3ffcd506319e' // Your API key
const weatherData = ref(null)
const loading = ref(false)
const error = ref(null)

// Fetch weather data
const fetchWeatherData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LEBANON_COORDS.lat}&lon=${LEBANON_COORDS.lon}&appid=${API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    weatherData.value = data
  } catch (err) {
    error.value = `Failed to fetch weather data: ${err.message}`
    console.error('Error fetching weather:', err)
  } finally {
    loading.value = false
  }
}

// Format time from timestamp
const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Capitalize first letter of weather description
const capitalizeFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Temperature range visualization
const tempRangeStyle = computed(() => {
  if (!weatherData.value) return { width: '0%' }
  
  const min = weatherData.value.main.temp_min
  const max = weatherData.value.main.temp_max
  const current = weatherData.value.main.temp
  
  // Calculate percentage for visualization
  const range = max - min
  const position = ((current - min) / range) * 100
    
  return {
    width: `${position}%`
  }
})

// Fetch data when component mounts
onMounted(() => {
  fetchWeatherData()
})
</script>

<style scoped>
.weather-container {
  max-width: 600px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 20px;
}

.weather-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.weather-header {
  text-align: center;
  margin-bottom: 30px;
}

.weather-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.current-temp {
  font-size: 72px;
  font-weight: 300;
  line-height: 1;
  margin: 20px 0;
}

.temp-value {
  font-weight: 700;
}

.temp-unit {
  font-size: 48px;
  vertical-align: super;
  opacity: 0.9;
}

.weather-description {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.weather-icon {
  width: 60px;
  height: 60px;
}

.description-text {
  font-size: 18px;
  font-weight: 500;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 30px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  opacity: 0.9;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
}

.temperature-range {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 25px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.temp-min, .temp-max {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.range-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.range-value {
  font-size: 18px;
  font-weight: 600;
}

.temp-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.temp-progress {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.refresh-btn {
  display: block;
  width: 100%;
  padding: 15px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.refresh-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Responsive design */
@media (max-width: 600px) {
  .weather-container {
    padding: 10px;
  }
  
  .weather-card {
    padding: 20px;
  }
  
  .current-temp {
    font-size: 56px;
  }
  
  .weather-details {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .temp-bar {
    width: 80%;
    margin: 0 auto;
  }
}
</style>