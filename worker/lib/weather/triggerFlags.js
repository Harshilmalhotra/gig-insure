function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveThresholds() {
  return {
    heavyRainMm: toNumber(process.env.TRIGGER_HEAVY_RAIN_MM, 20),
    heatC: toNumber(process.env.TRIGGER_HEAT_C, 42),
    highWindMps: toNumber(process.env.TRIGGER_HIGH_WIND_MPS, 12),
    highHumidityPct: toNumber(process.env.TRIGGER_HIGH_HUMIDITY_PCT, 85),
  };
}

export function buildWeatherRiskFlags(normalizedWeather) {
  const thresholds = resolveThresholds();
  const { weather } = normalizedWeather;

  const checks = [
    {
      key: "HEAVY_RAIN",
      title: "Heavy Rain Risk",
      severity: "high",
      triggered: weather.rainfallMm >= thresholds.heavyRainMm,
      reason: `Rainfall ${weather.rainfallMm}mm >= ${thresholds.heavyRainMm}mm`,
    },
    {
      key: "EXTREME_HEAT",
      title: "Extreme Heat Risk",
      severity: "high",
      triggered: weather.temperatureC >= thresholds.heatC,
      reason: `Temperature ${weather.temperatureC}C >= ${thresholds.heatC}C`,
    },
    {
      key: "HIGH_WIND",
      title: "High Wind Risk",
      severity: "medium",
      triggered: weather.windSpeedMps >= thresholds.highWindMps,
      reason: `Wind speed ${weather.windSpeedMps}m/s >= ${thresholds.highWindMps}m/s`,
    },
    {
      key: "HIGH_HUMIDITY",
      title: "High Humidity Risk",
      severity: "low",
      triggered: weather.humidityPercent >= thresholds.highHumidityPct,
      reason: `Humidity ${weather.humidityPercent}% >= ${thresholds.highHumidityPct}%`,
    },
  ];

  const triggered = checks.filter((item) => item.triggered);

  return {
    hasActiveRisk: triggered.length > 0,
    triggeredCount: triggered.length,
    flags: checks,
    activeFlags: triggered,
    thresholds,
  };
}