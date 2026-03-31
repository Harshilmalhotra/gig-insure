import { getWeather } from "@/lib/weather/weatherService";

function parseCoordinate(value, label) {
  if (value == null || String(value).trim() === "") {
    throw new Error(`${label} is required`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number`);
  }
  return parsed;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseCoordinate(searchParams.get("lat"), "lat");
    const lon = parseCoordinate(searchParams.get("lon"), "lon");

    const data = await getWeather(lat, lon);

    return Response.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message ?? "Unexpected weather error",
      },
      {
        status: 400,
      },
    );
  }
}
