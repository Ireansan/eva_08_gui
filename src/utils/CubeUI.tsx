import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { Group } from "three";

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

    const ref = useRef<Group>(new Group());
    useFrame((state, delta) => {
        if (handLandmarks.length > 0 && handLandmarks[0].length > 8) {
            ref.current!.position.x =
                (-handLandmarks[0][8].x + 1 / 2) * viewport.width;
            ref.current!.position.y =
                (-handLandmarks[0][8].y + 1 / 2) * viewport.height;
            ref.current!.position.z = 0;
        }

        // ref.current!.rotation.x += 0.01;
    });

    return (
        <group ref={ref}>
            <Box />
            {/* <Box position={[1, 0, 0]} />
            <Box position={[0, 1, 0]} />
            <Box position={[-1, 0, 0]} />
            <Box position={[0, -1, 0]} /> */}
        </group>
    );
}
