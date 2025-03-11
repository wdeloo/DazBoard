import { createContext, Dispatch, SetStateAction, useState } from "react";
import { Location } from "../components/widgets/weather";
import { Link } from "../components/widgets/links";

const now = new Date()

interface sunDates {
    sunrise: Date
    sunset: Date
}

export const GlobalContext = createContext<{
    location: [Location, Dispatch<SetStateAction<Location>>],
    sunDates: [sunDates, Dispatch<SetStateAction<sunDates>>],
    linkMenu: [boolean, Dispatch<SetStateAction<boolean>>],
    newLink: [Link|null, Dispatch<SetStateAction<Link|null>>],
}>({
    location: [{ city: "", region: "", country: "", countryCode: "", countryFlag: "", latitude: 0, longitude: 0 }, () => { }],
    sunDates: [{ sunrise: now, sunset: now }, () => { }],
    linkMenu: [false, () => { }],
    newLink: [null, () => { }],
})

export default function GlobalProvider({ children }: { children: React.ReactNode }) {
    const location = useState<Location>({ city: "", region: "", country: "", countryCode: "", countryFlag: "", latitude: 0, longitude: 0 })
    const sunDates = useState<sunDates>({ sunrise: now, sunset: now })
    const linkMenu = useState<boolean>(false)
    const newLink = useState<Link|null>(null)

    return (
        <GlobalContext.Provider
            value={{
                location,
                sunDates,
                linkMenu,
                newLink,
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}