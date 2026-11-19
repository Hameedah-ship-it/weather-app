
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weatherResult");
const welcome = document.getElementById("welcome");

const DEFAULT_CITY = "Ibadan";

// Weather descriptions and icons
const weatherTypes = {
  0: ["Clear Sky", "☀️"],
  1: ["Mainly Clear", "🌤️"],
  2: ["Partly Cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Foggy", "🌫️"],
  48: ["Foggy", "🌫️"],
  51: ["Light Drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy Drizzle", "🌧️"],
  61: ["Light Rain", "🌧️"],
  63: ["Moderate Rain", "🌧️"],
  65: ["Heavy Rain", "🌧️"],
  71: ["Light Snow", "🌨️"],
  73: ["Snow", "❄️"],
  75: ["Heavy Snow", "❄️"],
  80: ["Rain Showers", "🌦️"],
  81: ["Rain Showers", "🌧️"],
  82: ["Heavy Rain Showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with Hail", "⛈️"],
  99: ["Heavy Thunderstorm", "⛈️"]
};

// Get weather information
async function getWeather(city) {
  city = city.trim();

  if (!city) {
    message.textContent = "Please enter a city name.";
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = "Loading...";
  message.textContent = "";
  weatherResult.hidden = true;
  welcome.hidden = true;

  try {
    // Find city coordinates
    const locationURL =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const locationResponse = await fetch(locationURL);

    if (!locationResponse.ok) {
      throw new Error("Unable to search for this location.");
    }

    const locationData = await locationResponse.json();

    if (!locationData.results || locationData.results.length === 0) {
      throw new Error("City not found. Please try another city.");
    }

    const location = locationData.results[0];

    // Fetch current weather and forecast
    const weatherURL =
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=auto`;

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
      throw new Error("Unable to get weather information.");
    }

    const data = await weatherResponse.json();

    const current = data.current;
    const daily = data.daily;

    const weather = weatherTypes[current.weather_code] ||
      ["Unknown Weather", "🌍"];

    // Display city information
    document.getElementById("cityName").textContent =
      `${location.name}, ${location.country}`;

    document.getElementById("date").textContent =
      new Date().toLocaleDateString("en", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: data.timezone
      });

    // Display current weather
    document.getElementById("temperature").textContent =
      Math.round(current.temperature_2m);

    document.getElementById("condition").textContent =
      weather[0];

    document.getElementById("weatherIcon").textContent =
      weather[1];

    document.getElementById("description").textContent =
      "Here is your current weather update.";

    // Weather highlights
    document.getElementById("humidity").textContent =
      `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
      `${current.wind_speed_10m} km/h`;

    document.getElementById("feelsLike").textContent =
      `${Math.round(current.apparent_temperature)}°C`;

    document.getElementById("rain").textContent =
      `${daily.precipitation_probability_max[0] ?? 0}%`;

    // Display five-day forecast
    const forecast = document.getElementById("forecast");

    forecast.innerHTML = "";

    daily.time.forEach((day, index) => {
      const dayName = index === 0
        ? "Today"
        : new Date(`${day}T12:00:00`).toLocaleDateString("en", {
            weekday: "short"
          });

      const dayWeather = weatherTypes[daily.weather_code[index]] ||
        ["Unknown", "🌍"];

      const card = document.createElement("div");
      card.className = "forecast-card";

      const name = document.createElement("p");
      name.textContent = dayName;

      const icon = document.createElement("span");
      icon.className = "forecast-icon";
      icon.textContent = dayWeather[1];

      const temperature = document.createElement("h4");
      temperature.textContent =
        `${Math.round(daily.temperature_2m_max[index])}° / ${Math.round(daily.temperature_2m_min[index])}°`;

      const condition = document.createElement("small");
      condition.textContent = dayWeather[0];

      card.append(name, icon, temperature, condition);

      forecast.appendChild(card);
    });

    // Show the completed weather dashboard
    weatherResult.hidden = false;
    welcome.hidden = true;

  } catch (error) {
    message.textContent =
      error.message || "Something went wrong. Please try again.";

    welcome.hidden = false;

  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "⌕ Search";
  }
}

// Search button
weatherForm.addEventListener("submit", function(event) {
  event.preventDefault();
  getWeather(cityInput.value);
});

// Popular city buttons
document.querySelectorAll(".city-btn").forEach(button => {
  button.addEventListener("click", function() {
    cityInput.value = this.textContent;
    getWeather(this.textContent);
  });
});

// Dark mode
const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", function() {
  document.body.classList.toggle("dark");

  themeBtn.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Automatically display Ibadan weather on page load
getWeather(DEFAULT_CITY);
