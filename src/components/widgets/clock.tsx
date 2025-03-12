import { useEffect, useState } from "react"

interface Time {
    hours: string
    minutes: string
}

function getTime(): Time {
    const time = new Date()
    const hours = time.getHours().toString().padStart(2, "0")
    const minutes = time.getMinutes().toString().padStart(2, "0")

    return { hours, minutes }
}

export default function Clock() {
    const [time, setTime] = useState(getTime())

    useEffect(() => {
        const int = setInterval(() => setTime(getTime()), 1000)

        return () => clearInterval(int)
    }, [])

    return <span className="text-6xl font-medium">{time.hours}:{time.minutes}</span>
}