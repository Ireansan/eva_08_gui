import React from "react";
import { useThree } from "@react-three/fiber";
import { useSnapshot } from "valtio";

import { state } from "../state";

function Box({ ...props }) {
    return (
        <mesh {...props}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"orange"} />
        </mesh>
    );
}

export function CubeUI() {
    const { handLandmarks } = useSnapshot(state);
    const viewport = useThree((state) => state.viewport);

    if (handLandmarks.length > 0 && handLandmarks[0].length > 8) {
        const [x, y, z] = [
            (-handLandmarks[0][8].x + 1 / 2) * viewport.width,
            (-handLandmarks[0][8].y + 1 / 2) * viewport.height,
            0,
        ];

        return (
            <group>
                <Box position={[x, y, z]} />
                {/* <Box position={[1, 0, 0]} />
                <Box position={[0, 1, 0]} />
                <Box position={[-1, 0, 0]} />
                <Box position={[0, -1, 0]} /> */}
            </group>
        );
    } else {
        return <></>;
    }
}
