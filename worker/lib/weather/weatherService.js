import { fetchOpenWeather } from "@/lib/weather/openWeatherClient";
import { normalizeWeather } from "@/lib/weather/normalizeWeather";
import { getSimulatedWeather } from "@/lib/weather/simulatedWeather";
import { buildWeatherRiskFlags } from "@/lib/weather/triggerFlags";

const CACHE_TTL_MS = Number(process.env.WEATHER_CACHE_TTL_SECONDS ?? 180) * 1000;
const WEATHER_CACHE = globalThis.__GIG_INSURE_WEATHER_CACHE__ ?? new Map();

if (!globalThis.__GIG_INSURE_WEATHER_CACHE__) {
  globalThis.__GIG_INSURE_WEATHER_CACHE__ = WEATHER_CACHE;
}

function toBool(value, defaultValue) {
  if (value == null) {
    return defaultValue;
  }

  return String(value).toLowerCase() === "true";
}

function cacheKey(lat, lon) {
  return `${lat.toFixed(3)}:${lon.toFixed(3)}`;
}

function getCachedValue(key) {
  const cached = WEATHER_CACHE.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    WEATHER_CACHE.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedValue(key, data) {
  WEATHER_CACHE.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function withRiskFlags(normalized) {
  return {
    ...normalized,
    riskFlags: buildWeatherRiskFlags(normalized),
  };
}

export async function getWeather(lat, lon) {
  const key = cacheKey(lat, lon);
  const cached = getCachedValue(key);

  if (cached) {
    return {
      ...cached,
      meta: {
        ...cached.meta,
        cacheHit: true,
      },
    };
  }

  const useRealWeather = toBool(process.env.USE_REAL_WEATHER, true);
  const allowFallback = toBool(process.env.WEATHER_FAILOVER_TO_SIM, true);

  try {
    let normalized;

    if (useRealWeather) {
      const raw = await fetchOpenWeather(lat, lon);
      normalized = normalizeWeather(raw, "real", {
        cacheHit: false,
        fallbackUsed: false,
      });
    } else {
      const simulated = getSimulatedWeather(lat, lon);
      normalized = normalizeWeather(simulated, "simulated", {
        cacheHit: false,
        fallbackUsed: false,
      });
    }

    const enriched = withRiskFlags(normalized);
    setCachedValue(key, enriched);
    return enriched;
  } catch (error) {
    if (!allowFallback) {
      throw error;
    }

    const simulated = getSimulatedWeather(lat, lon);
    const normalized = normalizeWeather(simulated, "simulated", {
      cacheHit: false,
      fallbackUsed: true,
      error: error.message,
    });

    const enriched = withRiskFlags(normalized);
    setCachedValue(key, enriched);
    return enriched;
  }
}
