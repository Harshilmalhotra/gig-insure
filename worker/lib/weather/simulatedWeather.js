function stableRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getSimulatedWeather(lat, lon) {
  const seed = lat * 12.9898 + lon * 78.233;
  const rainfallMm = Number((stableRandom(seed) * 25).toFixed(2));
  const temp = Number((22 + stableRandom(seed + 1) * 16).toFixed(1));
  const feelsLike = Number((temp + stableRandom(seed + 2) * 2.5).toFixed(1));
  const humidity = Math.round(45 + stableRandom(seed + 3) * 45);
  const windSpeed = Number((1 + stableRandom(seed + 4) * 8).toFixed(2));

  const condition = rainfallMm > 12 ? "Rain" : temp > 35 ? "Clear" : "Clouds";
  const description =
    condition === "Rain"
      ? "moderate rain"
      : condition === "Clear"
        ? "hot and clear"
        : "scattered clouds";

  return {
    coord: { lat, lon },
    weather: [{ main: condition, description }],
    main: {
      temp,
      feels_like: feelsLike,
      humidity,
    },
    wind: {
      speed: windSpeed,
    },
    rain: {
      "1h": rainfallMm,
    },
    dt: Math.floor(Date.now() / 1000),
  };
}
