import React from "react";

export default function WidgetContainer({ children, width, height, className }: {
    children: React.ReactNode,
    width?: number | string,
    height?: number | string,
    className?: string,
}) {
    return (
        <div style={{ width, height }} className={"bg-white bg-opacity-50 py-5 px-6 rounded text-center backdrop-blur-[10px]" + (className ? ` ${className}` : '')}>
            {children}
        </div>
    )
}