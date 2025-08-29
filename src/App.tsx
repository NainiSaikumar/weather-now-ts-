import React, { useState } from "react";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity?: number;
  };
  weather: {
    description: string;
  }[];
}

declare global {
  interface ImportMetaEnv {
    VITE_OPENWEATHER_API_KEY?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const App: React.FC = () => {
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const fetchWeather = async () => {
    setError("");
    setWeather(null);

    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    if (!API_KEY) {
      setError("API key not set. Use VITE_OPENWEATHER_API_KEY");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      if (res.ok) {
        setWeather(data as WeatherData);
        setError("");
      } else {
        setError(data?.message || "City not found");
      }
    } catch (err) {
      setError("Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchWeather();
  };

  return (
    <div className="app">
      <h1>🌤️ Weather Now</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Enter city (e.g., Hyderabad)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°C</p>
          {weather.main.humidity !== undefined && (
            <p>Humidity: {weather.main.humidity}%</p>
          )}
          <p>{weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
};

export default App;
