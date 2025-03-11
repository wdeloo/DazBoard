import LinksMenu from "../linksMenu"
import WidgetContainer from "../widgetContainer"
import Links from "../widgets/links"

export default function Lower() {
    return (
        <>
            <LinksMenu />
            <WidgetContainer>
                <Links />
            </WidgetContainer>
        </>
    )
}