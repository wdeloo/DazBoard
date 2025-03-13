import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../../context/global"

function getWeatherIconSrc(weatherCode: number, isDayTime: boolean) {
    const path = "weather-icons/"
    const dayOrNight = isDayTime ? "day" : "night"

    switch (weatherCode) {
        case 113:
            return path + `clear-${dayOrNight}.svg`
        case 116:
            return path + `cloudy-1-${dayOrNight}.svg`
        case 119:
            return path + `cloudy-3-${dayOrNight}.svg`
        case 122:
            return path + 'cloudy.svg'
        case 143: case 248: case 260:
            return path + 'fog.svg'
        case 176: case 263: case 266: case 293: case 296: case 353:
            return path + 'rainy-2.svg'
        case 179: case 182: case 185: case 281: case 284: case 311: case 314: case 317: case 350: case 362: case 365: case 374: case 377:
            return path + 'rain-and-snow-mix.svg'
        case 200: case 386: case 392:
            return path + 'isolated-thunderstorms.svg'
        case 227: case 320: case 323: case 326: case 368:
            return path + 'snowy-2.svg'
        case 230: case 329: case 332: case 335: case 338: case 371: case 395:
            return path + 'snowy-3.svg'
        case 299: case 302: case 305: case 308: case 356: case 359:
            return path + 'rainy-3.svg'
        case 389:
            return path + 'severe-thunderstorm.svg'
        default:
            return ""
    }
}

async function fetchWeatherApi(place: string) {
    const url = `https://wttr.in/${place}?format=j1`

    return await (await fetch(url)).json()
}

export interface Location {
    city: string
    region: string
    country: string
    countryCode: string
    countryFlag: string
    latitude: number
    longitude: number
}

interface Weather {
    temperature: number
    humidity: number
    weather: string
    weatherIconSrc: string
    feelsLike: number
    windspeed: number
    visibility: number
    weatherCode: number
}

async function getLocation(): Promise<Location> {
    const json = await (await fetch("https://ipwho.is")).json()

    const { city, region, country, country_code: countryCode, flag: { emoji: countryFlag }, latitude, longitude } = json;

    return {city, region, country, countryCode, countryFlag, latitude, longitude}
}

function getSunDates(now: Date, sunrise: string, sunset: string) {
    const sunriseDate = new Date(`${now.toDateString()} ${sunrise}`)
    const sunsetDate = new Date(`${now.toDateString()} ${sunset}`)

    return [sunriseDate, sunsetDate]
}

export function isDay(nowDate: Date, sunriseDate: Date, sunsetDate: Date) {
    return nowDate.getTime() > sunriseDate.getTime() && nowDate.getTime() < sunsetDate.getTime()
}

export default function Weather() {
    const [weather, setWeather] = useState<Weather>({temperature: 0, humidity: 0, weather: "", weatherIconSrc: "", feelsLike: 0, windspeed: 0, visibility: 0, weatherCode: 0})

    const [_, setLocation] = useContext(GlobalContext).location
    const [__, setSunDates] = useContext(GlobalContext).sunDates

    async function getWeather(): Promise<Weather> {
        const location = await getLocation()
        setLocation(location)
    
        const json = await fetchWeatherApi(`${location.city}+${location.region}+${location.country}`)
    
        const sunrise = json.weather[0].astronomy[0].sunrise as string
        const sunset = json.weather[0].astronomy[0].sunset as string
    
        const now = new Date()
    
        const [sunriseDate, sunsetDate] = getSunDates(now, sunrise, sunset)

        setSunDates({ sunrise: sunriseDate, sunset: sunsetDate })
    
        const isDayTime = isDay(now, sunriseDate, sunsetDate)
    
        const current_condition = json.current_condition[0]
    
        const temperature = current_condition.temp_C
        const humidity = current_condition.humidity
        const weather = current_condition.weatherDesc[0].value
        const weatherCode = Number(current_condition.weatherCode)
        const weatherIconSrc = getWeatherIconSrc(Number(weatherCode), isDayTime)
        const feelsLike = current_condition.FeelsLikeC
        const windspeed = current_condition.windspeedKmph
        const visibility = current_condition.visibility
    
        return {temperature, humidity, weather, weatherIconSrc, feelsLike, windspeed, visibility, weatherCode}
    }

    useEffect(() => {
        async function updateWeather() {
            setWeather(await getWeather())
        }

        const int = setInterval(updateWeather, 180000)

        updateWeather()

        return () => clearInterval(int)
    }, [])

    return (
        <div className="flex flex-row justify-between">
            <ul className="flex flex-col text-2xl text-neutral-600 text-left h-[148px] justify-between">
                <li><span className="emoji">🌡️</span> Feels like: <span className="text-black font-medium">{weather.feelsLike}ºC</span></li>
                <li><span className="emoji">💧</span> Humidity: <span className="text-black font-medium">{weather.humidity}%</span></li>
                <li><span className="emoji">🍃</span> Wind: <span className="text-black font-medium">{weather.windspeed}km/h</span></li>
                <li><span className="emoji">👁️</span> Visibility: <span className="text-black font-medium">{weather.visibility}km</span></li>
            </ul>
            <div className="flex flex-col items-center min-w-40 justify-center">{weather.weatherIconSrc ? <div style={{ marginLeft: weather.weatherCode === 113 ? '-64px' : 0, marginBottom: weather.weatherCode === 113 ? '-20px' : 0 }}><img title={weather.weather} width={weather.weatherCode === 113 ? 120 : 100} src={`${import.meta.env.BASE_URL}${weather.weatherIconSrc}`} /></div> : null}<div className="flex flex-row items-start text-5xl font-semibold">{weather.temperature}<span className="text-base text-neutral-600">ºC</span></div></div>
        </div>
    )
}