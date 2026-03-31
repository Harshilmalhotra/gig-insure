function toIsoFromUnix(unixSeconds) {
  if (!unixSeconds) {
    return new Date().toISOString();
  }

  return new Date(unixSeconds * 1000).toISOString();
}

export function normalizeWeather(raw, source, metadata = {}) {
  return {
    source,
    location: {
      lat: Number(raw?.coord?.lat ?? 0),
      lon: Number(raw?.coord?.lon ?? 0),
    },
    weather: {
      condition: raw?.weather?.[0]?.main ?? "Unknown",
      description: raw?.weather?.[0]?.description ?? "No description",
      temperatureC: Number(raw?.main?.temp ?? 0),
      feelsLikeC: Number(raw?.main?.feels_like ?? 0),
      humidityPercent: Number(raw?.main?.humidity ?? 0),
      windSpeedMps: Number(raw?.wind?.speed ?? 0),
      rainfallMm: Number(raw?.rain?.["1h"] ?? raw?.rain?.["3h"] ?? 0),
    },
    fetchedAt: toIsoFromUnix(raw?.dt),
    meta: {
      cacheHit: Boolean(metadata.cacheHit),
      fallbackUsed: Boolean(metadata.fallbackUsed),
      provider: source === "real" ? "openweather" : "simulation",
      error: metadata.error ?? null,
    },
  };
}
