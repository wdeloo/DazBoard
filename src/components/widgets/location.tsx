import { useContext } from "react"
import { GlobalContext } from "../../context/global"

export default function Location() {
    const [location] = useContext(GlobalContext).location

    if (!location.countryCode) return null

    return (
        <div className="flex flex-row h-full gap-2 items-center justify-center">
            <img className="ml-[-10px]" src="/images/location-pin.svg" width={50} />
            <span className="text-3xl font-medium">{location.city}<span className="text-neutral-600 font-normal">, {location.region}</span></span>
            <span title={location.country} className="text-[50px] mx-2 cursor-default" draggable>{location.countryFlag}</span>
        </div>
    )
}