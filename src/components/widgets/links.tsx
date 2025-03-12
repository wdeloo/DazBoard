import { useContext, useEffect, useRef, useState } from 'react'
import { GlobalContext } from '../../context/global'
import { arrayMoveImmutable } from 'array-move'

function Trash({ width, height, color }: { width?: number, height?: number, color?: string }) {
    return (
        <svg fill={color ?? "#FFFFFF"} version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" 
            width={width} height={height} viewBox="0 0 408.483 408.483"
        >
            <g>
                <g>
                    <path d="M87.748,388.784c0.461,11.01,9.521,19.699,20.539,19.699h191.911c11.018,0,20.078-8.689,20.539-19.699l13.705-289.316
                        H74.043L87.748,388.784z M247.655,171.329c0-4.61,3.738-8.349,8.35-8.349h13.355c4.609,0,8.35,3.738,8.35,8.349v165.293
                        c0,4.611-3.738,8.349-8.35,8.349h-13.355c-4.61,0-8.35-3.736-8.35-8.349V171.329z M189.216,171.329
                        c0-4.61,3.738-8.349,8.349-8.349h13.355c4.609,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.737,8.349-8.349,8.349h-13.355
                        c-4.61,0-8.349-3.736-8.349-8.349V171.329L189.216,171.329z M130.775,171.329c0-4.61,3.738-8.349,8.349-8.349h13.356
                        c4.61,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.738,8.349-8.349,8.349h-13.356c-4.61,0-8.349-3.736-8.349-8.349V171.329z"/>
                    <path d="M343.567,21.043h-88.535V4.305c0-2.377-1.927-4.305-4.305-4.305h-92.971c-2.377,0-4.304,1.928-4.304,4.305v16.737H64.916
                        c-7.125,0-12.9,5.776-12.9,12.901V74.47h304.451V33.944C356.467,26.819,350.692,21.043,343.567,21.043z"/>
                </g>
            </g>
        </svg>
    )
}

export interface Link {
    name: string
    host: string
    protocol: string
    icon: string
}

interface Dragging {
    is: boolean
    what: number
    x: number
}

interface MovedElements {
    movedElements: number[]
    direction: 'r'|'l'|null
}

const elementSize = 55
const imagePadding = 8
const elementsGap = 8
const maxLinksWidth = 994

const maxElements = Math.floor((maxLinksWidth + elementsGap) / (elementSize + elementsGap)) - (1 /* Trash */) - (2 /* Margin for animation */)

