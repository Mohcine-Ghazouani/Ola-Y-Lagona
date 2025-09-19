import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY
    
    if (!API_KEY) {
      // Return fallback demo data if no API key is configured
      return NextResponse.json({
        temperature: 24,
        windSpeed: 18,
        windDirection: 45,
        humidity: 65,
        visibility: 10,
        description: "perfect for kiting",
        isDemo: true,
      })
    }

    // Fetch weather data from OpenWeatherMap API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Dakhla,MA&appid=${API_KEY}&units=metric`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to match our interface
    const weatherData = {
      temperature: Math.round(data.main.temp),
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: data.wind.deg || 0,
      humidity: data.main.humidity,
      visibility: Math.round((data.visibility || 10000) / 1000), // Convert to km
      description: data.weather[0].description,
      isDemo: false,
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Weather API error:", error)
    
    // Return fallback demo data on error
    return NextResponse.json({
      temperature: 24,
      windSpeed: 18,
      windDirection: 45,
      humidity: 65,
      visibility: 10,
      description: "perfect for kiting",
      isDemo: true,
      error: "Weather data temporarily unavailable",
    })
  }
}
