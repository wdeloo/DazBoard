import { createContext, Dispatch, SetStateAction, useState } from "react";
import { Location } from "../components/widgets/weather";

const now = new Date()

interface sunDates {
    sunrise: Date
    sunset: Date
}

export const GlobalContext = createContext<{
    location: [Location, Dispatch<SetStateAction<Location>>],
    sunDates: [sunDates, Dispatch<SetStateAction<sunDates>>],
}>({
    location: [{ city: "", region: "", country: "", countryCode: "" }, () => { }],
    sunDates: [{ sunrise: now, sunset: now }, () => { }],
})

export default function GlobalProvider({ children }: { children: React.ReactNode }) {
    const locationState = useState<Location>({ city: "", region: "", country: "", countryCode: "" })
    const sunDatesState = useState<sunDates>({ sunrise: now, sunset: now })

    return (
        <GlobalContext.Provider
            value={{
                location: locationState,
                sunDates: sunDatesState,
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}