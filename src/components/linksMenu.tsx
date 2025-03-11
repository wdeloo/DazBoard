import { useContext, useRef } from "react"
import { GlobalContext } from "../context/global"

function parseUrl(url: string) {
    const divided = url.split('://')

    let protocol, host
    if (divided.length < 2) {
        protocol = 'https'
        host = divided[0]
    } else {
        protocol = divided[0]
        host = divided[1]
    }

    return { protocol, host }
}

export default function LinksMenu() {
    const globalContext = useContext(GlobalContext)

    const [linkMenu, setLinkMenu] = globalContext.linkMenu
    const setNewLink = globalContext.newLink[1]

    const formRef = useRef<HTMLFormElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const urlRef = useRef<HTMLInputElement>(null)

    if (!linkMenu) return

    function create(e: React.FormEvent) {
        e.preventDefault()

        if (!nameRef.current || !urlRef.current) return

        const name = nameRef.current.value
        const url = urlRef.current.value

        if (!url) return
        if (url === '://') return

        const { protocol, host } = parseUrl(url)

        setNewLink({ name, protocol, host })
        setLinkMenu(false)
    }

    function exitCancel(e: React.MouseEvent) {
        if (e.target !== e.currentTarget) return

        formRef.current?.reset()
        cancel()
    }

    function cancel() {
        setLinkMenu(false)
    }

    return (
        <div onClick={exitCancel} className="absolute z-10 flex justify-center items-center w-screen h-screen left-0 top-0 backdrop-brightness-75 backdrop-blur-sm">
            <div className="bg-gray-600 w-fit p-3 rounded text-white shadow-md shadow-neutral-600 flex flex-col gap-5">
                <h1 className="text-2xl font-bold">New Link</h1>
                <form ref={formRef} onSubmit={create} onReset={cancel} className="flex flex-col gap-2">
                    <input ref={nameRef} className="p-1 w-full outline-none rounded-sm text-black placeholder:text-neutral-500 bg-gray-300" type="text" placeholder="Name (optional)" />
                    <input ref={urlRef} className="p-1 w-[50ch] rounded-sm outline-none text-black placeholder:text-neutral-500 bg-gray-300" type="text" placeholder="URL" />

                    <div className="flex flex-row font-bold mt-1 justify-evenly">
                        <button className="py-1 px-4">Create</button>
                        <button className="py-1 px-4" type="reset">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}