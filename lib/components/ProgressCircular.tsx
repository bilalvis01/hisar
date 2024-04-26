import React from "react";
import clsx from "clsx";

type Size = "sm" | "md" | "lg";

export default function ProgressCircular({ size = "lg" }: { size?: Size }) {
    return (
        <svg className={clsx("progress-circular", { small: size === "sm" })} fill="currentColor">
            <circle className="track" />
            <circle className="active-indicator" /> 
        </svg>
    );
}