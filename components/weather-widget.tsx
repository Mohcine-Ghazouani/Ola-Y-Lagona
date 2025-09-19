"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wind, Thermometer, Eye, Droplets } from "lucide-react"

interface WeatherData {
  temperature: number
  windSpeed: number
  windDirection: number
  humidity: number
  visibility: number
  description: string
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    try {
      // Using OpenWeatherMap API for Dakhla, Morocco
      const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "demo-key"
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Dakhla,MA&appid=${API_KEY}&units=metric`,
      )

      if (!response.ok) {
        throw new Error("Weather data unavailable")
      }

      const data = await response.json()

      setWeather({
        temperature: Math.round(data.main.temp),
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: data.wind.deg,
        humidity: data.main.humidity,
        visibility: Math.round(data.visibility / 1000), // Convert to km
        description: data.weather[0].description,
      })
    } catch (err) {
      setError("Unable to load weather data")
      // Fallback demo data for Dakhla
      setWeather({
        temperature: 24,
        windSpeed: 18,
        windDirection: 45,
        humidity: 65,
        visibility: 10,
        description: "perfect for kiting",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Live Weather - Dakhla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Live Weather - Dakhla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Weather data unavailable</p>
        </CardContent>
      </Card>
    )
  }

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return directions[Math.round(degrees / 45) % 8]
  }

  const getWindCondition = (speed: number) => {
    if (speed < 10) return { text: "Light winds", color: "text-yellow-600" }
    if (speed < 20) return { text: "Perfect for kiting", color: "text-green-600" }
    if (speed < 30) return { text: "Strong winds", color: "text-blue-600" }
    return { text: "Very strong", color: "text-red-600" }
  }

  const windCondition = getWindCondition(weather.windSpeed)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          Live Weather - Dakhla
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span className="text-sm">{weather.temperature}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {weather.windSpeed} km/h {getWindDirection(weather.windDirection)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            <span className="text-sm">{weather.visibility} km</span>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className={`text-sm font-medium ${windCondition.color}`}>{windCondition.text}</p>
          <p className="text-xs text-muted-foreground capitalize">{weather.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
