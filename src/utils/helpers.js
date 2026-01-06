// Auto-capture environmental context
export const captureEnvironment = async () => {
  const env = {
    timestamp: new Date().toISOString(),
    timeOfDay: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
  };

  // Geolocation
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });
    env.location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    // Weather data (OpenWeatherMap free tier)
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (API_KEY && API_KEY !== 'YOUR_OPENWEATHER_API_KEY') {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${env.location.lat}&lon=${env.location.lng}&appid=${API_KEY}&units=metric&lang=hu`;

      const weatherResponse = await fetch(weatherUrl);
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        // Fix capitalization - only first letter should be capital
        const condition = weatherData.weather[0].description;
        console.log('🌤️ Raw weather from API:', condition);
        const fixedCondition = condition.charAt(0).toUpperCase() + condition.slice(1).toLowerCase();
        console.log('🌤️ Fixed weather:', fixedCondition);

        env.weather = {
          condition: fixedCondition,
          temp: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          city: weatherData.name,
        };
      }
    }
  } catch (error) {
    console.log("Could not capture environment:", error);
    // Gracefully fail - symptom logging still works
  }

  return env;
};

export const confirmDeleteEntry = async (deleteFn, entryId) => {
  if (!window.confirm("Biztosan törölni szeretnéd ezt a bejegyzést?")) {
    return false;
  }

  const { error } = await deleteFn(entryId);
  if (error) {
    alert(`Hiba a törlésnél: ${error}`);
    return false;
  }

  return true;
};
