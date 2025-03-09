import WidgetContainer from "../widgetContainer";
import Clock from "../widgets/clock";
import Date from "../widgets/date";

export default function Upper() {
    return (
        <WidgetContainer>
            <div className="flex flex-row items-center justify-between">
                <Clock />
                <Date />
            </div>
        </WidgetContainer>
    )
}