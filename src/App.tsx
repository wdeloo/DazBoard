import Lower from "./components/pieces/lower";
import Middle from "./components/pieces/middle";
import Upper from "./components/pieces/upper";
import GlobalProvider from "./context/global";

export default function App() {

    return (
        <GlobalProvider>
            <main
                className="w-screen h-screen bg-cover bg-no-repeat"
                style={{
                    backgroundImage: "url('background-images/rocks-beach.jpg')",
                    backgroundPositionY: "center",
                }}
            >
                <div className="w-full h-full backdrop-brightness-75">
                    <div className="max-w-5xl w-full p-4 m-auto backdrop-filter gap-4 flex flex-col">
                        <Upper />
                        <Middle />
                        <Lower />
                    </div>
                </div>
            </main>
        </GlobalProvider>
    )
}