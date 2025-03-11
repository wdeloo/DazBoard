import { useContext, useEffect, useRef, useState } from 'react'
import { GlobalContext } from '../../context/global'
import { arrayMoveImmutable, arrayMoveMutable } from 'array-move'

export interface Link {
    name: string
    host: string
    protocol: string
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

export default function Links() {
    const [dragging, setDragging] = useState<Dragging>({ what: NaN, is: false, x: NaN })
    const [movedElements, setMovedElements] = useState<MovedElements>({ movedElements: [], direction: null })

    const globalContext = useContext(GlobalContext)

    const setLinkMenu = globalContext.linkMenu[1]
    const [newLink, setNewLink] = globalContext.newLink

    const linksRef = useRef<HTMLDivElement>(null)
    const styleRef = useRef<HTMLStyleElement>(null)

    const [links, setLinks] = useState<Link[]>([    { name: 'GitHub', host: 'github.com', protocol: 'https' },
        { name: 'YouTube', host: 'youtube.com', protocol: 'https' },
        { name: 'ChatGPT', host: 'chatgpt.com', protocol: 'https' },])

    const draggingRef = useRef(dragging)

    function openMenu() {
        setLinkMenu(true)
    }

    useEffect(() => {
        draggingRef.current = dragging
    }, [dragging])

    useEffect(() => {
        if (newLink === null) return

        setLinks(prev => [ ...prev, newLink ])
        setNewLink(null)
    }, [newLink])

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

        links.querySelectorAll('[data-icon="1"], button').forEach(link => {
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

        links.querySelectorAll('[data-icon="1"], button').forEach(link => {
            const element = link as HTMLElement

            element.style.width = elementSize + 'px'
            element.style.height = elementSize + 'px'

            const img = element.children[0] as HTMLImageElement | HTMLSpanElement

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

    function getMovedElements(newX: number, what: number, links: HTMLElement): MovedElements {
        const movedElements: MovedElements["movedElements"] = []
        let direction: MovedElements["direction"] = null

        links.querySelectorAll('[data-icon="1"]').forEach(l => {
            const link = l as HTMLElement
            const index = Number(link.dataset.index)
            if (index === what) return

            const rect = (link.parentElement as HTMLElement).getBoundingClientRect()

            if (index < what) {
                if (newX <= rect.left + elementSize / 2) {
                    movedElements.push(index)
                    direction = 'r'
                }
            } else {
                if (newX >= rect.left - elementSize / 2) {
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

        setMovedElements(movedElements)
        setDragging(prev => {return { ...prev, is: true, x: newX - linksRect.left }})
    }

    function stopDragging(e: MouseEvent) {
        if (styleRef.current) {
            document.head.removeChild(styleRef.current)
            styleRef.current = null
        }

        if (isNaN(draggingRef.current.x)) {
            handleLinkPress(draggingRef.current.what)
        }

        const links = (linksRef.current as HTMLElement)

        const newX = e.clientX - (elementSize / 2)

        const { movedElements, direction } = getMovedElements(newX, draggingRef.current.what, links)

        setLinks(prev => {
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
            return newLinks
        })

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
            {links.map(({ name, host }, i) => {
                const beingDragged = dragging.is && dragging.what === i

                return (
                    <div key={i} style={{ width: beingDragged ? elementSize : undefined, height: beingDragged ? elementSize : undefined }}>
                        <div
                            data-icon="1"
                            data-index={i}
                            draggable={false}
                            onMouseDown={e => startDragging(e, i)}
                            onMouseUp={e => wheelClick(e, i)}
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
                            className='bg-white cursor-pointer rounded-lg flex justify-center will-change-transform items-center overflow-hidden'
                        >
                            <img
                                draggable={false}
                                width={elementSize - imagePadding}
                                height={elementSize - imagePadding}
                                className='rounded-md will-change-transform'
                                src={`https://www.google.com/s2/favicons?sz=64&domain=${host}`}
                            />
                        </div>
                    </div>
                )
            })}
            <button draggable={false} onClick={openMenu} type='button' title='New' className='flex will-change-[width,height] items-center justify-center font-bold rounded-lg text-white bg-white overflow-hidden' style={{ width: elementSize, height: elementSize }}>
                <span draggable={false} style={{ width: elementSize - imagePadding, height: elementSize - imagePadding }} className='will-change-transform text-5xl rounded-md flex justify-center pb-[2px] items-center bg-gray-600'>+</span>
            </button>
        </div>
    )
}