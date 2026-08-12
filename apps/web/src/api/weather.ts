export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
}

/** Open-Meteo - kalitsiz, CORS ruxsat etilgan ochiq ob-havo API'si. */
export async function fetchCurrentWeather(lat: number, lng: number): Promise<CurrentWeather> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`,
  );
  if (!res.ok) throw new Error("Ob-havo ma'lumotini olib bo'lmadi");
  const data = await res.json();
  return {
    temperature: Math.round(data.current_weather.temperature),
    weatherCode: data.current_weather.weathercode,
  };
}

/** WMO ob-havo kodini emojiga aylantiradi (Open-Meteo shu kodlashdan foydalanadi). */
export function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "🌨️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}
