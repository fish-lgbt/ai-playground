import { fetchWeatherApi } from 'openmeteo';

export const fetchWeatherData = async (params: { latitude: number; longitude: number; location: string }) => {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const responses = await fetchWeatherApi(url, {
    latitude: params.latitude,
    longitude: params.longitude,
    hourly: 'temperature_2m',
  });

  // Helper function to form time ranges
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location.
  // Add a for-loop for multiple locations or weather models
  const response = responses[0];
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const hourly = response.hourly()!;

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map((t, index) => ({
    timestamp: new Date((t + utcOffsetSeconds) * 1000),
    temp: hourly.variables(0)!.valuesArray()?.[index],
  }));

  // Get the current time at hour mark
  const nowHourTime = new Date();
  nowHourTime.setHours(nowHourTime.getHours(), 0, 0, 0);

  // Find the current temperature
  const currentTempIndex = weatherData.findIndex(({ timestamp }) => {
    const hourTime = new Date(timestamp);
    hourTime.setHours(hourTime.getHours(), 0, 0, 0);
    return hourTime.getTime() === nowHourTime.getTime();
  });

  // If the current temperature is not found, return an error
  const currentTemp = weatherData[currentTempIndex].temp;
  if (!currentTemp) {
    return `I couldn't find the temperature for ${params.location}`;
  }

  // Get the current time at day mark
  const nowDayTime = new Date();
  nowDayTime.setHours(0, 0, 0, 0);

  // Get the temp for all timestamps with the same date
  const todaysTemps = weatherData
    .filter(({ timestamp }) => {
      const day = new Date(timestamp);
      day.setHours(0, 0, 0, 0);
      return day.getTime() === nowDayTime.getTime();
    })
    .map(({ temp }) => temp)
    .filter(Boolean);

  console.log({ todaysTemps, now: nowHourTime });

  // Min and max temperature
  const minTemp = Math.min(...todaysTemps);
  const maxTemp = Math.max(...todaysTemps);

  return `It is currently ${currentTemp.toFixed(0)}°C in ${params.location} with a high of ${maxTemp.toFixed(
    0,
  )}°C and a low of ${minTemp.toFixed(0)}°C`;
};
