import WidgetContainer from "../widgetContainer";
import Location from "../widgets/location";
import Map from "../widgets/map";
import Speedtest from "../widgets/speedtest";
import Sun from "../widgets/sun";
import Weather from "../widgets/weather";

export default function Middle() {
    return (
        <div className="flex flex-row w-full gap-4">
            <div className="flex flex-col max-w-[48%] w-[48%] gap-4">
                <WidgetContainer>
                    <Weather />
                </WidgetContainer>
                <WidgetContainer>
                    <Sun />
                </WidgetContainer>
                <WidgetContainer className="flex-grow h-full">
                    <Speedtest />
                </WidgetContainer>
            </div>
            <div className="flex flex-col flex-grow gap-4">
                <WidgetContainer height="fit-content">
                    <Location />
                </WidgetContainer>
                <WidgetContainer>
                    <Map />
                </WidgetContainer>
            </div>
        </div>
    )
}