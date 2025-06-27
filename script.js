// Weather Dashboard JavaScript
class WeatherApp {
    constructor() {
        this.apiKey = 'YOUR_API_KEY_HERE'; // We'll add this in next step
        this.apiUrl = 'https://api.openweathermap.org/data/2.5';
        this.init();
    }

    init() {
        this.bindEvents();
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
    }

    loadDefaultWeather() {
        // For now, we'll use placeholder data
        // In the next step, we'll replace this with actual API calls
        const placeholderData = {
            name: 'New York',
            country: 'US',
            temp: 22,
            description: 'Sunny',
            icon: '01d',
            feels_like: 25,
            humidity: 60,
            wind_speed: 10,
            pressure: 1013,
            sunrise: '06:30',
            sunset: '19:45',
            visibility: 10,
            clouds: 20
        };

        this.updateCurrentWeather(placeholderData);
        this.updateForecast(this.getPlaceholderForecast());
    }

    searchWeather() {
        const city = document.getElementById('cityInput').value.trim();
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        // For now, we'll simulate API call with placeholder data
        this.showLoading();
        setTimeout(() => {
            const placeholderData = {
                name: city,
                country: 'Unknown',
                temp: Math.floor(Math.random() * 30) + 10,
                description: 'Clear Sky',
                icon: '01d',
                feels_like: Math.floor(Math.random() * 30) + 10,
                humidity: Math.floor(Math.random() * 40) + 40,
                wind_speed: Math.floor(Math.random() * 20) + 5,
                pressure: Math.floor(Math.random() * 50) + 1000,
                sunrise: '06:30',
                sunset: '19:45',
                visibility: Math.floor(Math.random() * 10) + 5,
                clouds: Math.floor(Math.random() * 50) + 10
            };

            this.hideLoading();
            this.updateCurrentWeather(placeholderData);
            this.updateForecast(this.getPlaceholderForecast());
        }, 1000);
    }

    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // For now, we'll use placeholder data
                // In the next step, we'll use actual coordinates
                setTimeout(() => {
                    const placeholderData = {
                        name: 'Your Location',
                        country: 'Unknown',
                        temp: Math.floor(Math.random() * 30) + 10,
                        description: 'Current Weather',
                        icon: '02d',
                        feels_like: Math.floor(Math.random() * 30) + 10,
                        humidity: Math.floor(Math.random() * 40) + 40,
                        wind_speed: Math.floor(Math.random() * 20) + 5,
                        pressure: Math.floor(Math.random() * 50) + 1000,
                        sunrise: '06:30',
                        sunset: '19:45',
                        visibility: Math.floor(Math.random() * 10) + 5,
                        clouds: Math.floor(Math.random() * 50) + 10
                    };

                    this.hideLoading();
                    this.updateCurrentWeather(placeholderData);
                    this.updateForecast(this.getPlaceholderForecast());
                }, 1000);
            },
            (error) => {
                this.hideLoading();
                this.showError('Unable to get your location');
            }
        );
    }

    updateCurrentWeather(data) {
        document.getElementById('cityName').textContent = `${data.name}, ${data.country}`;
        document.getElementById('temperature').textContent = `${data.temp}°C`;
        document.getElementById('description').textContent = data.description;
        document.getElementById('weatherIcon').textContent = this.getWeatherIcon(data.icon);
        document.getElementById('feelsLike').textContent = `${data.feels_like}°C`;
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('windSpeed').textContent = `${data.wind_speed} km/h`;
        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        document.getElementById('sunrise').textContent = data.sunrise;
        document.getElementById('sunset').textContent = data.sunset;
        document.getElementById('visibility').textContent = `${data.visibility} km`;
        document.getElementById('clouds').textContent = `${data.clouds}%`;
    }

    updateForecast(forecastData) {
        const forecastGrid = document.getElementById('forecastGrid');
        forecastGrid.innerHTML = '';

        forecastData.forEach((day, index) => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            const dayName = index === 0 ? 'Today' : 
                          index === 1 ? 'Tomorrow' : 
                          this.getDayName(index);

            forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon">${this.getWeatherIcon(day.icon)}</div>
                <div class="forecast-temp">${day.temp}°C</div>
                <div class="forecast-desc">${day.description}</div>
            `;

            forecastGrid.appendChild(forecastItem);
        });
    }

    getPlaceholderForecast() {
        const icons = ['01d', '02d', '03d', '04d', '09d'];
        const descriptions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 'Light Rain'];
        
        return Array.from({length: 5}, (_, i) => ({
            temp: Math.floor(Math.random() * 15) + 15,
            icon: icons[i],
            description: descriptions[i]
        }));
    }

    getWeatherIcon(iconCode) {
        const icons = {
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
        return icons[iconCode] || '☀️';
    }

    getDayName(index) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const futureDay = new Date(today);
        futureDay.setDate(today.getDate() + index);
        return days[futureDay.getDay()];
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize the weather app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});