import { useEffect, useRef, useState } from "react"
import Lower from "./components/pieces/lower"
import Middle from "./components/pieces/middle"
import Upper from "./components/pieces/upper"
import GlobalProvider from "./context/global"
import LinksMenu from "./components/linksMenu"

export default function App() {
    const [margin, setMargin] = useState(0)

    const dashboardRef = useRef<HTMLDivElement>(null)

    function updateMargin() {
        const dashboard = dashboardRef.current
        if (!dashboard) return

        const windowHeight = window.innerHeight
        const dashboardHeight = dashboard.getBoundingClientRect().height

        const margin = (windowHeight - dashboardHeight) / 2

        setMargin(Math.max(margin, 0))
    }

    useEffect(() => {
        const dashboard = dashboardRef.current
        if (!dashboard) return

        const observer = new ResizeObserver(updateMargin)

        observer.observe(dashboard)

        window.addEventListener('resize', updateMargin)

        return () => {
            observer.disconnect()
            window.removeEventListener('resize', updateMargin)
        }
    }, [])

    return (
        <GlobalProvider>
            <main
                className="w-screen h-screen bg-cover bg-no-repeat"
                style={{
                    backgroundImage: `url('${import.meta.env.BASE_URL}background-images/rocks-beach.jpg')`,
                    backgroundPositionY: "center",
                }}
            >
                <LinksMenu />
                <div className="w-full h-full backdrop-brightness-75 overflow-y-auto">
                    <div ref={dashboardRef} style={{ marginTop: margin, marginBottom: margin }} className="max-w-5xl p-4 h-fit backdrop-filter gap-4 flex flex-col mx-auto">
                        <Upper />
                        <Middle />
                        <Lower />
                    </div>
                </div>
            </main>
        </GlobalProvider>
    )
}