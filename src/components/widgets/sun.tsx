import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../../context/global"
import { isDay } from "./weather"

interface Time {
    hours: number
    minutes: number
}

function getTimeUntilEvent(now: Date, event: Date): Time {
    let eventTime = event.getTime()
    const nowTime = now.getTime()

    if (nowTime > eventTime) eventTime = new Date(eventTime).setDate(now.getDate() + 1)

    const diff = eventTime - nowTime

    const hours = Math.floor(diff / 1000 / 60 / 60)
    const minutes = Math.floor(diff / 1000 / 60 % 60)

    return { hours, minutes }
}

export default function Sun() {
    const [now, setNow] = useState(new Date())

    const [sunDates] = useContext(GlobalContext).sunDates
    const { sunrise, sunset } = sunDates

    useEffect(() => {
        const int = setInterval(() => {
            const now = new Date()

            setNow(now)
        }, 1000)

        return () => clearInterval(int)
    }, [])

    const day = isDay(now, sunrise, sunset)
    const timeUntilEvent = getTimeUntilEvent(now, day ? sunset : sunrise)

    return (
        <div className="text-3xl flex flex-row items-center justify-center gap-2">
            <img className="ml-[-16px]" src="/images/sunsetrise.svg" width={70} />
            <div><span className="text-neutral-600">{day ? 'Sunset' : 'Sunrise'} in</span> {Boolean(timeUntilEvent.hours) && `${timeUntilEvent.hours}h`} {timeUntilEvent.minutes}min</div>
        </div>
    )
}