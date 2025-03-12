import SpeedTest from '@cloudflare/speedtest'
import { useEffect, useRef, useState } from 'react'

interface Speed {
    upload?: number
    download?: number
    ping?: number
    jitter?: number
    packetLoss?: number
}

const defaulltValue = "- "

const bps2Mbps = (val?: number) => val !== undefined ? val / 1000000 : undefined
const formatMbps = (val?: number) => val !== undefined ? Math.round(val) : defaulltValue
const formatms = (val?: number) => val !== undefined ? Math.round(val) : defaulltValue
const formatPercent = (val?: number) => val !== undefined ? Math.round(val) : defaulltValue

function SpeedSvg({ height, width, loading }: { height?: number, width?: number, loading: boolean }) {
    const defaultRotate = -240
    const maxRotate = -59

    const defaultTransition = 5000
    const animationTransition = 500

    const [rotate, setRotate] = useState(defaultRotate)
    const [transition, setTransition] = useState(defaultTransition)

    const handRef = useRef<SVGPathElement>(null)

    function moveHandRandomly() {
        const range = [-80, maxRotate]

        setRotate(Math.floor(Math.random() * (range[1] - range[0])) + range[0])
    }

    useEffect(() => {
        let timeout: number, interval: number
        if (loading) {
            const hand = handRef.current
            if (!hand) return

            setRotate(maxRotate)
            timeout = setTimeout(() => {
                setTransition(animationTransition)
                interval = setInterval(moveHandRandomly, animationTransition)
            }, defaultTransition)
        } else {
            setRotate(defaultRotate)
            setTimeout(() => setTransition(defaultTransition), animationTransition)
        }

        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [loading])

    return (
        <svg style={{rotate: '44deg'}} height={height} width={width} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <circle style={{ fill: "#EFEFEF" }} cx="256" cy="256" r="245.106" />
            <g>
                <path style={{ fill: "#231F20" }} d="M256,102.285c6.015,0,10.894-4.877,10.894-10.894V54.468c0-6.017-4.878-10.894-10.894-10.894
		s-10.894,4.877-10.894,10.894v36.923C245.106,97.407,249.985,102.285,256,102.285z"/>
                <path style={{ fill: "#231F20" }} d="M102.286,256c0-6.017-4.878-10.894-10.894-10.894H54.468c-6.015,0-10.894,4.877-10.894,10.894
		c0,6.017,4.878,10.894,10.894,10.894h36.924C97.407,266.894,102.286,262.017,102.286,256z"/>
                <path style={{ fill: "#231F20" }} d="M107.998,328.871l-31.977,18.461c-5.21,3.008-6.996,9.67-3.987,14.881
		c2.019,3.495,5.679,5.448,9.445,5.448c1.848,0,3.721-0.471,5.436-1.461l31.977-18.461c5.21-3.008,6.996-9.67,3.987-14.881
		C119.87,327.648,113.209,325.862,107.998,328.871z"/>
                <path style={{ fill: "#231F20" }} d="M164.668,76.021c-3.009-5.209-9.669-6.996-14.881-3.987c-5.21,3.008-6.996,9.67-3.987,14.881
		l18.461,31.976c2.019,3.495,5.679,5.448,9.445,5.448c1.848,0,3.721-0.471,5.436-1.461c5.21-3.008,6.996-9.67,3.987-14.881
		L164.668,76.021z"/>
                <path style={{ fill: "#231F20" }} d="M118.892,164.262L86.915,145.8c-5.213-3.009-11.874-1.222-14.881,3.987
		c-3.009,5.21-1.223,11.873,3.987,14.881l31.977,18.461c1.716,0.991,3.588,1.461,5.436,1.461c3.765,0,7.427-1.953,9.445-5.448
		C125.888,173.932,124.102,167.269,118.892,164.262z"/>
                <path style={{ fill: "#231F20" }} d="M332.858,122.878c1.716,0.99,3.588,1.461,5.436,1.461c3.765,0,7.426-1.953,9.445-5.448L366.2,86.915
		c3.009-5.21,1.223-11.873-3.987-14.881c-5.212-3.009-11.872-1.223-14.881,3.987l-18.461,31.976
		C325.862,113.208,327.647,119.87,332.858,122.878z"/>
            </g>
            <path ref={handRef} style={{
                fill: "#de0000",
                transform: `rotate(${rotate}deg)`,
                transformOrigin: '50% 50%',
                transitionDuration: transition + 'ms',
            }} className='will-change-transform transition-transform ease-in-out' d="M267.385,299.566c-24.062,0.421-43.908-18.746-44.328-42.808
c-0.421-24.062,18.746-43.908,42.808-44.328c24.062-0.419,191.668,40.236,191.668,40.236S291.447,299.146,267.385,299.566z"/>
        </svg>
    )
}

export default function Speedtest() {
    const [speed, setSpeed] = useState<Speed>({})
    const [loading, setLoading] = useState(false)

    function testSpeed() {
        setLoading(true)
        new SpeedTest().onFinish = results => {
            const { upload, download, latency, jitter, packetLoss } = results.getSummary()

            setSpeed({ upload: bps2Mbps(upload), download: bps2Mbps(download), ping: latency, jitter, packetLoss })
            setLoading(false)
        }
    }

    return (
        <div className='flex flex-col h-full gap-4'>
            <div className='flex text-2xl font-medium justify-evenly flex-row items-center'>
                <button onClick={testSpeed} type='button' className='rounded-full overflow-hidden cursor-pointer'>
                    <SpeedSvg loading={loading} width={80} height={80} />
                </button>
                <div className='flex flex-col'>Download: <span className='font-semibold'>{formatMbps(speed.download)}Mb/s</span></div>
                <div className='flex flex-col'>Upload: <span className='font-semibold'>{formatMbps(speed.upload)}Mb/s</span></div>
            </div>
            <div className='flex flex-row justify-between text-lg font-medium'>
                <span><span className='text-neutral-600 font-normal'>🏓 Ping:</span> {formatms(speed.ping)}ms</span>
                <span><span className='text-neutral-600 font-normal'>📉 Jitter:</span> {formatms(speed.jitter)}ms</span>
                <span><span className='text-neutral-600 font-normal'>📦 Packet Loss:</span> {formatPercent(speed.packetLoss)}%</span>
            </div>
        </div>
    )
}