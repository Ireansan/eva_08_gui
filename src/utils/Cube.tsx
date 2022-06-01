import React from "react";
import { Canvas } from "@react-three/fiber";
import { NormalizedLandmarkListList, Results } from "@mediapipe/hands";
import { useSnapshot } from "valtio";

import { state } from "../state";

function Box({ ...props }) {
    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <mesh {...props}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"orange"} />
        </mesh>
    );
}

export function CubeUI() {
    const { ctx, handsData } = useSnapshot(state);

    const width: number = ctx.canvas.width;
    const height: number = ctx.canvas.height;
    const handLandmarks: NormalizedLandmarkListList =
        handsData.multiHandLandmarks;

    if (handLandmarks.length > 0 && handLandmarks[0].length > 8) {
        const [x, y, z] = [
            handLandmarks[0][8].x * width,
            handLandmarks[0][8].y * height,
            handLandmarks[0][8].z,
        ];

        return (
            <group>
                <Box position={[x, y, z]} />
            </group>
        );
    } else {
        return <></>;
    }
}
