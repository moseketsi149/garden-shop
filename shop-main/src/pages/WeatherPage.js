import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, TrendingUp } from 'lucide-react';

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get user's current location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherAndForecast(latitude, longitude);
          // Try to get place name for the coordinates
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation permission denied or unavailable:', error);
          // Fallback to a default location (e.g., Maseru, Lesotho)
          fetchWeatherAndForecast(-29.31, 27.48); // Maseru coordinates
          setSelectedLocation({ name: 'Maseru, Lesotho', latitude: -29.31, longitude: 27.48 });
        }
      );
    } else {
      // Geolocation not supported, use default
      fetchWeatherAndForecast(-29.31, 27.48); // Maseru
      setSelectedLocation({ name: 'Maseru, Lesotho', latitude: -29.31, longitude: 27.48 });
    }
  }, []);

  // Fetch weather and forecast data from Open-Meteo
  const fetchWeatherAndForecast = async (latitude, longitude) => {
    setIsLoading(true);
    setError('');
    try {
      // Current weather
      const currentResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`,
        {
          headers: {
            'User-Agent': 'GardenShop/1.0 (weather-app)'
          }
        }
      );
      const currentData = await currentResponse.json();

      // Forecast (next 7 days)
      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`,
        {
          headers: {
            'User-Agent': 'GardenShop/1.0 (weather-app)'
          }
        }
      );
      const forecastData = await forecastResponse.json();

      setWeatherData(currentData);
      setForecastData(forecastData);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to load weather data. Please try again later.');
      toast.error('Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  // Reverse geocode (get place name from coordinates)
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'GardenShop/1.0 (weather-app)'
          }
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        // Extract relevant parts (we want city/town and country)
        const address = data.address;
        let placeName = address.city || address.town || address.village || address.county || '';
        if (address.state) placeName += `, ${address.state}`;
        if (address.country) placeName += `, ${address.country}`;
        setSelectedLocation({ 
          name: placeName || data.display_name, 
          latitude, 
          longitude 
        });
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }
  };

  // Search for places using Nominatim
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      // Search globally without geographic restrictions
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'GardenShop/1.0 (weather-app)'
          }
        }
      );
      const data = await response.json();

      if (data.length === 0) {
        setError('No places found. Try a different search term.');
        setSearchResults([]);
        return;
      }

      setSearchResults(data.map(item => ({
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      })));
    } catch (err) {
      console.error('Error searching for places:', err);
      setError('Failed to search for places. Please try again.');
      toast.error('Failed to search for places');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a place from search results
  const handlePlaceSelect = (place) => {
    setSelectedLocation(place);
    setSearchResults([]);
    setSearchQuery('');
    fetchWeatherAndForecast(place.latitude, place.longitude);
  };

  // Weather code to description mapping (WMO weather codes)
  const getWeatherDescription = (code) => {
    const codes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return codes[code] || 'Unknown';
  };

  // Weather code to icon mapping (using simple emojis for now)
  const getWeatherIcon = (code) => {
    if ([0, 1].includes(code)) return '☀️';
    if ([2, 3].includes(code)) return '⛅';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌈';
  };

  if (isLoading && !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-20">
        <div className="text-center">
          <div className="mb-4">
            <Search size={24} className="text-slate-400 mx-auto mb-2" />
          </div>
          <p className="text-slate-600">Loading weather information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-20">
        <div className="text-center">
          <div className="mb-4">
            <TrendingUp size={24} className="text-rose-500 mx-auto mb-2" />
          </div>
          <p className="text-rose-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Weather Information</h1>
          <p className="mt-2 text-slate-600">Current weather and forecast for your location</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a place anywhere in the world..."
              className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
            />
            <button 
              type="submit" 
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchResults.length > 0 && (
            <>
              <p className="mb-2 text-slate-700 font-medium">
                Here are results for "{searchQuery}"
              </p>
              <div className="mt-4 max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                {searchResults.map((place, index) => (
                  <div 
                    key={index} 
                    onClick={() => handlePlaceSelect(place)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-medium text-slate-900">{place.name}</div>
                    <div className="text-xs text-slate-500">
                      Lat: {place.latitude.toFixed(4)}, Lon: {place.longitude.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Current Location Display */}
        {selectedLocation && (
          <div className="mb-8 p-6 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {selectedLocation.name}
                </h2>
                <p className="mt-1 text-slate-600">
                  Lat: {selectedLocation.latitude.toFixed(4)}°, 
                  Lon: {selectedLocation.longitude.toFixed(4)}°
                </p>
              </div>
              <div className="text-right">
                {weatherData && (
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{getWeatherIcon(weatherData.current_weather.weathercode)}</div>
                    <div className="space-y-1">
                      <p className="text-4xl font-bold text-slate-900">
                        {Math.round(weatherData.current_weather.temperature)}°C
                      </p>
                      <p className="text-slate-600 capitalize">
                        {getWeatherDescription(weatherData.current_weather.weathercode)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Weather Forecast */}
        {forecastData && forecastData.daily && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7-Day Forecast</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {forecastData.daily.time.map((date, index) => {
                const maxTemp = forecastData.daily.temperature_2m_max[index];
                const minTemp = forecastData.daily.temperature_2m_min[index];
                const weatherCode = forecastData.daily.weathercode[index];
                return (
                  <div key={date} className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="mb-2 text-center">
                      <p className="font-medium text-slate-900">{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <div className="text-3xl">{getWeatherIcon(weatherCode)}</div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-slate-600 capitalize">
                        {getWeatherDescription(weatherCode)}
                      </p>
                      <p className="font-semibold text-slate-900">
                        {Math.round(maxTemp)}°/{Math.round(minTemp)}°C
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hourly Temperature Chart (if we want to add a chart later) */}
        {/* We can add a simple line chart using a library like recharts if needed, but keeping it simple for now */}
      </div>
    </div>
  );
}