export default function Links() {
    const globalContext = useContext(GlobalContext)
    
    const setLinkMenu = globalContext.linkMenu[1]
    const [newLink, setNewLink] = globalContext.newLink

    const [dragging, setDragging] = useState<Dragging>({ what: NaN, is: false, x: NaN })
    const [movedElements, setMovedElements] = useState<MovedElements>({ movedElements: [], direction: null })
    const [overTrash, setOverTrash] = useState(false)
    const [links, setLinks] = useState<Link[]>([])

    const linksRef = useRef<HTMLDivElement>(null)
    const styleRef = useRef<HTMLStyleElement>(null)
    const draggingRef = useRef(dragging)
    const trashRef = useRef<HTMLDivElement>(null)

    function openMenu() {
        setLinkMenu(true)
    }

    useEffect(() => {
        draggingRef.current = dragging
    }, [dragging])

    useEffect(() => {
        if (newLink === null) return

        setLinks(prev => {
            const newLinks = [ ...prev, newLink ]
            updateLocalStorage(newLinks)
            return newLinks
        })
        setNewLink(null)
    }, [newLink])

    useEffect(() => {
        const newLinks = JSON.parse(localStorage.getItem('links') ?? '[]')
        setLinks(newLinks)
    }, [])

    const getUrl = (what: number) => {
        return links[what].protocol + '://' + links[what].host
    }

    function handleLinkPress(what: number) {
        const links = linksRef.current
        if (!links) return

        links.querySelectorAll('[data-icon="1"]')[what].animate([
            { transform: "translateY(0px)" },
            { transform: "translateY(-7px)" },
            { transform: "translateY(-9px)" },
            { transform: "translateY(-10px)" },
            { transform: "translateY(-9px)" },
            { transform: "translateY(-7px)" },
            { transform: "translateY(0px)" },
        ], {
            duration: 400,
            iterations: 1,
            easing: 'linear',
        })
    }

    function macosAnimation(e: MouseEvent) {
        if (draggingRef.current.is && !isNaN(draggingRef.current.what)) return

        const maxGrow = 10
        const maxDistanceToGrow = 100

        const links = linksRef.current
        if (!links) return

        const mouse = e.clientX

        links.querySelectorAll('[data-icon="1"], button, #trash').forEach(link => {
            const element = link as HTMLElement

            const elementRect = element.getBoundingClientRect()

            const elementWidth = elementRect.width
            const elementLeft = elementRect.left
            const elementRight = elementRect.right

            const leftDistance = Math.abs(elementLeft - mouse)
            const rightDistance = Math.abs(elementRight - mouse)

            const distance = (leftDistance <= elementWidth && rightDistance <= elementWidth) ? 0 : Math.min(leftDistance, rightDistance)

            const grow = Math.max(maxGrow - ((distance / maxDistanceToGrow) * maxGrow), 0)

            const newElementSize = elementSize + grow

            const rel = newElementSize / elementSize

            element.style.width = newElementSize + 'px'
            element.style.height = newElementSize + 'px'

            const img = element.children[0] as HTMLElement

            img.style.transform = `scale(${rel})`
        })
    }

    function resetMacosAnimation() {
        const links = linksRef.current
        if (!links) return

        links.querySelectorAll('[data-icon="1"], button, #trash').forEach(link => {
            const element = link as HTMLElement

            element.style.width = elementSize + 'px'
            element.style.height = elementSize + 'px'

            const img = element.children[0] as HTMLElement

            img.style.transform = ''
        })
    }

    useEffect(() => {
        const links = linksRef.current
        if (!links) return

        const parent = links.parentElement
        if (!parent) return

        parent.addEventListener('mouseover', macosAnimation)
        parent.addEventListener('mousemove', macosAnimation)
        parent.addEventListener('mouseleave', resetMacosAnimation)

        return () => {
            parent.removeEventListener('mouseover', macosAnimation)
            parent.removeEventListener('mousemove', macosAnimation)
            parent.removeEventListener('mouseleave', resetMacosAnimation)
        }
    }, [])

    function updateLocalStorage(links: Link[]) {
        const json = JSON.stringify(links)
        localStorage.setItem('links', json)
    }

    function isOverTrash(x: number) {
        const trash = trashRef.current
        if (!trash) return false

        const trashRect = trash.getBoundingClientRect()

        if (
            x <= trashRect.left + elementSize / 2
        &&
            x >= trashRect.left - elementSize / 2
        ) return true
        return false
    }

    function getMovedElements(x: number, what: number, links: HTMLElement): MovedElements {
        const movedElements: MovedElements["movedElements"] = []
        let direction: MovedElements["direction"] = null

        links.querySelectorAll('[data-icon="1"]').forEach(l => {
            const link = l as HTMLElement
            const index = Number(link.dataset.index)
            if (index === what) return

            const rect = (link.parentElement as HTMLElement).getBoundingClientRect()

            if (index < what) {
                if (x <= rect.left + elementSize / 2) {
                    movedElements.push(index)
                    direction = 'r'
                }
            } else {
                if (x >= rect.left - elementSize / 2) {
                    movedElements.push(index)
                    direction = 'l'
                }
            }
        })

        return { movedElements, direction }
    }

    function startDragging(e: React.MouseEvent, what: number) {
        if (e.button !== 0) return
        setDragging({ is: false, what, x: NaN })

        document.addEventListener('mousemove', drag)
        document.addEventListener('mouseup', stopDragging)
    }

    function drag(e: MouseEvent) {
        const { x, what } = draggingRef.current

        if (isNaN(x)) resetMacosAnimation()

        const links = (linksRef.current as HTMLElement)
        const linksRect = links.getBoundingClientRect()

        if (!styleRef.current) {
            styleRef.current = document.createElement("style")
            styleRef.current.innerHTML = `* { cursor: grabbing !important; }`
            document.head.appendChild(styleRef.current)
        }

        const newX = e.clientX - (elementSize / 2)

        const movedElements = getMovedElements(newX, what, links)

        const overTrash = isOverTrash(newX)

        setOverTrash(overTrash)
        setMovedElements(movedElements)
        setDragging(prev => {return { ...prev, is: true, x: Math.min(Math.max(newX - linksRect.left, 0), linksRect.width - elementSize) }})
    }

    function stopDragging(e: MouseEvent) {
        if (styleRef.current) {
            document.head.removeChild(styleRef.current)
            styleRef.current = null
        }

        if (isNaN(draggingRef.current.x)) {
            handleLinkPress(draggingRef.current.what)

            const url = getUrl(draggingRef.current.what)
            setTimeout(() => window.location.href = url, 100)
        }

        const links = (linksRef.current as HTMLElement)

        const newX = e.clientX - (elementSize / 2)

        const { movedElements, direction } = getMovedElements(newX, draggingRef.current.what, links)

        const overTrash = isOverTrash(newX)

        setLinks(prev => {
            if (overTrash) {
                const newLinks = [...prev.slice(0, draggingRef.current.what), ...prev.slice(draggingRef.current.what + 1)]
                updateLocalStorage(newLinks)
                return newLinks
            } else {
                const position = draggingRef.current.what
    
                let newPosition
                if (direction === 'r') {
                    newPosition = Math.min(...movedElements)
                } else if (direction === 'l') {
                    newPosition = Math.max(...movedElements)
                } else {
                    return prev
                }
    
                const newLinks = arrayMoveImmutable(prev, position, newPosition)
                updateLocalStorage(newLinks)
                return newLinks
            }
        })

        setOverTrash(false)
        setMovedElements({ movedElements: [], direction: null })
        setDragging({ what: NaN, is: false, x: NaN })

        document.removeEventListener('mousemove', drag)
        document.removeEventListener('mouseup', stopDragging)
    }

    function wheelClick(e: React.MouseEvent,what: number) {
        if (e.button !== 1) return

        handleLinkPress(what)
    }

    return (
        <div style={{ height: elementSize, minHeight: elementSize, maxHeight: elementSize, gap: elementsGap }} ref={linksRef} className='flex flex-row relative items-end justify-center select-none'>
            <div
                className='flex will-change-[width,height,transform] items-center justify-center bg-white rounded-lg transition-transform'
                style={{ width: elementSize, height: elementSize, minWidth: elementSize, minHeight: elementSize, transform: overTrash ? "scale(1.2)" : "scale(1)" }}
                draggable={false}
                id='trash'
                ref={trashRef}
            >
                <div
                    className='bg-gray-600 rounded-md flex justify-center items-center'
                    style={{
                        width: elementSize - imagePadding,
                        height: elementSize - imagePadding,
                    }}
                >
                    <Trash color="#FFFFFF" width={elementSize - imagePadding * 3} height={elementSize - imagePadding * 3} />
                </div>
            </div>
            {links.map(({ protocol, name, host, icon }, i) => {
                const beingDragged = dragging.is && dragging.what === i

                return (
                    <div key={i} style={{ width: beingDragged ? elementSize : undefined, height: beingDragged ? elementSize : undefined }}>
                        <a
                            data-icon="1"
                            data-index={i}
                            draggable={false}
                            onMouseDown={e => startDragging(e, i)}
                            onMouseUp={e => wheelClick(e, i)}
                            onClick={e => e.preventDefault()}
                            style={{
                                width: elementSize,
                                height: elementSize,
                                boxShadow: beingDragged ? '0 0 5px #606060' : undefined,
                                zIndex: beingDragged ? 10 : undefined,
                                position: beingDragged ? 'absolute' : undefined,
                                left: dragging.x || 0,
                                transform: movedElements.movedElements.includes(i) ? `translateX(${(elementSize + elementsGap) * (movedElements.direction === 'l' ? -1 : 1)}px)` : 'translateX(0px)',
                                transition: dragging.is ? '150ms transform' : undefined,
                            }}
                            title={name}
                            className='bg-white cursor-pointer rounded-lg flex justify-center will-change-[width,height,transform] items-center overflow-hidden'
                            href={beingDragged ? undefined : `${protocol}://${host}`}
                        >
                            <img
                                draggable={false}
                                width={elementSize - imagePadding}
                                height={elementSize - imagePadding}
                                className='rounded-md will-change-transform'
                                src={icon || `https://www.google.com/s2/favicons?sz=64&domain=${host}`}
                            />
                        </a>
                    </div>
                )
            })}
            <button
                draggable={false}
                onClick={openMenu}
                type='button'
                title='New'
                className='flex will-change-[width,height] items-center justify-center font-bold rounded-lg text-white bg-white overflow-hidden'
                style={{ width: elementSize, height: elementSize, display: links.length >= maxElements ? 'none' : undefined }}
            >
                <span draggable={false} style={{ width: elementSize - imagePadding, height: elementSize - imagePadding }} className='will-change-transform text-5xl rounded-md flex justify-center pb-[2px] items-center bg-gray-600'>+</span>
            </button>
        </div>
    )
}