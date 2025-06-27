// Weather Dashboard JavaScript
class WeatherApp {
    constructor() {
        this.apiKey = '3e3be2960984da7f8392ca0138205dba'; // Replace with your actual API key
        this.apiUrl = 'https://api.openweathermap.org/data/2.5';
        this.currentUnit = 'celsius';
        this.currentWeatherData = null;
        this.currentForecastData = null;
        this.theme = 'light';
        this.recentSearches = [];
        this.currentTimeInterval = null;
        this.currentTimezone = null;
        this.init();
    }

    init() {
        this.loadTheme();
        this.bindEvents();
        this.loadRecentSearches();
        this.loadDefaultWeather();
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const locationBtn = document.getElementById('locationBtn');
        const cityInput = document.getElementById('cityInput');

        searchBtn.addEventListener('click', () => this.searchWeather());
        locationBtn.addEventListener('click', () => this.getCurrentLocation());
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });

        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        const celsiusBtn = document.getElementById('celsiusBtn');
        const fahrenheitBtn = document.getElementById('fahrenheitBtn');

        celsiusBtn.addEventListener('click', () => this.switchTemperatureUnit('celsius'));
        fahrenheitBtn.addEventListener('click', () => this.switchTemperatureUnit('fahrenheit'));
    }

    // Theme Management
    loadTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon(this.theme);
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon(this.theme);
    }

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Temperature Unit Management
    switchTemperatureUnit(unit) {
        if (this.currentUnit === unit) return;
        this.currentUnit = unit;
        
        const celsiusBtn = document.getElementById('celsiusBtn');
        const fahrenheitBtn = document.getElementById('fahrenheitBtn');
        
        // Remove active class from both buttons first
        celsiusBtn.classList.remove('active');
        fahrenheitBtn.classList.remove('active');
        
        // Add active class to selected button
        if (unit === 'celsius') {
            celsiusBtn.classList.add('active');
        } else {
            fahrenheitBtn.classList.add('active');
        }
        
        // Update display with new units
        if (this.currentWeatherData) {
            this.updateCurrentWeather(this.currentWeatherData);
        }
        if (this.currentForecastData) {
            this.updateForecast(this.currentForecastData);
        }
    }
    convertTemperature(celsius) {
        if (this.currentUnit === 'fahrenheit') {
            return Math.round((celsius * 9/5) + 32);
        }
        return Math.round(celsius);
    }

    getTemperatureUnit() {
        return this.currentUnit === 'celsius' ? '°C' : '°F';
    }

    // Recent Searches Management
    loadRecentSearches() {
        if (this.recentSearches.length > 0) {
            this.displayRecentSearches(this.recentSearches);
        }
    }

    saveRecentSearch(cityName) {
        this.recentSearches = this.recentSearches.filter(city => 
            city.toLowerCase() !== cityName.toLowerCase()
        );
        
        this.recentSearches.unshift(cityName);
        this.recentSearches = this.recentSearches.slice(0, 5);
        
        this.displayRecentSearches(this.recentSearches);
    }

    displayRecentSearches(searches) {
        const recentSearchesDiv = document.getElementById('recentSearches');
        const recentList = document.getElementById('recentList');

        if (searches.length === 0) {
            recentSearchesDiv.style.display = 'none';
            return;
        }

        recentList.innerHTML = '';
        searches.forEach(city => {
            const button = document.createElement('button');
            button.className = 'recent-item';
            button.textContent = city;
            button.addEventListener('click', () => {
                document.getElementById('cityInput').value = city;
                this.searchWeather();
            });
            recentList.appendChild(button);
        });

        recentSearchesDiv.style.display = 'block';
    }

    // Real API calls
    async fetchWeatherData(city) {
        const response = await fetch(
            `${this.apiUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error(`Failed to get weather data for ${city}`);
            }
        }
        
        return await response.json();
    }

    async fetchForecastData(city) {
        const response = await fetch(
            `${this.apiUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Forecast data not available for "${city}"`);
            } else {
                throw new Error(`Failed to get forecast data for ${city}`);
            }
        }
        
        return await response.json();
    }

    async fetchWeatherByCoords(lat, lon) {
        const response = await fetch(
            `${this.apiUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Unable to get weather data for your location');
        }
        
        return await response.json();
    }

    async fetchForecastByCoords(lat, lon) {
        const response = await fetch(
           `${this.apiUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Unable to get forecast data for your location');
        }
        
        return await response.json();
    }

    // Load default weather (New York)
    loadDefaultWeather() {
        this.searchSpecificCity('New York');
    }

    // Search for weather
    async searchWeather() {
        const city = document.getElementById('cityInput').value.trim();
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        await this.searchSpecificCity(city);
        document.getElementById('cityInput').value = '';
    }

    async searchSpecificCity(city) {
        this.showLoading();
        this.hideError();

        try {
            const weatherData = await this.fetchWeatherData(city);
            const forecastData = await this.fetchForecastData(city);
            
            this.processWeatherData(weatherData);
            this.processForecastData(forecastData);
            this.saveRecentSearch(weatherData.name);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.showLoading();
        this.hideError();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    const weatherData = await this.fetchWeatherByCoords(latitude, longitude);
                    const forecastData = await this.fetchForecastByCoords(latitude, longitude);
                    
                    this.processWeatherData(weatherData);
                    this.processForecastData(forecastData);
                    
                } catch (error) {
                    this.showError(error.message);
                } finally {
                    this.hideLoading();
                }
            },
            (error) => {
                this.hideLoading();
                let errorMessage = 'Unable to get your location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location access denied.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Unknown error occurred.';
                        break;
                }
                this.showError(errorMessage);
            }
        );
    }

    // Process real API data
    processWeatherData(data) {
        this.currentWeatherData = {
            name: data.name,
            country: data.sys.country,
            temp: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            wind_speed: data.wind.speed * 3.6, // Convert m/s to km/h
            pressure: data.main.pressure,
            sunrise: this.formatTime(data.sys.sunrise),
            sunset: this.formatTime(data.sys.sunset),
            visibility: data.visibility / 1000, // Convert meters to km
            clouds: data.clouds.all
        };

        // Set timezone for current time updates
        this.currentTimezone = this.getTimezoneFromCoords(data.coord.lat, data.coord.lon);
        
        this.updateCurrentWeather(this.currentWeatherData);
        this.startTimeUpdates();
    }

    processForecastData(data) {
        const forecastList = [];
        const dailyData = {};

        // Group forecast data by date (taking one forecast per day, preferably around noon)
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            const hour = date.getHours();
            
            // Prefer forecasts around noon (12:00) for daily representation
            if (!dailyData[dateKey] || Math.abs(hour - 12) < Math.abs(dailyData[dateKey].hour - 12)) {
                dailyData[dateKey] = {
                    temp: item.main.temp,
                    weather: item.weather[0],
                    date: item.dt,
                    hour: hour
                };
            }
        });

        // Create forecast array (skip today, take next 5 days)
        const dates = Object.keys(dailyData).slice(1, 6);
        dates.forEach((dateKey, index) => {
            const day = dailyData[dateKey];
            const date = new Date(day.date * 1000);
            
            forecastList.push({
                day: index === 0 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' }),
                temp: day.temp,
                description: day.weather.description,
                icon: day.weather.icon
            });
        });

        this.currentForecastData = forecastList;
        this.updateForecast(this.currentForecastData);
    }

    // UI Update methods
    updateCurrentWeather(data) {
        document.getElementById('cityName').textContent = `${data.name}, ${data.country}`;
        document.getElementById('weatherIcon').textContent = this.getWeatherEmoji(data.icon);
        document.getElementById('temperature').textContent = `${this.convertTemperature(data.temp)}${this.getTemperatureUnit()}`;
        document.getElementById('description').textContent = data.description;
        document.getElementById('feelsLike').textContent = `${this.convertTemperature(data.feels_like)}${this.getTemperatureUnit()}`;
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('windSpeed').textContent = `${Math.round(data.wind_speed)} km/h`;
        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        document.getElementById('sunrise').textContent = data.sunrise;
        document.getElementById('sunset').textContent = data.sunset;
        document.getElementById('visibility').textContent = `${data.visibility} km`;
        document.getElementById('clouds').textContent = `${data.clouds}%`;
    }

    updateForecast(forecastData) {
        const forecastGrid = document.getElementById('forecastGrid');
        forecastGrid.innerHTML = '';

        forecastData.forEach(forecast => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${forecast.day}</div>
                <div class="forecast-icon">${this.getWeatherEmoji(forecast.icon)}</div>
                <div class="forecast-temp">${this.convertTemperature(forecast.temp)}${this.getTemperatureUnit()}</div>
                <div class="forecast-desc">${forecast.description}</div>
            `;
            forecastGrid.appendChild(forecastItem);
        });
    }

    // Utility methods
    getWeatherEmoji(iconCode) {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return iconMap[iconCode] || '☀️';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        
        // Get city's local time using the detected timezone
        const cityTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: this.currentTimezone || 'UTC'
        });
        
        // Get IST time
        const istTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
        
        // Check if city time is same as IST (for Indian locations)
        // This handles all Indian cities regardless of timezone name
        if (cityTime === istTime) {
            return `${cityTime} IST`; // Show IST label for Indian cities
        }
        
        return `${cityTime} (${istTime} IST)`;
    }


    updateCurrentTime() {
        if (!this.currentTimezone) return;
        
        const now = new Date();
        const timeElement = document.getElementById('currentTime');
        
        try {
            const currentTime = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: this.currentTimezone
            });
            
            timeElement.textContent = currentTime;
        } catch (error) {
            // Fallback to UTC if timezone is invalid
            const fallbackTime = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'UTC'
            });
            timeElement.textContent = `${fallbackTime} UTC`;
        }
    }

    startTimeUpdates() {
        // Clear existing interval
        if (this.currentTimeInterval) {
            clearInterval(this.currentTimeInterval);
        }
        
        // Update immediately
        this.updateCurrentTime();
        
        // Update every minute (60000 ms)
        this.currentTimeInterval = setInterval(() => {
            this.updateCurrentTime();
        }, 60000);
    }

    getTimezoneFromCoords(lat, lon) {
        // Improved timezone detection with better coverage
        const timezoneRegions = [
            // North America
            { tz: 'America/New_York', bounds: { minLat: 25, maxLat: 50, minLon: -85, maxLon: -65 } },
            { tz: 'America/Chicago', bounds: { minLat: 25, maxLat: 50, minLon: -105, maxLon: -85 } },
            { tz: 'America/Denver', bounds: { minLat: 25, maxLat: 50, minLon: -115, maxLon: -105 } },
            { tz: 'America/Los_Angeles', bounds: { minLat: 25, maxLat: 50, minLon: -125, maxLon: -115 } },
            
            // Europe
            { tz: 'Europe/London', bounds: { minLat: 49, maxLat: 61, minLon: -8, maxLon: 2 } },
            { tz: 'Europe/Paris', bounds: { minLat: 43, maxLat: 51, minLon: -5, maxLon: 8 } },
            { tz: 'Europe/Berlin', bounds: { minLat: 47, maxLat: 55, minLon: 6, maxLon: 15 } },
            { tz: 'Europe/Rome', bounds: { minLat: 36, maxLat: 47, minLon: 6, maxLon: 19 } },
            { tz: 'Europe/Moscow', bounds: { minLat: 55, maxLat: 68, minLon: 37, maxLon: 42 } },
            
            // Asia
            { tz: 'Asia/Kolkata', bounds: { minLat: 8, maxLat: 37, minLon: 68, maxLon: 97 } },
            { tz: 'Asia/Shanghai', bounds: { minLat: 18, maxLat: 54, minLon: 73, maxLon: 135 } },
            { tz: 'Asia/Tokyo', bounds: { minLat: 24, maxLat: 46, minLon: 129, maxLon: 146 } },
            { tz: 'Asia/Dubai', bounds: { minLat: 22, maxLat: 26, minLon: 51, maxLon: 56 } },
            
            // Australia
            { tz: 'Australia/Sydney', bounds: { minLat: -44, maxLat: -10, minLon: 113, maxLon: 154 } },
            
            // South America
            { tz: 'America/Sao_Paulo', bounds: { minLat: -34, maxLat: 5, minLon: -74, maxLon: -34 } },
            
            // Africa
            { tz: 'Africa/Cairo', bounds: { minLat: 22, maxLat: 32, minLon: 25, maxLon: 35 } },
            { tz: 'Africa/Johannesburg', bounds: { minLat: -35, maxLat: -22, minLon: 16, maxLon: 33 } },
        ];
        
        // Check if coordinates fall within any defined region
        for (const region of timezoneRegions) {
            const { bounds, tz } = region;
            if (lat >= bounds.minLat && lat <= bounds.maxLat && 
                lon >= bounds.minLon && lon <= bounds.maxLon) {
                return tz;
            }
        }
        
        // Fallback: rough timezone estimation based on longitude
        const roughTimezone = Math.round(lon / 15); // 15 degrees per hour
        
        if (roughTimezone >= -12 && roughTimezone <= 12) {
            // Map to closest major timezone
            const timezoneMap = {
                '-12': 'Pacific/Auckland', '-11': 'Pacific/Midway', '-10': 'Pacific/Honolulu',
                '-9': 'America/Anchorage', '-8': 'America/Los_Angeles', '-7': 'America/Denver',
                '-6': 'America/Chicago', '-5': 'America/New_York', '-4': 'America/Caracas',
                '-3': 'America/Sao_Paulo', '-2': 'Atlantic/South_Georgia', '-1': 'Atlantic/Azores',
                '0': 'Europe/London', '1': 'Europe/Paris', '2': 'Europe/Berlin',
                '3': 'Europe/Moscow', '4': 'Asia/Dubai', '5': 'Asia/Karachi',
                '6': 'Asia/Dhaka', '7': 'Asia/Bangkok', '8': 'Asia/Shanghai',
                '9': 'Asia/Tokyo', '10': 'Australia/Sydney', '11': 'Pacific/Norfolk',
                '12': 'Pacific/Auckland'
            };
            
            return timezoneMap[roughTimezone.toString()] || 'UTC';
        }
        
        return 'UTC';
    }
    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('weatherContainer').style.opacity = '0.5';
        document.getElementById('forecastContainer').style.opacity = '0.5';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('weatherContainer').style.opacity = '1';
        document.getElementById('forecastContainer').style.opacity = '1';
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            this.hideError();
        }, 8000);
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }
    cleanup() {
        if (this.currentTimeInterval) {
            clearInterval(this.currentTimeInterval);
            this.currentTimeInterval = null;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});

// Cleanup when page is unloaded
window.addEventListener('beforeunload', () => {
    if (window.weatherApp) {
        window.weatherApp.cleanup();
    }
});