const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_BASE_URL ?? "https://api.openweathermap.org";

function buildOpenWeatherUrl(lat, lon) {
  const searchParams = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    appid: process.env.OPENWEATHER_API_KEY ?? "",
    units: "metric",
  });

  return `${OPENWEATHER_BASE_URL}/data/2.5/weather?${searchParams.toString()}`;
}

export async function fetchOpenWeather(lat, lon, timeoutMs = 3000) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is missing");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildOpenWeatherUrl(lat, lon), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenWeather request failed (${response.status}): ${body.slice(0, 180)}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("OpenWeather request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
