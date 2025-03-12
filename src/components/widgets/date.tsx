import { useEffect, useState } from "react"

interface Date {
    day: string
    weekday: string
    month: string
}

function getDate(): Date {
    const date = new window.Date()
    const day = date.getDate().toString()
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" })
    const month = date.toLocaleDateString("en-US", { month: "long" })

    return { day, weekday, month }
}

export default function Date() {
    const [date, setDate] = useState(getDate())

    useEffect(() => {
        const int = setInterval(() => setDate(getDate()), 1000)

        return () => clearInterval(int)
    }, [])

    return (
        <div className="text-3xl flex flex-row items-center gap-4">
            <div className="flex flex-col text-right">
                <span className="text-neutral-600">{date.weekday}</span>
                <span className="font-medium">{date.month}</span>
            </div>
            <span className="text-6xl font-medium">{date.day}</span>
        </div>
    )
}